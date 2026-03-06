import { NextResponse } from 'next/server'
import { openai } from '@/lib/openai/config'
import { createClient } from '@/lib/supabase/server'
import { getPatientIdFromProfileId } from '@/lib/supabase/appointments'
import { getActivePlanForPatient } from '@/lib/supabase/plans'
import { getChatHistory, getDailyUsage, incrementUsage } from '@/lib/supabase/chat'
import { MEAL_SLOT_LABELS, NutritionPlan } from '@/types'
import { getDayName, getCurrentDayOfWeek } from '@/lib/utils/dates'

function buildSystemPrompt(plan: NutritionPlan | null, patientName: string): string {
    const today = getCurrentDayOfWeek()
    const todayMeals = plan?.meals?.filter(m => m.day_of_week === today) ?? []

    return `
Sos el asistente de nutrición de ${patientName} en NutriApp.

Tu función es educativa y de apoyo. Podés ayudar con:
- Valor nutricional de alimentos (calorías, proteínas, carbohidratos, grasas)
- Interpretar etiquetas nutricionales de productos envasados
- Sugerir sustituciones de alimentos dentro del plan
- Ideas de recetas o preparaciones saludables
- Dudas sobre el plan nutricional asignado

NO podés:
- Responder preguntas médicas que no estén relacionadas con el plan. Si te preguntan algo médico, decí: "Esa pregunta requiere evaluación profesional. Te recomiendo consultarla con tu nutricionista en la próxima consulta."
- Modificar ni sugerir cambios al plan asignado. Solo podés explicar lo que ya está en el plan.

${plan ? `
Plan nutricional vigente de ${patientName}:
Nombre del plan: ${plan.name}
${plan.target_calories ? `Objetivo calórico: ${plan.target_calories} kcal/día` : ''}

Menú de hoy (${getDayName(today)}):
${todayMeals.map(meal =>
        `- ${MEAL_SLOT_LABELS[meal.meal_slot]}: ${meal.dishes?.map(d => d.name).join(', ') || 'Sin platos'}`
    ).join('\n')}
` : 'El paciente no tiene un plan nutricional asignado actualmente.'}

IMPORTANTE: Siempre terminá tus respuestas con esta línea separada:
"⚕️ Recordá que soy un asistente de apoyo y no reemplazo la consulta con tu nutricionista."

Respondé siempre en español, con un tono amigable y claro. Sé conciso.
  `.trim()
}

export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const patientId = await getPatientIdFromProfileId(user.id)
    if (!patientId) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

    try {
        const { message, image_url } = await request.json()

        // Control de límite diario
        const usage = await getDailyUsage(patientId)
        if (usage.remaining <= 0) {
            return NextResponse.json({
                error: 'Límite diario alcanzado. Podés continuar mañana.'
            }, { status: 429 })
        }

        const plan = await getActivePlanForPatient(patientId)
        const history = await getChatHistory(patientId, 10)

        const messages: any[] = [
            { role: 'system', content: buildSystemPrompt(plan, profile?.full_name || 'Paciente') }
        ]

        history.forEach(msg => {
            messages.push({ role: msg.role, content: msg.content })
        })

        const userContent: any[] = [{ type: 'text', text: message || '¿Qué podés decirme sobre esto?' }]
        if (image_url) {
            userContent.push({ type: 'image_url', image_url: { url: image_url, detail: 'low' } })
        }

        messages.push({ role: 'user', content: userContent })

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            stream: true,
            max_tokens: 800,
        })

        // Guardar mensaje del usuario
        await supabase.from('ai_chat_messages').insert({
            patient_id: patientId,
            role: 'user',
            content: message || '',
            image_url: image_url || null
        })

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder()
                let assistantContent = ''

                for await (const chunk of response) {
                    const content = chunk.choices[0]?.delta?.content || ''
                    assistantContent += content
                    controller.enqueue(encoder.encode(content))
                }

                // Guardar respuesta del asistente
                await supabase.from('ai_chat_messages').insert({
                    patient_id: patientId,
                    role: 'assistant',
                    content: assistantContent
                })

                // Incrementar uso (actualizaciones finales del stream)
                await incrementUsage(patientId)

                controller.close()
            },
        })

        return new Response(stream)
    } catch (error: any) {
        console.error('Chat error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}

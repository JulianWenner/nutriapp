import { createClient } from './server'
import { ChatMessage, AIUsage } from '@/types'

// Obtener historial de mensajes de un paciente
export async function getChatHistory(patientId: string, limit = 20): Promise<ChatMessage[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true })
        .limit(limit)

    if (error) throw error
    return data || []
}

// Verificar y obtener uso del día
export async function getDailyUsage(patientId: string): Promise<AIUsage> {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('patient_id', patientId)
        .eq('date', today)
        .single()

    const limit = parseInt(process.env.AI_DAILY_MESSAGE_LIMIT || '50')
    const count = data ? data.message_count : 0

    return {
        date: today,
        message_count: count,
        limit: limit,
        remaining: Math.max(0, limit - count)
    }
}

// Incrementar contador de uso
export async function incrementUsage(patientId: string): Promise<void> {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    // Upsert para incrementar el contador de uso diario
    const { error } = await supabase.rpc('increment_ai_usage', {
        p_patient_id: patientId,
        p_date: today
    })

    // Si no hay función RPC, intentar upsert manual (nota: rpc es mejor para evitar condiciones de carrera)
    if (error) {
        const { data: current } = await supabase
            .from('ai_usage')
            .select('message_count')
            .eq('patient_id', patientId)
            .eq('date', today)
            .single()

        const { error: upsertError } = await supabase
            .from('ai_usage')
            .upsert({
                patient_id: patientId,
                date: today,
                message_count: (current?.message_count || 0) + 1
            }, { onConflict: 'patient_id,date' })

        if (upsertError) throw upsertError
    }
}

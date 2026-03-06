import { createClient } from './server'
import { MealAdherence, PlanMeal, AdherenceSummary } from '@/types'
import { format, startOfWeek, getDay } from 'date-fns'

// Obtener adherencia de una semana para un paciente
export async function getWeekAdherence(
    patientId: string,
    weekStart: string    // YYYY-MM-DD lunes de la semana
): Promise<MealAdherence[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('meal_adherence')
        .select('*')
        .eq('patient_id', patientId)
        .eq('week_start', weekStart)

    if (error) throw error
    return data || []
}

// Marcar/desmarcar una comida como cumplida
export async function upsertAdherence(data: {
    patient_id: string
    plan_meal_id: string
    week_start: string
    completed: boolean
    comment?: string
}): Promise<MealAdherence> {
    const supabase = createClient()

    const upsertData: any = {
        patient_id: data.patient_id,
        plan_meal_id: data.plan_meal_id,
        week_start: data.week_start,
        completed: data.completed,
        updated_at: new Date().toISOString()
    }

    if (data.completed) {
        upsertData.completed_at = new Date().toISOString()
    } else {
        upsertData.completed_at = null
    }

    if (data.comment !== undefined) {
        upsertData.comment = data.comment
    }

    const { data: result, error } = await supabase
        .from('meal_adherence')
        .upsert(upsertData, { onConflict: 'patient_id,plan_meal_id,week_start' })
        .select()
        .single()

    if (error) throw error
    return result
}

// Calcular resumen de adherencia semanal
export function calculateAdherenceSummary(
    adherence: MealAdherence[],
    planMeals: PlanMeal[]
): AdherenceSummary {
    const totalMeals = planMeals.length
    const completedMeals = adherence.filter(a => a.completed).length
    const percentage = totalMeals > 0 ? (completedMeals / totalMeals) * 100 : 0

    constByDay = [1, 2, 3, 4, 5, 6, 7].map(day => {
        const dayPlanMeals = planMeals.filter(pm => pm.day_of_week === day)
        const dayMealIds = dayPlanMeals.map(pm => pm.id)
        const dayAdherence = adherence.filter(a => dayMealIds.includes(a.plan_meal_id) && a.completed)

        const dayTotal = dayPlanMeals.length
        const dayCompleted = dayAdherence.length
        const dayPercentage = dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0

        return {
            day_of_week: day,
            total: dayTotal,
            completed: dayCompleted,
            percentage: Math.round(dayPercentage)
        }
    })

    return {
        total_meals: totalMeals,
        completed_meals: completedMeals,
        percentage: Math.round(percentage),
        by_day: constByDay
    }
}

// Obtener comentarios recientes de un paciente (para la nutricionista)
export async function getRecentComments(patientId: string, limit = 10) {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('meal_adherence')
        .select(`
      *,
      plan_meals (
        meal_slot,
        day_of_week,
        dishes (
          name
        )
      )
    `)
        .eq('patient_id', patientId)
        .not('comment', 'is', null)
        .neq('comment', '')
        .order('updated_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data || []
}

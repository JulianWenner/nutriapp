import { createClient } from '@/lib/supabase/server'
import type { NutritionPlan } from '@/types'

/** Obtener la lista de todos los planes de la nutricionista */
export async function getPlans(): Promise<NutritionPlan[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('nutrition_plans')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('getPlans:', error)
        return []
    }

    return data as NutritionPlan[]
}

/** Obtener un plan entero con sus comidas y los platos cacheados */
export async function getPlanWithMeals(planId: string): Promise<NutritionPlan | null> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('nutrition_plans')
        .select(`
            *,
            meals:plan_meals (
                *
            )
        `)
        .eq('id', planId)
        .single()

    if (error) {
        console.error('getPlanWithMeals:', error)
        return null
    }

    const plan = data as NutritionPlan

    // Because "dishes" inside plan_meals involves a many-to-many relationship via an array "dish_ids",
    // Supabase standard joins over array columns can be tricky. We resolve the dishes manually if they exist.
    if (plan.meals && plan.meals.length > 0) {
        // Recopila todos los IDs de platos únicos que se usan en las comidas del plan
        const allDishIds = Array.from(new Set(plan.meals.flatMap(m => m.dish_ids || [])))

        if (allDishIds.length > 0) {
            const { data: dishesData } = await supabase
                .from('dishes')
                .select('*')
                .in('id', allDishIds)

            if (dishesData) {
                // Populate the meals with their respective dishes array mapped from IDs
                plan.meals = plan.meals.map(meal => {
                    const mappedDishes = meal.dish_ids.map(
                        id => dishesData.find(d => d.id === id)
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ).filter(Boolean) as any[]

                    return { ...meal, dishes: mappedDishes }
                })
            }
        }
    }

    return plan
}

/** 
 * Guarda un plan nutricional entero. 
 * Realiza un upsert en nutrition_plans y reconstruye (borra y crea) los plan_meals.
 */
export async function savePlan(planData: Partial<NutritionPlan>): Promise<NutritionPlan | null> {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return null

    const isUpdate = !!planData.id

    const upsertPayload = {
        name: planData.name,
        target_calories: planData.target_calories ?? null,
        target_protein: planData.target_protein ?? null,
        target_carbs: planData.target_carbs ?? null,
        target_fat: planData.target_fat ?? null,
        created_by: userData.user.id,
        updated_at: new Date().toISOString()
    }

    let plan: NutritionPlan | null = null

    if (isUpdate && planData.id) {
        const { data, error } = await supabase
            .from('nutrition_plans')
            .update(upsertPayload)
            .eq('id', planData.id)
            .select()
            .single()

        if (error) throw new Error(error.message)
        plan = data as NutritionPlan

        // Limpiar comidas viejas
        await supabase.from('plan_meals').delete().eq('plan_id', plan.id)
    } else {
        const { data, error } = await supabase
            .from('nutrition_plans')
            .insert(upsertPayload)
            .select()
            .single()

        if (error) throw new Error(error.message)
        plan = data as NutritionPlan
    }

    if (!plan) return null

    // 2. Insertar comidas
    if (planData.meals && planData.meals.length > 0) {
        // Solo las franjas que tengan algún plato
        const validMeals = planData.meals.filter(m => m.dish_ids && m.dish_ids.length > 0)

        if (validMeals.length > 0) {
            const mealsPayload = validMeals.map(m => ({
                plan_id: (plan as NutritionPlan).id,
                day_of_week: m.day_of_week,
                meal_slot: m.meal_slot,
                dish_ids: m.dish_ids,
            }))

            const { error: mealsErr } = await supabase
                .from('plan_meals')
                .insert(mealsPayload)

            if (mealsErr) {
                console.error('savePlan (meals):', mealsErr)
                throw new Error(mealsErr.message)
            }
        }
    }

    return getPlanWithMeals(plan.id)
}

/** Asignar un plan a un paciente (invalidando/desactivando anteriores si aplica) */
export async function assignPlanToPatient(planId: string, patientId: string): Promise<void> {
    const supabase = createClient()

    // Desactivar el plan activo anterior del paciente
    await supabase
        .from('plan_assignments')
        .update({ active: false })
        .eq('patient_id', patientId)
        .eq('active', true)

    // Insertar la nueva asignación
    const { error } = await supabase
        .from('plan_assignments')
        .insert({
            plan_id: planId,
            patient_id: patientId,
            active: true
        })

    if (error) throw new Error(error.message)
}

/** Obtener el plan nutricional activo de un paciente */
export async function getActivePlanForPatient(patientId: string): Promise<NutritionPlan | null> {
    const supabase = createClient()
    const { data: assignData, error: assignErr } = await supabase
        .from('plan_assignments')
        .select('plan_id')
        .eq('patient_id', patientId)
        .eq('active', true)
        .single()

    if (assignErr || !assignData) return null

    return getPlanWithMeals(assignData.plan_id)
}

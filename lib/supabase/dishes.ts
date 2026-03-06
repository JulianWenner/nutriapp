import { createClient } from '@/lib/supabase/server'
import type { Dish, DishIngredient } from '@/types'

/** Obtener lista de platos de la biblioteca (opcional: filtrar por tag) */
export async function getDishes(tag?: string): Promise<Dish[]> {
    const supabase = createClient()

    let query = supabase
        .from('dishes')
        .select('*')
        .order('created_at', { ascending: false })

    if (tag) {
        // En UI, si se pasa "Todos", no pasamos el param
        query = query.eq('tag', tag)
    }

    const { data, error } = await query

    if (error) {
        console.error('getDishes:', error)
        return []
    }

    return data as Dish[]
}

/** Obtener plato entero para el modo editor con sus ingredientes y macros cacheados */
export async function getDishWithIngredients(dishId: string): Promise<Dish | null> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('dishes')
        .select(`
            *,
            ingredients:dish_ingredients (
                *,
                food:foods(*),
                portion:portions(*)
            )
        `)
        .eq('id', dishId)
        .single()

    if (error) {
        console.error('getDishWithIngredients:', error)
        return null
    }

    return data as Dish
}

/** Guardar un plato de 0, o actualizar uno existente reemplazando ingredientes */
export async function saveDish(dishData: Omit<Dish, 'id' | 'ingredients'> & { id?: string }, ingredients: Omit<DishIngredient, 'id' | 'dish_id' | 'food' | 'portion'>[]): Promise<Dish | null> {
    const supabase = createClient()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return null

    // 1. Upsert la entidad Plato
    const isUpdate = !!dishData.id

    const upsertPayload = {
        ...dishData,
        created_by: userData.user.id,
        updated_at: new Date().toISOString()
    }

    let dish: Dish | null = null

    if (isUpdate) {
        const { data, error } = await supabase
            .from('dishes')
            .update(upsertPayload)
            .eq('id', dishData.id as string)
            .select()
            .single()

        if (error) throw new Error(error.message)
        dish = data as Dish

        // Borrar ingredientes previos (bulk replace)
        await supabase.from('dish_ingredients').delete().eq('dish_id', dish.id)
    } else {
        const { data, error } = await supabase
            .from('dishes')
            .insert(upsertPayload)
            .select()
            .single()

        if (error) throw new Error(error.message)
        dish = data as Dish
    }

    if (!dish) return null

    // 2. Insertar ingredientes nuevos
    if (ingredients && ingredients.length > 0) {
        const ingredientsPayload = ingredients.map(ing => ({
            ...ing,
            dish_id: (dish as Dish).id
        }))

        const { error: ingErr } = await supabase
            .from('dish_ingredients')
            .insert(ingredientsPayload)

        if (ingErr) {
            console.error('saveDish (ingredients):', ingErr)
            throw new Error(ingErr.message)
        }
    }

    // Return the updated dish (we could select it entirely again if needed, but returning shallow is fine)
    return getDishWithIngredients(dish.id)
}

/** Eliminar un plato */
export async function deleteDish(dishId: string): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', dishId)

    if (error) {
        console.error('deleteDish:', error)
        return false
    }
    return true
}

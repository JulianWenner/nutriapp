import { createClient } from '@/lib/supabase/server'
import type { Food, Portion } from '@/types'

/** Buscar alimentos por nombre (ilike) */
export async function searchFoods(query: string): Promise<Food[]> {
    if (!query.trim()) return []

    const supabase = createClient()
    const { data, error } = await supabase
        .from('foods')
        .select(`
            *,
            portions (*)
        `)
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true })
        .limit(20)

    if (error) {
        console.error('searchFoods:', error)
        return []
    }

    // Cast the mapped data to match Food[] signature
    return (data ?? []).map((row: any) => ({
        ...row,
        portions: row.portions || []
    })) as Food[]
}

/** Obtener un alimento específico con sus porciones */
export async function getFoodWithPortions(foodId: string): Promise<Food | null> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('foods')
        .select(`
            *,
            portions (*)
        `)
        .eq('id', foodId)
        .single()

    if (error) {
        console.error('getFoodWithPortions:', error)
        return null
    }

    return {
        ...data,
        portions: data.portions || []
    } as Food
}

/** 
 * Crear un alimento personalizado. 
 * Requiere que se llame desde un contexto de nutricionista autenticado.
 */
export async function createFood(
    data: Omit<Food, 'id' | 'is_public' | 'portions'>,
    portions?: Omit<Portion, 'id' | 'food_id'>[]
): Promise<Food | null> {
    const supabase = createClient()

    // Obtener UID
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return null

    // 1. Insertar Food
    const { data: food, error: foodErr } = await supabase
        .from('foods')
        .insert({
            ...data,
            created_by: userData.user.id,
            is_public: false // Custom foods from UI default to private (for now)
        })
        .select()
        .single()

    if (foodErr || !food) {
        console.error('createFood:', foodErr)
        return null
    }

    // 2. Insertar Portions en paralelo si hay
    let createdPortions: Portion[] = []
    if (portions && portions.length > 0) {
        const { data: portionsData, error: portErr } = await supabase
            .from('portions')
            .insert(portions.map(p => ({
                ...p,
                food_id: food.id,
                created_by: userData.user?.id
            })))
            .select()

        if (portErr) {
            console.error('createFood (portions):', portErr)
        } else if (portionsData) {
            createdPortions = portionsData as Portion[]
        }
    }

    return {
        ...food,
        portions: createdPortions,
    } as Food
}

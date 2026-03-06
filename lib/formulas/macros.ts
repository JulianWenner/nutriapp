import type { Food, DishIngredient, PlanMeal, MacroSummary } from '@/types'

/** Redondea un número a 1 decimal */
function round(n: number): number {
    return Math.round(n * 10) / 10
}

/** 
 * Calcula los macros individuales de un ingrediente en base al alimento,
 * la porción (weightGrams = portion.weight_grams * quantity)
 */
export function calculateIngredientMacros(
    food: Food,
    weightGrams: number
): MacroSummary {
    const factor = weightGrams / 100
    return {
        calories: round(food.calories_per_100g * factor),
        protein: round(food.protein_per_100g * factor),
        carbs: round(food.carbs_per_100g * factor),
        fat: round(food.fat_per_100g * factor),
        fiber: round(food.fiber_per_100g * factor),
    }
}

/**
 * Suma los macros de todos los ingredientes de un plato
 */
export function calculateDishMacros(ingredients: DishIngredient[]): MacroSummary {
    return ingredients.reduce((acc, ing) => ({
        calories: round(acc.calories + ing.calories),
        protein: round(acc.protein + ing.protein),
        carbs: round(acc.carbs + ing.carbs),
        fat: round(acc.fat + ing.fat),
        fiber: round(acc.fiber + ing.fiber),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
}

/**
 * Suma los macros de todas las comidas (plan_meals) de un día en particular.
 * Asume que el join de meals populó field "dishes" resolviendo los "dish_ids".
 */
export function calculateDayMacros(meals: PlanMeal[]): MacroSummary {
    return meals.reduce((accDay, meal) => {
        if (!meal.dishes || meal.dishes.length === 0) return accDay

        const mealMacros = meal.dishes.reduce((accMeal, dish) => ({
            calories: accMeal.calories + dish.total_calories,
            protein: accMeal.protein + dish.total_protein,
            carbs: accMeal.carbs + dish.total_carbs,
            fat: accMeal.fat + dish.total_fat,
            fiber: accMeal.fiber + dish.total_fiber,
        }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })

        return {
            calories: round(accDay.calories + mealMacros.calories),
            protein: round(accDay.protein + mealMacros.protein),
            carbs: round(accDay.carbs + mealMacros.carbs),
            fat: round(accDay.fat + mealMacros.fat),
            fiber: round(accDay.fiber + mealMacros.fiber),
        }
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 })
}

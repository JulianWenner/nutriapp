import React from 'react'
import type { DishIngredient } from '@/types'
import { calculateIngredientMacros } from '@/lib/formulas/macros'

interface IngredientRowProps {
    ingredient: DishIngredient
    onRemove: () => void
}

export default function IngredientRow({ ingredient, onRemove }: IngredientRowProps) {
    const food = ingredient.food

    // Fallback if food is missing for some reason
    if (!food) {
        return (
            <div className="flex justify-between items-center py-3 border-b border-slate-100 last:border-0 text-red-500">
                Alimento no encontrado
            </div>
        )
    }

    const { calories, protein, carbs, fat } = calculateIngredientMacros(food, ingredient.weight_grams)

    return (
        <div className="flex gap-3 py-3 border-b border-slate-100 last:border-0 items-center hover:bg-slate-50/50 rounded-lg px-2 -mx-2 transition-colors group">
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-800 text-sm truncate">{food.name}</h4>
                <div className="text-xs mt-0.5 flex items-center flex-wrap gap-x-2 text-slate-500">
                    <span className="font-medium text-slate-700">
                        {ingredient.portion
                            ? `${ingredient.quantity}x ${ingredient.portion.name}`
                            : `${ingredient.weight_grams}g`
                        }
                    </span>
                    <span className="opacity-40">•</span>
                    <span>{ingredient.weight_grams}g</span>
                    <span className="opacity-40">•</span>
                    <span className="text-[10px]">P:{protein} C:{carbs} G:{fat}</span>
                </div>
            </div>

            <div className="text-right flex-shrink-0 flex items-center gap-3">
                <span className="font-bold text-teal-700 text-base">{calories} <span className="text-[10px] font-normal text-slate-500">kcal</span></span>

                <button
                    onClick={onRemove}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Eliminar ingrediente"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

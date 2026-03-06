import React from 'react'
import type { MealSlot, Dish } from '@/types'
import { MEAL_SLOT_LABELS } from '@/types'
import DishCard from '@/components/dishes/DishCard'

interface MealSlotSectionProps {
    slot: MealSlot
    dishes: Dish[]
    onAddDish: (slot: MealSlot) => void
    onRemoveDish: (slot: MealSlot, dishIndexToRemove: number) => void
}

export default function MealSlotSection({ slot, dishes, onAddDish, onRemoveDish }: MealSlotSectionProps) {
    const title = MEAL_SLOT_LABELS[slot]
    const isEmpty = dishes.length === 0

    // Sumary of slot
    const slotKcal = dishes.reduce((sum, d) => sum + d.total_calories, 0)

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center space-x-3">
                    <h4 className="font-bold text-slate-800">{title}</h4>
                    {!isEmpty && (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {slotKcal} kcal
                        </span>
                    )}
                </div>
                <button
                    onClick={() => onAddDish(slot)}
                    className="flex items-center space-x-1 text-teal-600 hover:text-teal-700 text-sm font-bold bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-full transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Plato</span>
                </button>
            </div>

            {isEmpty ? (
                <div
                    onClick={() => onAddDish(slot)}
                    className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-teal-600 hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer"
                >
                    <span className="text-sm font-medium">Vacío</span>
                </div>
            ) : (
                <div className="space-y-3">
                    {dishes.map((dish, i) => (
                        <div key={`${dish.id}-${i}`} className="relative group">
                            <DishCard dish={dish} />

                            {/* Overlay remove button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onRemoveDish(slot, i); }}
                                className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                                title="Quitar plato"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

import React from 'react'
import type { Food } from '@/types'

interface FoodCardProps {
    food: Food
    onClick?: () => void
    isSelected?: boolean
}

export default function FoodCard({ food, onClick, isSelected }: FoodCardProps) {
    return (
        <div
            onClick={onClick}
            className={`
                p-3 rounded-xl border transition-all cursor-pointer
                ${isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-sm ring-1 ring-teal-500'
                    : 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm'}
            `}
        >
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-semibold text-slate-800 text-sm">{food.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {food.source === 'usda' ? 'USDA' : food.source === 'sara' ? 'SARA' : 'Personalizado'}
                    </p>
                </div>
                <div className="text-right">
                    <span className="block font-bold text-teal-700 text-sm">
                        {food.calories_per_100g} <span className="text-[10px] font-normal text-slate-500">kcal/100g</span>
                    </span>
                    <span className="text-[10px] text-slate-500">P:{food.protein_per_100g} C:{food.carbs_per_100g} G:{food.fat_per_100g}</span>
                </div>
            </div>
        </div>
    )
}

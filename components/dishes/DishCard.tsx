import React from 'react'
import type { Dish } from '@/types'
import MacroPill from '@/components/ui/MacroPill'
import { TAG_LABELS } from '@/types'

interface DishCardProps {
    dish: Dish
    onClick?: () => void
    actionButton?: React.ReactNode
}

export default function DishCard({ dish, onClick, actionButton }: DishCardProps) {
    const tagName = dish.tag ? (TAG_LABELS[dish.tag] || dish.tag) : 'Sin etiqueta'

    return (
        <div
            onClick={onClick}
            className={`
                p-4 bg-white rounded-2xl border border-slate-200 
                ${onClick ? 'cursor-pointer hover:border-teal-300 hover:shadow-md transition-all' : ''}
            `}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-2">
                    <h3 className="font-bold text-slate-800 text-base leading-tight">{dish.name}</h3>
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded">
                        {tagName}
                    </span>
                </div>
                {actionButton && (
                    <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                        {actionButton}
                    </div>
                )}
            </div>

            {/* Macros */}
            <div className="flex flex-wrap gap-2 mt-4">
                <div className="bg-teal-50 text-teal-800 px-2 py-1 rounded-md text-xs font-black mr-2">
                    {dish.total_calories} kcal
                </div>
                <MacroPill label="P" value={dish.total_protein} />
                <MacroPill label="C" value={dish.total_carbs} />
                <MacroPill label="G" value={dish.total_fat} />
            </div>
        </div>
    )
}

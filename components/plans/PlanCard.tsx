import React from 'react'
import type { NutritionPlan } from '@/types'

interface PlanCardProps {
    plan: NutritionPlan
    onClick?: () => void
    assignedCount?: number
}

export default function PlanCard({ plan, onClick, assignedCount }: PlanCardProps) {
    const hasGoals = plan.target_calories || plan.target_protein || plan.target_carbs || plan.target_fat

    return (
        <div
            onClick={onClick}
            className={`
                p-4 bg-white rounded-2xl border border-slate-200 
                ${onClick ? 'cursor-pointer hover:border-teal-300 hover:shadow-md transition-all' : ''}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-slate-800 text-lg">{plan.name}</h3>
                {assignedCount !== undefined && (
                    <span className="flex items-center space-x-1 px-2 py-1 bg-teal-50 text-teal-700 text-xs font-bold rounded-lg pointer-events-none">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        <span>{assignedCount}</span>
                    </span>
                )}
            </div>

            {hasGoals ? (
                <div className="flex items-center space-x-3 mt-4 text-sm text-slate-600">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Objetivo</span>
                        <span className="font-black text-teal-700">{plan.target_calories || '—'} kcal</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div className="flex space-x-3 text-xs">
                        <span>P: <strong className="text-slate-800">{plan.target_protein || '-'}g</strong></span>
                        <span>C: <strong className="text-slate-800">{plan.target_carbs || '-'}g</strong></span>
                        <span>G: <strong className="text-slate-800">{plan.target_fat || '-'}g</strong></span>
                    </div>
                </div>
            ) : (
                <p className="text-sm text-slate-500 mt-2 italic">Sin macros objetivo definidos.</p>
            )}
        </div>
    )
}

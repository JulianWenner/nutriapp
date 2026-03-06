import React from 'react'
import type { MacroSummary } from '@/types'

interface DayMacroBarProps {
    dayMacros: MacroSummary
    targetCalories?: number
}

export default function DayMacroBar({ dayMacros, targetCalories }: DayMacroBarProps) {
    const { calories, protein, carbs, fat } = dayMacros

    let kcalPercent = 0
    if (targetCalories && targetCalories > 0) {
        kcalPercent = Math.min((calories / targetCalories) * 100, 100)
    }

    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm sticky top-4 z-10">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total del día</span>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-black text-teal-800">{calories || 0}</span>
                        <span className="text-sm font-bold text-slate-500">kcal</span>
                    </div>
                </div>

                {targetCalories && (
                    <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Objetivo</span>
                        <div className="text-sm font-bold text-slate-700">{targetCalories} kcal</div>
                    </div>
                )}
            </div>

            {targetCalories && (
                <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${calories > targetCalories ? 'bg-orange-500' : 'bg-teal-500'
                            }`}
                        style={{ width: `${kcalPercent}%` }}
                    />
                </div>
            )}

            <div className="flex justify-between text-xs font-medium text-slate-600 mt-2">
                <span>P: {protein || 0}g</span>
                <span>C: {carbs || 0}g</span>
                <span>G: {fat || 0}g</span>
            </div>
        </div>
    )
}

import React from 'react'
import type { MacroSummary } from '@/types'

interface MacroSummaryCardProps {
    summary: MacroSummary
    title?: string
    targetCalories?: number
}

export default function MacroSummaryCard({
    summary,
    title = 'Total Calculado',
    targetCalories
}: MacroSummaryCardProps) {
    const { calories, protein, carbs, fat, fiber } = summary

    // A simple progress bar if target is provided
    let kcalPercent = 0
    if (targetCalories && targetCalories > 0) {
        kcalPercent = Math.min((calories / targetCalories) * 100, 100)
    }

    return (
        <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-5 text-white shadow-lg shadow-teal-700/20">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-teal-100 text-xs font-bold uppercase tracking-wider mb-1">{title}</h3>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-4xl font-black">{calories}</span>
                        <span className="text-teal-200 text-sm font-medium">kcal</span>
                    </div>
                </div>
                {targetCalories && (
                    <div className="text-right">
                        <div className="text-teal-200 text-xs font-bold uppercase tracking-wider mb-1">Objetivo</div>
                        <div className="text-xl font-bold">{targetCalories}</div>
                    </div>
                )}
            </div>

            {targetCalories && (
                <div className="w-full bg-teal-900/50 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${calories > targetCalories ? 'bg-orange-400' : 'bg-teal-300'
                            }`}
                        style={{ width: `${kcalPercent}%` }}
                    />
                </div>
            )}

            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-teal-500/30">
                <div className="text-center">
                    <div className="text-teal-200 text-[10px] uppercase font-bold tracking-wider mb-1">Prot</div>
                    <div className="font-semibold text-sm">{protein}g</div>
                </div>
                <div className="text-center">
                    <div className="text-teal-200 text-[10px] uppercase font-bold tracking-wider mb-1">Carb</div>
                    <div className="font-semibold text-sm">{carbs}g</div>
                </div>
                <div className="text-center">
                    <div className="text-teal-200 text-[10px] uppercase font-bold tracking-wider mb-1">Grasa</div>
                    <div className="font-semibold text-sm">{fat}g</div>
                </div>
                <div className="text-center">
                    <div className="text-teal-200 text-[10px] uppercase font-bold tracking-wider mb-1">Fibra</div>
                    <div className="font-semibold text-sm">{fiber}g</div>
                </div>
            </div>
        </div>
    )
}

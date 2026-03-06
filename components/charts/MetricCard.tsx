'use client'

import React from 'react'

interface MetricCardProps {
    title: string
    currentValue: string
    unit?: string
    deltaValue?: number // positive = went up, negative = went down
    inverseColors?: boolean // Si true: subir (positivo) es rojo, bajar (negativo) es verde (ej. % Grasa)
}

export default function MetricCard({ title, currentValue, unit, deltaValue, inverseColors = false }: MetricCardProps) {

    let isBetter = undefined
    let deltaIcon = null
    let deltaColorClass = 'text-slate-400 bg-slate-100'

    if (deltaValue !== undefined && deltaValue !== 0) {
        const isUp = deltaValue > 0
        // Para músculo, subir es bueno (no inverso)
        // Para grasa, bajar es bueno (inverso)
        isBetter = inverseColors ? !isUp : isUp

        deltaColorClass = isBetter
            ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
            : 'text-rose-700 bg-rose-50 border-rose-100'

        deltaIcon = isUp ? '▲' : '▼'
    }

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm h-full flex flex-col justify-between">
            <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">{title}</h3>

            <div className="flex items-end justify-between mt-auto">
                <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-slate-800">{currentValue}</span>
                    {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
                </div>

                {deltaValue !== undefined && deltaValue !== 0 && (
                    <div className={`px-2 py-1 flex items-center space-x-1 rounded-md border ${deltaColorClass} text-xs font-bold leading-none`}>
                        <span>{deltaIcon}</span>
                        <span>{Math.abs(deltaValue).toFixed(1)}</span>
                    </div>
                )}
            </div>
        </div>
    )
}

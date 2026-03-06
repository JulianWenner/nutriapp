import React from 'react'

interface ResultIndicatorRowProps {
    label: string
    value: number
    unit?: string
    category: 'normal' | 'limite' | 'riesgo' | 'referencia'
    categoryLabel: string
    reference?: string
}

export default function ResultIndicatorRow({
    label, value, unit, category, categoryLabel, reference
}: ResultIndicatorRowProps) {

    let colorClass = 'bg-slate-100 text-slate-500 border-slate-200'
    let dotClass = 'bg-slate-400'

    if (category === 'normal') {
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200'
        dotClass = 'bg-emerald-500'
    } else if (category === 'limite') {
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200'
        dotClass = 'bg-amber-500'
    } else if (category === 'riesgo') {
        colorClass = 'bg-rose-50 text-rose-700 border-rose-200'
        dotClass = 'bg-rose-500'
    }

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-2">
            <div>
                <span className="font-semibold text-slate-700">{label}</span>
                {reference && (
                    <span className="block sm:inline sm:ml-2 text-xs text-slate-400">
                        Ref: {reference}
                    </span>
                )}
            </div>

            <div className="flex items-center space-x-3">
                <div className="text-right">
                    <span className="font-black text-slate-800 text-lg">{value}</span>
                    {unit && <span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span>}
                </div>

                <div className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center space-x-1.5 ${colorClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                    <span>{categoryLabel}</span>
                </div>
            </div>
        </div>
    )
}

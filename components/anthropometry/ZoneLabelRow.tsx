import React from 'react'
import type { RangeCategory } from '@/types'

interface ZoneLabelRowProps {
    label: string
    value: number | string
    unit: string
    category: RangeCategory
    isActive: boolean
    onClick: () => void
}

export default function ZoneLabelRow({ label, value, unit, category, isActive, onClick }: ZoneLabelRowProps) {
    let dotClass = 'bg-slate-400'
    let textClass = 'text-slate-500'

    if (category === 'normal') {
        dotClass = 'bg-emerald-500'
        textClass = isActive ? 'text-emerald-700' : 'text-slate-700'
    } else if (category === 'limite') {
        dotClass = 'bg-amber-500'
        textClass = isActive ? 'text-amber-700' : 'text-slate-700'
    } else if (category === 'riesgo') {
        dotClass = 'bg-rose-500'
        textClass = isActive ? 'text-rose-700' : 'text-slate-700'
    }

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all border-2 ${isActive
                ? 'border-teal-500 shadow-sm bg-teal-50'
                : 'border-transparent hover:bg-slate-50'
                }`}
        >
            <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${dotClass}`}></div>
                <span className={`font-semibold ${textClass}`}>{label}</span>
            </div>
            <div className="text-right">
                <span className="font-bold text-slate-800">{value}</span>
                <span className="text-sm text-slate-400 ml-1">{unit}</span>
            </div>
        </button>
    )
}

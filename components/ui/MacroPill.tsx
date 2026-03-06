import React from 'react'
import clsx from 'clsx'

interface MacroPillProps {
    label: string
    value: number | string
    unit?: string
    color?: 'teal' | 'orange' | 'blue' | 'gray' | 'red'
}

export default function MacroPill({
    label,
    value,
    unit = 'g',
    color = 'gray'
}: MacroPillProps) {
    const colorClasses = {
        teal: 'bg-teal-50 text-teal-700 border-teal-200',
        orange: 'bg-orange-50 text-orange-700 border-orange-200',
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        gray: 'bg-slate-50 text-slate-700 border-slate-200',
        red: 'bg-red-50 text-red-700 border-red-200'
    }

    return (
        <span className={clsx(
            "inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-semibold border",
            colorClasses[color]
        )}>
            <span>{label}:</span>
            <span>{value}{unit}</span>
        </span>
    )
}

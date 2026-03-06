'use client'

import React from 'react'

interface StepperProps {
    value: number
    onChange: (val: number) => void
    min?: number
    max?: number
    step?: number
    label?: string
}

export default function Stepper({
    value,
    onChange,
    min = 0,
    max = 99,
    step = 0.5,
    label,
}: StepperProps) {
    const handleDecrease = () => {
        if (value - step >= min) onChange(value - step)
    }

    const handleIncrease = () => {
        if (value + step <= max) onChange(value + step)
    }

    return (
        <div className="flex flex-col items-center">
            {label && <span className="text-xs text-slate-500 mb-1">{label}</span>}
            <div className="flex items-center space-x-3 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-sm">
                <button
                    type="button"
                    onClick={handleDecrease}
                    disabled={value <= min}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>
                <span className="w-8 text-center font-medium text-slate-800">
                    {value}
                </span>
                <button
                    type="button"
                    onClick={handleIncrease}
                    disabled={value >= max}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 disabled:opacity-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                </button>
            </div>
        </div>
    )
}

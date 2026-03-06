'use client'

import React from 'react'

interface MeasureInputProps {
    label: string
    value: number | undefined
    onChange: (val: number | undefined) => void
    unit?: string
    placeholder?: string
}

export default function MeasureInput({ label, value, onChange, unit, placeholder = '0.00' }: MeasureInputProps) {
    return (
        <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">{label}</label>
            <div className="relative">
                <input
                    type="number"
                    step="0.1"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 pr-12 outline-none transition-colors"
                    placeholder={placeholder}
                    value={value ?? ''}
                    onChange={e => {
                        const val = e.target.value
                        onChange(val === '' ? undefined : Number(val))
                    }}
                />
                {unit && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-medium text-sm">
                        {unit}
                    </div>
                )}
            </div>
        </div>
    )
}

'use client'

import React from 'react'

interface MeasureFormSectionProps {
    title: string
    isOpen: boolean
    isCompleted: boolean
    onToggle: () => void
    children: React.ReactNode
}

export default function MeasureFormSection({ title, isOpen, isCompleted, onToggle, children }: MeasureFormSectionProps) {
    return (
        <div className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-teal-500 shadow-md ring-2 ring-teal-500/20' :
                isCompleted ? 'border-slate-200 bg-slate-50 opacity-80' :
                    'border-slate-200 bg-white opacity-90'
            }`}>
            <button
                type="button"
                onClick={onToggle}
                className="w-full px-5 py-4 flex items-center justify-between focus:outline-none"
            >
                <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted && !isOpen ? 'bg-teal-500 border-teal-500 text-white' :
                            isOpen ? 'border-teal-500 text-teal-600' :
                                'border-slate-300 text-transparent'
                        }`}>
                        {(isCompleted && !isOpen) ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-current"></span>
                        )}
                    </div>
                    <h3 className={`font-bold ${isOpen ? 'text-teal-900' : 'text-slate-700'}`}>{title}</h3>
                </div>
                <div className={`p-1 rounded-full transition-transform ${isOpen ? 'rotate-180 text-teal-600' : 'text-slate-400'}`}>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="p-5 pt-0 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {children}
                    </div>
                </div>
            )}
        </div>
    )
}

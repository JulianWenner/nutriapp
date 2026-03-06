'use client'

import React from 'react'
import { AdherenceSummary } from '@/types'
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react'

interface Props {
    summary: AdherenceSummary
}

export default function AdherenceStatsCard({ summary }: Props) {
    const percentage = summary.percentage

    let color = 'text-rose-600'
    let bgColor = 'bg-rose-50'
    let label = 'Baja Adherencia'

    if (percentage >= 80) {
        color = 'text-emerald-700'
        bgColor = 'bg-emerald-50'
        label = 'Excelente'
    } else if (percentage >= 50) {
        color = 'text-amber-700'
        bgColor = 'bg-amber-50'
        label = 'Aceptable'
    }

    return (
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">CUMPLIMIENTO SEMANAL</h3>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${bgColor} ${color}`}>
                    {label}
                </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="48" cy="48" r="40"
                            stroke="currentColor" strokeWidth="8"
                            fill="transparent"
                            className="text-slate-100"
                        />
                        <circle
                            cx="48" cy="48" r="40"
                            stroke="currentColor" strokeWidth="8"
                            fill="transparent"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * percentage) / 100}
                            className={`${color} transition-all duration-1000`}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900 leading-none">{Math.round(percentage)}%</span>
                    </div>
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold">Comidas Totales</span>
                        <span className="text-slate-900 font-bold">{summary.total_meals}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold">Completadas</span>
                        <span className="text-emerald-600 font-bold">{summary.completed_meals}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-xs font-bold">Omitidas</span>
                        <span className="text-rose-600 font-bold">{summary.total_meals - summary.completed_meals}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {summary.by_day.map((day) => (
                    <div key={day.day_of_week} className="flex flex-col items-center gap-1">
                        <div
                            className={`w-full h-12 rounded-lg flex items-center justify-center transition-all ${day.total === 0 ? 'bg-slate-50' :
                                    day.percentage >= 80 ? 'bg-emerald-500 text-white' :
                                        day.percentage >= 50 ? 'bg-amber-500 text-white' :
                                            day.percentage > 0 ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'
                                }`}
                        >
                            {day.total > 0 ? (
                                <span className="text-[10px] font-black">{Math.round(day.percentage)}%</span>
                            ) : '-'}
                        </div>
                        <span className="text-[8px] font-bold text-slate-400 uppercase">{['L', 'M', 'M', 'J', 'V', 'S', 'D'][day.day_of_week - 1]}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

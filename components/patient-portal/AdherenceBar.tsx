import React from 'react'
interface Props {
    completed: number
    total: number
}

export default function AdherenceBar({ completed, total }: Props) {
    const percentage = total > 0 ? (completed / total) * 100 : 0

    let colorClass = 'bg-rose-500'
    let textColor = 'text-rose-600'
    let label = '¡Empezamos el día!'

    if (percentage >= 75) {
        colorClass = 'bg-emerald-500 shadow-sm shadow-emerald-500/20'
        textColor = 'text-emerald-700'
        label = '¡Excelente adherencia!'
    } else if (percentage >= 25) {
        colorClass = 'bg-amber-500'
        textColor = 'text-amber-700'
        label = 'A mitad de camino'
    }

    return (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-baseline mb-4">
                <div>
                    <h4 className="text-slate-900 font-black text-lg leading-tight">Tu día</h4>
                    <p className={`${textColor} text-xs font-bold uppercase tracking-wider mt-1`}>
                        {label}
                    </p>
                </div>
                <div className="text-right">
                    <span className="text-slate-900 font-black text-2xl">{completed}</span>
                    <span className="text-slate-400 font-bold text-sm ml-1">/ {total}</span>
                </div>
            </div>

            <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {percentage < 100 && percentage > 0 && (
                <p className="text-slate-400 text-[10px] font-medium text-center mt-3">
                    Completaste el {Math.round(percentage)}% de tu plan de hoy
                </p>
            )}
        </div>
    )
}

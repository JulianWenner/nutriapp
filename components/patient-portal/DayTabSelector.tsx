'use client'

import React from 'react'

interface Props {
    selectedDay: number
    onDaySelect: (day: number) => void
    dailyCompletion: Record<number, boolean> // day_of_week -> completed
}

export default function DayTabSelector({ selectedDay, onDaySelect, dailyCompletion }: Props) {
    const days = [
        { id: 1, label: 'Lun' },
        { id: 2, label: 'Mar' },
        { id: 3, label: 'Mié' },
        { id: 4, label: 'Jue' },
        { id: 5, label: 'Vie' },
        { id: 6, label: 'Sáb' },
        { id: 7, label: 'Dom' },
    ]

    return (
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {days.map((day) => {
                const isSelected = selectedDay === day.id
                const isCompleted = dailyCompletion[day.id]

                return (
                    <button
                        key={day.id}
                        onClick={() => onDaySelect(day.id)}
                        className={`
              flex flex-col items-center justify-center min-w-[56px] h-[72px] rounded-2xl transition-all relative
              ${isSelected ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30' : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-100'}
            `}
                    >
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'opacity-80' : 'opacity-60'}`}>
                            {day.label}
                        </span>
                        <span className={`text-lg font-black mt-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                            {day.id}
                        </span>

                        {isCompleted && (
                            <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${isSelected ? 'bg-emerald-400 border-teal-600' : 'bg-emerald-500 border-white'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
    )
}

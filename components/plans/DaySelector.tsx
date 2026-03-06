import React from 'react'
import { DAY_LABELS } from '@/types'
import clsx from 'clsx'

interface DaySelectorProps {
    selectedDay: number // 1 to 7
    onChange: (day: number) => void
    hasContentByDay?: Record<number, boolean> // optional dot indicator if there is food planned
}

export default function DaySelector({ selectedDay, onChange, hasContentByDay }: DaySelectorProps) {
    return (
        <div className="flex items-center justify-between bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto gap-1">
            {DAY_LABELS.map((label, index) => {
                const dayValue = index + 1 // 1=Lun ... 7=Dom
                const isActive = selectedDay === dayValue
                const hasContent = hasContentByDay?.[dayValue]

                return (
                    <button
                        key={dayValue}
                        onClick={() => onChange(dayValue)}
                        className={clsx(
                            "relative flex-1 min-w-[3rem] py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                            isActive
                                ? "bg-white text-teal-700 shadow-sm ring-1 ring-slate-200/50"
                                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                        )}
                    >
                        {label}

                        {/* Dot indicator if day has meals planned */}
                        {hasContent && (
                            <span
                                className={clsx(
                                    "absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full",
                                    isActive ? "bg-teal-500" : "bg-teal-400 opacity-60"
                                )}
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}

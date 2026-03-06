'use client'

import type { Appointment } from '@/types'

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

function addDays(date: Date, n: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    return d
}

function toISO(date: Date): string {
    return date.toISOString().split('T')[0]
}

/** Devuelve el lunes de la semana de una fecha dada */
function getMonday(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay() || 7 // dom=0 → 7
    d.setDate(d.getDate() - (day - 1))
    d.setHours(0, 0, 0, 0)
    return d
}

interface WeekSelectorProps {
    weekStart: Date
    selectedDay: string   // YYYY-MM-DD
    appointments: Appointment[]
    onChangeDay: (day: string) => void
    onChangeWeek: (newMonday: Date) => void
}

export default function WeekSelector({
    weekStart,
    selectedDay,
    appointments,
    onChangeDay,
    onChangeWeek,
}: WeekSelectorProps) {
    const monday = getMonday(weekStart)

    const weekDays = DAYS.map((label, i) => {
        const date = addDays(monday, i)
        const iso = toISO(date)
        const count = appointments.filter((a) => a.date === iso).length
        return { label, iso, count, day: date.getDate() }
    })

    // Mes y año de la semana
    const monthLabel = monday.toLocaleDateString('es-AR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Argentina/Buenos_Aires',
    })

    return (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
            {/* Header semana */}
            <div className="flex items-center justify-between px-5 py-3 bg-teal-light border-b border-border">
                <button
                    onClick={() => onChangeWeek(addDays(monday, -7))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/60 transition"
                    aria-label="Semana anterior"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </button>
                <span className="text-sm font-semibold text-dark capitalize">{monthLabel}</span>
                <button
                    onClick={() => onChangeWeek(addDays(monday, 7))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/60 transition"
                    aria-label="Semana siguiente"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </button>
            </div>

            {/* Selector de días */}
            <div className="grid grid-cols-7 divide-x divide-border">
                {weekDays.map(({ label, iso, count, day }) => {
                    const isSelected = iso === selectedDay
                    return (
                        <button
                            key={iso}
                            onClick={() => onChangeDay(iso)}
                            className={`flex flex-col items-center py-3 gap-1 transition ${isSelected ? 'bg-teal text-white' : 'hover:bg-teal-light text-dark'
                                }`}
                        >
                            <span className="text-[10px] font-medium uppercase opacity-70">{label}</span>
                            <span className="text-base font-bold">{day}</span>
                            {count > 0 && (
                                <span
                                    className={`text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${isSelected ? 'bg-white/30 text-white' : 'bg-teal text-white'
                                        }`}
                                >
                                    {count}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

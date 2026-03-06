'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import WeekSelector from '@/components/appointments/WeekSelector'
import AppointmentCard from '@/components/appointments/AppointmentCard'
import PendingRequestCard from '@/components/appointments/PendingRequestCard'
import NewAppointmentModal from '@/components/appointments/NewAppointmentModal'
import type { Appointment, AppointmentRequest } from '@/types'

const TZ = 'America/Argentina/Buenos_Aires'

function todayISO(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

function getMonday(date: Date): Date {
    const d = new Date(date)
    const day = d.getDay() || 7
    d.setDate(d.getDate() - (day - 1))
    d.setHours(0, 0, 0, 0)
    return d
}

function addDays(date: Date, n: number): Date {
    const d = new Date(date)
    d.setDate(d.getDate() + n)
    return d
}

function toISO(date: Date): string {
    return date.toISOString().split('T')[0]
}

interface AgendaClientProps {
    initialAppointments: Appointment[]
    initialRequests: AppointmentRequest[]
    patients: { id: string; full_name: string }[]
    weekStart: Date
    profileId: string
}

export default function AgendaClient({
    initialAppointments,
    initialRequests,
    patients,
    weekStart,
}: AgendaClientProps) {
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
    const [requests, setRequests] = useState<AppointmentRequest[]>(initialRequests)
    const [currentWeek, setCurrentWeek] = useState<Date>(getMonday(weekStart))
    const [selectedDay, setSelectedDay] = useState<string>(todayISO())
    const [showNewModal, setShowNewModal] = useState(false)

    // Cargar turnos de la semana actual
    const loadWeek = useCallback(async (monday: Date) => {
        const from = toISO(monday)
        const to = toISO(addDays(monday, 6))
        const res = await fetch(`/api/appointments?from=${from}&to=${to}`)
        if (res.ok) setAppointments(await res.json())
    }, [])

    // Cargar solicitudes pendientes
    const loadRequests = useCallback(async () => {
        const res = await fetch('/api/appointment-requests')
        if (res.ok) setRequests(await res.json())
    }, [])

    useEffect(() => {
        loadWeek(currentWeek)
    }, [currentWeek, loadWeek])

    // Supabase Realtime
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('agenda-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
                loadWeek(currentWeek)
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointment_requests' }, () => {
                loadRequests()
            })
            .subscribe()

        return () => { void supabase.removeChannel(channel) }
    }, [currentWeek, loadWeek, loadRequests])

    async function handleConfirm(requestId: string) {
        await fetch(`/api/appointment-requests/${requestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'aprobado' }),
        })
        await Promise.all([loadRequests(), loadWeek(currentWeek)])
    }

    async function handleReject(requestId: string) {
        await fetch(`/api/appointment-requests/${requestId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'rechazado' }),
        })
        await loadRequests()
    }

    const dayAppointments = appointments.filter((a) => a.date === selectedDay)
    const selectedDateLabel = new Date(selectedDay + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ,
    })

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#F2F7F6' }}>
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-dark">Agenda</h1>
                        <p className="text-xs text-gray-400 mt-0.5">Gestión de turnos</p>
                    </div>
                    <button
                        onClick={() => setShowNewModal(true)}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                        style={{ backgroundColor: '#0D7C72' }}
                        aria-label="Nuevo turno"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                    </button>
                </div>

                {/* Solicitudes pendientes */}
                {requests.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <h2 className="text-sm font-semibold text-dark">Solicitudes pendientes</h2>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#E8A04A' }}>
                                {requests.length}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {requests.map((req) => (
                                <PendingRequestCard
                                    key={req.id}
                                    request={req}
                                    onConfirm={handleConfirm}
                                    onReject={handleReject}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* Selector semanal */}
                <WeekSelector
                    weekStart={currentWeek}
                    selectedDay={selectedDay}
                    appointments={appointments}
                    onChangeDay={setSelectedDay}
                    onChangeWeek={(d) => {
                        setCurrentWeek(d)
                        setSelectedDay(toISO(d))
                    }}
                />

                {/* Turnos del día */}
                <section>
                    <h2 className="text-sm font-semibold text-dark capitalize mb-3">{selectedDateLabel}</h2>
                    {dayAppointments.length === 0 ? (
                        <div className="bg-white rounded-xl border border-border px-5 py-8 text-center">
                            <p className="text-sm text-gray-400">No hay turnos para este día.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {dayAppointments.map((appt) => (
                                <AppointmentCard key={appt.id} appointment={appt} />
                            ))}
                        </div>
                    )}
                </section>

            </div>

            <NewAppointmentModal
                isOpen={showNewModal}
                onClose={() => setShowNewModal(false)}
                patients={patients}
                onCreated={() => loadWeek(currentWeek)}
            />
        </main>
    )
}

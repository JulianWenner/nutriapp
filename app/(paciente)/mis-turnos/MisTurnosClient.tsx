'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import AppointmentCard from '@/components/appointments/AppointmentCard'
import RequestModal from '@/components/appointments/RequestModal'
import AppointmentBadge from '@/components/appointments/AppointmentBadge'
import type { Appointment, AppointmentRequest, RequestType } from '@/types'
import { APPOINTMENT_TYPE_LABELS } from '@/types'

const TZ = 'America/Argentina/Buenos_Aires'

function formatDate(dateStr: string): string {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ,
    })
}

interface MisTurnosClientProps {
    nextAppointment: Appointment | null
    pastAppointments: Appointment[]
    pendingRequests: AppointmentRequest[]
    patientId: string
}

export default function MisTurnosClient({
    nextAppointment,
    pastAppointments: initialPast,
    pendingRequests: initialPending,
    patientId,
}: MisTurnosClientProps) {
    const [next] = useState<Appointment | null>(nextAppointment)
    const [past] = useState<Appointment[]>(initialPast)
    const [pending] = useState<AppointmentRequest[]>(initialPending)
    const [modalType, setModalType] = useState<RequestType | null>(null)

    const hasPending = pending.length > 0

    // Supabase Realtime
    useEffect(() => {
        const supabase = createClient()
        const channel = supabase
            .channel('misturnos-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
                window.location.reload()
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'appointment_requests' }, () => {
                window.location.reload()
            })
            .subscribe()

        return () => { void supabase.removeChannel(channel) }
    }, [])

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#F2F7F6' }}>
            <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

                {/* Header */}
                <div>
                    <h1 className="text-xl font-bold text-dark">Mis turnos</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Portal de gestión de turnos</p>
                </div>

                {/* Banner solicitud pendiente */}
                {hasPending && (
                    <div className="rounded-xl px-4 py-3 flex items-start gap-3" style={{ backgroundColor: '#FFF4E5' }}>
                        <span className="text-lg">⏳</span>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: '#E8A04A' }}>Solicitud en espera</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Tu solicitud fue enviada. La nutricionista te confirmará a la brevedad.
                            </p>
                        </div>
                    </div>
                )}

                {/* Próximo turno */}
                <section>
                    <h2 className="text-sm font-semibold text-dark mb-3">Próximo turno</h2>
                    {next ? (
                        <div className="bg-white rounded-2xl border border-border overflow-hidden">
                            {/* Card de turno */}
                            <div className="px-5 py-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400 capitalize">{formatDate(next.date)}</p>
                                        <p className="text-2xl font-bold text-dark mt-1">{next.time?.slice(0, 5)}</p>
                                        <p className="text-sm text-gray-500 mt-0.5">{APPOINTMENT_TYPE_LABELS[next.type]}</p>
                                    </div>
                                    <AppointmentBadge status={next.status} />
                                </div>
                            </div>

                            {/* Acciones */}
                            {!hasPending && (
                                <div className="border-t border-border grid grid-cols-2 divide-x divide-border">
                                    <button
                                        onClick={() => setModalType('cambio')}
                                        className="py-3 text-xs font-semibold text-dark hover:bg-teal-light transition"
                                    >
                                        Pedir cambio
                                    </button>
                                    <button
                                        onClick={() => setModalType('cancelacion')}
                                        className="py-3 text-xs font-semibold transition hover:bg-red-50"
                                        style={{ color: '#E05555' }}
                                    >
                                        Cancelar turno
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : !hasPending ? (
                        <div className="bg-white rounded-2xl border border-border px-5 py-8 text-center space-y-3">
                            <p className="text-sm text-gray-400">No tenés turnos agendados.</p>
                            <button
                                onClick={() => setModalType('nuevo')}
                                className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                                style={{ backgroundColor: '#0D7C72' }}
                            >
                                Solicitar turno
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-border px-5 py-6 text-center">
                            <p className="text-sm text-gray-400">Esperando confirmación del nuevo turno.</p>
                        </div>
                    )}
                </section>

                {/* Historial */}
                {past.length > 0 && (
                    <section>
                        <h2 className="text-sm font-semibold text-dark mb-3">Historial</h2>
                        <div className="space-y-2">
                            {past.map((appt) => (
                                <AppointmentCard key={appt.id} appointment={appt} />
                            ))}
                        </div>
                    </section>
                )}

            </div>

            {/* Modales */}
            {modalType && (
                <RequestModal
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    type={modalType}
                    appointmentId={next?.id}
                    patientId={patientId}
                    onSubmitted={() => {
                        setModalType(null)
                        window.location.reload()
                    }}
                />
            )}
        </main>
    )
}

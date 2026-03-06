import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTodayAppointments, getPendingRequests } from '@/lib/supabase/appointments'
import AppointmentBadge from '@/components/appointments/AppointmentBadge'
import Link from 'next/link'
import { APPOINTMENT_TYPE_LABELS } from '@/types'

export default async function DashboardPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'nutricionista') redirect('/inicio')

    const [todayAppointments, pendingRequests] = await Promise.all([
        getTodayAppointments(),
        getPendingRequests(),
    ])

    async function signOut() {
        'use server'
        const supabase = createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    const today = new Date().toLocaleDateString('es-AR', {
        weekday: 'long', day: 'numeric', month: 'long',
        timeZone: 'America/Argentina/Buenos_Aires',
    })

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#EEF4F3' }}>
            <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-dark">Panel nutricionista</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Bienvenida, <span className="font-semibold text-dark">{profile?.full_name || user.email}</span>
                        </p>
                    </div>
                    <form action={signOut}>
                        <button type="submit" className="text-xs px-3 py-1.5 rounded-lg border border-border text-dark hover:bg-white transition">
                            Salir
                        </button>
                    </form>
                </div>

                {/* Accesos rápidos */}
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/agenda"
                        className="bg-white rounded-2xl border border-border px-4 py-4 flex items-center gap-3 hover:border-teal hover:shadow-sm transition">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F5F3' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D7C72" strokeWidth="2" strokeLinecap="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-dark">Agenda</p>
                            <p className="text-xs text-gray-400">Ver turnos</p>
                        </div>
                    </Link>
                    <div className="bg-white rounded-2xl border border-border px-4 py-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FFF4E5' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E8A04A" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-dark">Solicitudes</p>
                            <p className="text-xs" style={{ color: pendingRequests.length > 0 ? '#E8A04A' : '#8A9E9C' }}>
                                {pendingRequests.length > 0 ? `${pendingRequests.length} pendiente${pendingRequests.length > 1 ? 's' : ''}` : 'Sin pendientes'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Turnos de hoy */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h2 className="text-sm font-semibold text-dark">Turnos de hoy</h2>
                            <p className="text-[11px] text-gray-400 capitalize mt-0.5">{today}</p>
                        </div>
                        <Link href="/agenda" className="text-xs font-semibold" style={{ color: '#0D7C72' }}>
                            Ver agenda completa →
                        </Link>
                    </div>

                    {todayAppointments.length === 0 ? (
                        <div className="bg-white rounded-xl border border-border px-5 py-6 text-center">
                            <p className="text-sm text-gray-400">No hay turnos para hoy.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {todayAppointments.map((appt) => (
                                <div key={appt.id} className="bg-white rounded-xl border border-border px-4 py-3 flex items-center gap-4">
                                    <span className="text-base font-bold text-dark w-14 flex-shrink-0">{appt.time?.slice(0, 5)}</span>
                                    <div className="w-px h-8 bg-border flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-dark truncate">{appt.patient?.full_name ?? 'Paciente'}</p>
                                        <p className="text-xs text-gray-400">{APPOINTMENT_TYPE_LABELS[appt.type]}</p>
                                    </div>
                                    <AppointmentBadge status={appt.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </main>
    )
}

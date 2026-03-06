import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
    getNextAppointment,
    getPatientIdFromProfileId,
} from '@/lib/supabase/appointments'
import { APPOINTMENT_TYPE_LABELS } from '@/types'
import Link from 'next/link'

const TZ = 'America/Argentina/Buenos_Aires'

export default async function InicioPacientePage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'paciente') redirect('/dashboard')

    const patientId = await getPatientIdFromProfileId(user.id)
    const nextAppointment = patientId ? await getNextAppointment(patientId) : null

    async function signOut() {
        'use server'
        const supabase = createClient()
        await supabase.auth.signOut()
        redirect('/login')
    }

    const nextDateFormatted = nextAppointment
        ? new Date(nextAppointment.date + 'T00:00:00').toLocaleDateString('es-AR', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: TZ,
        })
        : null

    return (
        <main className="min-h-screen" style={{ backgroundColor: '#EEF4F3' }}>
            <div className="max-w-lg mx-auto px-4 py-6 space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-dark">Portal paciente</h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Hola, <span className="font-semibold text-dark">{profile?.full_name || user.email}</span>
                        </p>
                    </div>
                    <form action={signOut}>
                        <button type="submit" className="text-xs px-3 py-1.5 rounded-lg border border-border text-dark hover:bg-white transition">
                            Salir
                        </button>
                    </form>
                </div>

                {/* Card próximo turno */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-dark">Próximo turno</h2>
                        <Link href="/mis-turnos" className="text-xs font-semibold" style={{ color: '#0D7C72' }}>
                            Ver todos →
                        </Link>
                    </div>

                    {nextAppointment ? (
                        <div className="bg-white rounded-2xl border border-border overflow-hidden">
                            <div className="px-5 py-5">
                                <p className="text-xs text-gray-400 capitalize">{nextDateFormatted}</p>
                                <p className="text-3xl font-bold text-dark mt-1">{nextAppointment.time?.slice(0, 5)}</p>
                                <p className="text-sm text-gray-500 mt-1">{APPOINTMENT_TYPE_LABELS[nextAppointment.type]}</p>
                            </div>
                            <div className="border-t border-border px-5 py-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: '#3BAD7A' }} />
                                <span className="text-xs text-gray-500">Confirmado</span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-border px-5 py-8 text-center space-y-3">
                            <p className="text-sm text-gray-400">No tenés turnos agendados.</p>
                            <Link
                                href="/mis-turnos"
                                className="inline-block px-5 py-2 rounded-xl text-sm font-semibold text-white"
                                style={{ backgroundColor: '#0D7C72' }}
                            >
                                Solicitar turno
                            </Link>
                        </div>
                    )}
                </section>

                {/* Placeholder Fase 3 */}
                <section>
                    <div className="rounded-xl border-2 border-dashed px-5 py-6 text-center" style={{ borderColor: '#D4E8E5', backgroundColor: '#f0faf9' }}>
                        <p className="text-sm font-medium" style={{ color: '#0D7C72' }}>🚧 Más funciones en la Fase 3</p>
                        <p className="text-xs text-gray-400 mt-1">Plan alimentario, métricas y más</p>
                    </div>
                </section>

            </div>
        </main>
    )
}

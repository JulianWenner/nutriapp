import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
    getNextAppointment,
    getPastAppointments,
    getPatientPendingRequests,
    getPatientIdFromProfileId,
} from '@/lib/supabase/appointments'
import MisTurnosClient from './MisTurnosClient'

export default async function MisTurnosPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'paciente') redirect('/dashboard')

    const patientId = await getPatientIdFromProfileId(user.id)

    if (!patientId) {
        return (
            <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2F7F6' }}>
                <p className="text-sm text-gray-400">No se encontró tu registro de paciente. Contactá a la nutricionista.</p>
            </main>
        )
    }

    const [nextAppointment, pastAppointments, pendingRequests] = await Promise.all([
        getNextAppointment(patientId),
        getPastAppointments(patientId),
        getPatientPendingRequests(patientId),
    ])

    return (
        <MisTurnosClient
            nextAppointment={nextAppointment}
            pastAppointments={pastAppointments}
            pendingRequests={pendingRequests}
            patientId={patientId}
        />
    )
}

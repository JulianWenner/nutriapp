import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
    getAppointmentsByWeek,
    getPendingRequests,
    getAllPatients,
    todayAR,
} from '@/lib/supabase/appointments'
import AgendaClient from './AgendaClient'

function getMonday(dateStr: string): Date {
    const d = new Date(dateStr + 'T00:00:00')
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

export default async function AgendaPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'nutricionista') redirect('/inicio')

    const today = todayAR()
    const monday = getMonday(today)
    const sunday = addDays(monday, 6)

    const [appointments, requests, patients] = await Promise.all([
        getAppointmentsByWeek(
            monday.toISOString().split('T')[0],
            sunday.toISOString().split('T')[0]
        ),
        getPendingRequests(),
        getAllPatients(),
    ])

    return (
        <AgendaClient
            initialAppointments={appointments}
            initialRequests={requests}
            patients={patients}
            weekStart={monday}
            profileId={user.id}
        />
    )
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — lista de turnos (nutricionista: todos; paciente: los suyos)
export async function GET(request: Request) {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let query = supabase
        .from('appointments')
        .select(`*, patients!inner(profile_id, profiles!inner(full_name, email))`)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

    if (from) query = query.gte('date', from)
    if (to) query = query.lte('date', to)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    interface AppointmentRow {
        patients?: { profiles?: { full_name?: string; email?: string } }
        [key: string]: unknown
    }

    const appointments = (data ?? []).map((row: AppointmentRow) => ({
        ...row,
        patient: {
            full_name: row.patients?.profiles?.full_name ?? '',
            email: row.patients?.profiles?.email ?? '',

        },
    }))

    return NextResponse.json(appointments)
}

// POST — crear turno
export async function POST(request: Request) {
    const supabase = createClient()
    const body = await request.json()

    const { data, error } = await supabase
        .from('appointments')
        .insert(body)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}

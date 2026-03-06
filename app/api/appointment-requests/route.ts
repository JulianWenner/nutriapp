import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// GET — solicitudes pendientes
export async function GET() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('appointment_requests')
        .select(`*, patients!inner(profiles!inner(full_name))`)
        .eq('status', 'pendiente')
        .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    interface RequestRow {
        patients?: { profiles?: { full_name?: string } }
        [key: string]: unknown
    }
    const requests = (data ?? []).map((row: RequestRow) => ({
        ...row,
        patient: { full_name: row.patients?.profiles?.full_name ?? '' },
    }))

    return NextResponse.json(requests)
}

// POST — crear solicitud
export async function POST(request: Request) {
    const supabase = createClient()
    const body = await request.json()

    const { data, error } = await supabase
        .from('appointment_requests')
        .insert(body)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
}

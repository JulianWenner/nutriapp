import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getWeekAdherence, upsertAdherence } from '@/lib/supabase/adherence'
import { getPatientIdFromProfileId } from '@/lib/supabase/appointments'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get('weekStart')

    if (!weekStart) {
        return NextResponse.json({ error: 'weekStart is required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const patientId = await getPatientIdFromProfileId(user.id)
    if (!patientId) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

    try {
        const adherence = await getWeekAdherence(patientId, weekStart)
        return NextResponse.json(adherence)
    } catch (error) {
        console.error('Error fetching adherence:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const patientId = await getPatientIdFromProfileId(user.id)
    if (!patientId) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

    try {
        const body = await request.json()
        const result = await upsertAdherence({
            ...body,
            patient_id: patientId
        })
        return NextResponse.json(result)
    } catch (error) {
        console.error('Error saving adherence:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

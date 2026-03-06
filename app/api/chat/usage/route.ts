import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPatientIdFromProfileId } from '@/lib/supabase/appointments'
import { getDailyUsage } from '@/lib/supabase/chat'

export async function GET() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const patientId = await getPatientIdFromProfileId(user.id)
    if (!patientId) return NextResponse.json({ error: 'Patient not found' }, { status: 404 })

    try {
        const usage = await getDailyUsage(patientId)
        return NextResponse.json(usage)
    } catch (error) {
        console.error('Error fetching usage:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

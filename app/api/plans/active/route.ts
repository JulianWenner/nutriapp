import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActivePlanForPatient } from '@/lib/supabase/plans'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
        return NextResponse.json({ error: 'patientId is required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const plan = await getActivePlanForPatient(patientId)
        return NextResponse.json(plan)
    } catch (error) {
        console.error('Error fetching active plan:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

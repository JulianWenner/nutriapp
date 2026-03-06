import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
    const supabase = createClient()

    // We expect the auth ID to be passed as a header or just read the current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: patient, error } = await supabase
            .from('patients')
            .select('*')
            .eq('profile_id', user.id)
            .single()

        if (error || !patient) {
            return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
        }

        return NextResponse.json({ patient })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

import { assignPlanToPatient } from '@/lib/supabase/plans'
import { NextResponse } from 'next/server'

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { patientId } = body

        if (!patientId) {
            return NextResponse.json({ error: 'patientId is required' }, { status: 400 })
        }

        await assignPlanToPatient(params.id, patientId)

        return NextResponse.json({ success: true }, { status: 200 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}

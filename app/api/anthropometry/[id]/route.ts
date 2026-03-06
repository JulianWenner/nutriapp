import { NextResponse } from 'next/server'
import { getEvalById, toggleShareEval } from '@/lib/supabase/anthropometry'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const item = await getEvalById(params.id)
        if (!item) {
            return NextResponse.json({ error: 'Eval not found' }, { status: 404 })
        }
        return NextResponse.json(item)
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        if (typeof body.shared_with_patient !== 'boolean') {
            return NextResponse.json({ error: 'Missing shared_with_patient boolean' }, { status: 400 })
        }

        const success = await toggleShareEval(params.id, body.shared_with_patient)
        if (!success) {
            return NextResponse.json({ error: 'Failed to update share status' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

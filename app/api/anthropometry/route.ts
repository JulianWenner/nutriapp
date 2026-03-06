import { NextResponse } from 'next/server'
import { getEvalsByPatient, saveEval } from '@/lib/supabase/anthropometry'

// Lists evaluations for a specific patient (supplied via ?patientId=...)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    if (!patientId) {
        return NextResponse.json({ error: 'patientId is required' }, { status: 400 })
    }

    try {
        const evals = await getEvalsByPatient(patientId)
        return NextResponse.json(evals)
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

// Creates a new evaluation
export async function POST(request: Request) {
    try {
        const payload = await request.json()
        const newEval = await saveEval(payload)

        if (!newEval) {
            return NextResponse.json({ error: 'Failed to create evaluation' }, { status: 500 })
        }

        return NextResponse.json(newEval, { status: 201 })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

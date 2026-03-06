import { getPlans, savePlan } from '@/lib/supabase/plans'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const plans = await getPlans()
        return NextResponse.json(plans)
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const newPlan = await savePlan(body)
        if (!newPlan) {
            return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
        }
        return NextResponse.json(newPlan, { status: 201 })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

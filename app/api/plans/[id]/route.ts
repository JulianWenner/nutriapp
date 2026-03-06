import { getPlanWithMeals, savePlan } from '@/lib/supabase/plans'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const plan = await getPlanWithMeals(params.id)
        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
        }
        return NextResponse.json(plan)
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        // Override id to be sure
        const updatedPlan = await savePlan({ ...body, id: params.id })
        if (!updatedPlan) {
            return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 })
        }
        return NextResponse.json(updatedPlan)
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

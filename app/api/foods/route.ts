import { searchFoods, createFood } from '@/lib/supabase/foods'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    try {
        const results = await searchFoods(query)
        return NextResponse.json(results)
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { foodData, portions } = body
        const newFood = await createFood(foodData, portions)
        if (!newFood) {
            return NextResponse.json({ error: 'Failed to create food' }, { status: 500 })
        }
        return NextResponse.json(newFood, { status: 201 })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

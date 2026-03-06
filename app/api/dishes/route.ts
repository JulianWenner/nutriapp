import { getDishes, saveDish } from '@/lib/supabase/dishes'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag') || undefined

    try {
        const dishes = await getDishes(tag)
        return NextResponse.json(dishes)
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { dish, ingredients } = body
        // dish doesn't have an ID yet
        const newDish = await saveDish(dish, ingredients)
        if (!newDish) {
            return NextResponse.json({ error: 'Failed to create dish' }, { status: 500 })
        }
        return NextResponse.json(newDish, { status: 201 })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

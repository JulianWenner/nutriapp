import { getDishWithIngredients, saveDish, deleteDish } from '@/lib/supabase/dishes'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const dish = await getDishWithIngredients(params.id)
        if (!dish) {
            return NextResponse.json({ error: 'Dish not found' }, { status: 404 })
        }
        return NextResponse.json(dish)
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
        const { dish, ingredients } = body
        const updatedDish = await saveDish({ ...dish, id: params.id }, ingredients)
        if (!updatedDish) {
            return NextResponse.json({ error: 'Failed to update dish' }, { status: 500 })
        }
        return NextResponse.json(updatedDish)
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const success = await deleteDish(params.id)
        if (!success) {
            return NextResponse.json({ error: 'Failed to delete dish' }, { status: 500 })
        }
        return new NextResponse(null, { status: 204 })
    } catch (e: unknown) {
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}

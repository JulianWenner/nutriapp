import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// PATCH — actualizar estado de un turno
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const supabase = createClient()
    const body = await request.json()

    const { data, error } = await supabase
        .from('appointments')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
}

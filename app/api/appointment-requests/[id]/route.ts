import { NextResponse } from 'next/server'
import { resolveRequest } from '@/lib/supabase/appointments'

// PATCH — aprobar o rechazar una solicitud
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const body = await request.json()
    const { action } = body as { action: 'aprobado' | 'rechazado' }

    if (!action || !['aprobado', 'rechazado'].includes(action)) {
        return NextResponse.json({ error: 'action inválida' }, { status: 400 })
    }

    const success = await resolveRequest(params.id, action)
    if (!success) {
        return NextResponse.json({ error: 'No se pudo resolver la solicitud' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
}

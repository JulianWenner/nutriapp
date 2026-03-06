import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { getPlanWithMeals } from '@/lib/supabase/plans'
import { PlanPDF } from '@/components/pdf/PlanPDF'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { planId: string } }
) {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    try {
        // 1. Obtener el plan
        const plan = await getPlanWithMeals(params.planId)
        if (!plan) {
            return NextResponse.json({ error: 'Plan no encontrado' }, { status: 404 })
        }

        // 2. Obtener el perfil (del paciente solicitado o del usuario actual)
        let profileId = user.id
        if (patientId) {
            const { data: patient } = await supabase
                .from('patients')
                .select('profile_id')
                .eq('id', patientId)
                .single()
            if (patient) profileId = patient.profile_id
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
        }

        // 3. Generar PDF
        const buffer = await renderToBuffer(<PlanPDF plan={ plan } patient = { profile } />)

        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Plan_${profile.full_name?.replace(/\s+/g, '_')}.pdf"`,
            }
        })
    } catch (error: any) {
        console.error('Error generando PDF:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

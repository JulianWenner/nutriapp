import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { getEvalById } from '@/lib/supabase/anthropometry'
import { EvalPDF } from '@/components/pdf/EvalPDF'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { evalId: string } }
) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    try {
        // 1. Obtener la evaluación
        const evaluation = await getEvalById(params.evalId)
        if (!evaluation) {
            return NextResponse.json({ error: 'Evaluación no encontrada' }, { status: 404 })
        }

        // 2. Obtener el perfil del paciente
        const { data: patient } = await supabase
            .from('patients')
            .select('profile_id')
            .eq('id', evaluation.patient_id)
            .single()

        if (!patient) {
            return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', patient.profile_id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
        }

        // 3. Generar PDF
        const buffer = await renderToBuffer(<EvalPDF evaluation={ evaluation } patient = { profile } />)

        return new Response(buffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Evaluacion_${profile.full_name?.replace(/\s+/g, '_')}_${evaluation.eval_date}.pdf"`,
            }
        })
    } catch (error: any) {
        console.error('Error generando PDF de evaluación:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}

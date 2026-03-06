import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getEvalsByPatient } from '@/lib/supabase/anthropometry'

export const dynamic = 'force-dynamic'

export default async function PatientEvalsHistory({ params }: { params: { patientId: string } }) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'nutricionista') redirect('/inicio')

    // Fetch patient data
    const { data: patient } = await supabase
        .from('patients')
        .select('id, profiles(full_name, email)')
        .eq('id', params.patientId)
        .single()

    if (!patient) redirect('/antropometria')

    const evals = await getEvalsByPatient(params.patientId)

    return (
        <main className="max-w-4xl mx-auto p-4 md:p-8">
            <Link href="/antropometria" className="inline-flex items-center text-sm font-semibold text-teal-600 hover:text-teal-700 mb-6 group">
                <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Volver a pacientes
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Historial de Evaluaciones</h1>
                    <p className="text-slate-500 mt-1">
                        Paciente: <strong className="text-slate-700">{Array.isArray(patient.profiles) ? (patient.profiles as unknown as { full_name: string }[])[0]?.full_name : (patient.profiles as unknown as { full_name: string } | null)?.full_name}</strong>
                    </p>
                </div>

                <Link
                    href={`/antropometria/${params.patientId}/nueva`}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition-colors text-center"
                >
                    + Nueva Evaluación
                </Link>
            </div>

            <div className="space-y-4">
                {evals.map(ev => {
                    const d = new Date(ev.eval_date)
                    const dateStr = isNaN(d.getTime()) ? ev.eval_date : d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })

                    return (
                        <Link
                            key={ev.id}
                            href={`/antropometria/${params.patientId}/${ev.id}`}
                            className="bg-white border-2 border-slate-100 p-5 md:p-6 rounded-2xl shadow-sm hover:border-teal-300 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                                    <span className="font-black text-slate-500">N{ev.isak_level}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg">{dateStr}</h3>
                                    <div className="flex space-x-3 text-sm text-slate-500 mt-1">
                                        <span>Peso: <strong>{ev.measures.weight_kg} kg</strong></span>
                                        <span>{ev.results?.body_fat_pct?.value}% Grasa</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 md:space-x-4">
                                {ev.shared_with_patient && (
                                    <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
                                        Visible por paciente
                                    </span>
                                )}
                                <span className="text-slate-400">➔</span>
                            </div>
                        </Link>
                    )
                })}

                {evals.length === 0 && (
                    <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 text-teal-600 mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">Sin evaluaciones previas</h3>
                        <p className="text-slate-500">Hacé click en &quot;Nueva Evaluación&quot; para registrar las primeras medidas antropométricas de este paciente.</p>
                    </div>
                )}
            </div>
        </main>
    )
}

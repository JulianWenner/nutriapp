'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import type { AnthropometryEval, BodyZone } from '@/types'
import BodyFigure from '@/components/anthropometry/BodyFigure'
import ResultIndicatorRow from '@/components/anthropometry/ResultIndicatorRow'
import ZoneLabelRow from '@/components/anthropometry/ZoneLabelRow'

export default function PatientResultsListView() {
    const [evals, setEvals] = useState<AnthropometryEval[]>([])
    const [patientSex, setPatientSex] = useState<'F' | 'M'>('F')
    const [loading, setLoading] = useState(true)
    const [expandedEvalId, setExpandedEvalId] = useState<string | null>(null)
    const [activeZone, setActiveZone] = useState<BodyZone | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                // Get strictly shared patient evals
                const res = await fetch('/api/auth/session')
                const session = await res.json()
                const uid = session.user?.id

                const pRes = await fetch('/api/patients/me', { headers: { 'x-user-id': uid } })
                const pData = await pRes.json()
                if (pData.patient) {
                    setPatientSex(pData.patient.sex || 'F')
                    const eRes = await fetch(`/api/anthropometry?patientId=${pData.patient.id}`)
                    const eData = await eRes.json()
                    // Filter again to be absolutely sure we only show shared ones on this view 
                    const shared = (eData || []).filter((e: AnthropometryEval) => e.shared_with_patient)
                    setEvals(shared)

                    if (shared.length > 0) {
                        setExpandedEvalId(shared[0].id)
                    }
                }
                setLoading(false)
            } catch {
                setLoading(false)
            }
        }
        load()
    }, [])

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando resultados...</div>

    if (evals.length === 0) {
        return (
            <main className="max-w-4xl mx-auto p-4 md:p-8">
                <div className="flex items-center space-x-4 mb-6">
                    <Link href="/mi-evolucion" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                        ←
                    </Link>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Evaluaciones</h1>
                </div>
                <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed mt-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Sin evaluaciones</h3>
                    <p className="text-slate-500">Todavía no hay evaluaciones compartidas.</p>
                </div>
            </main>
        )
    }

    return (
        <main className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
            <div className="flex items-center space-x-4 mb-8">
                <Link href="/mi-evolucion" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                    ←
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Evaluaciones de Antropometría</h1>
                    <p className="text-slate-500 mt-1">Detalle de tus mediciones por fecha.</p>
                </div>
            </div>

            <div className="space-y-6">
                {evals.map(ev => {
                    const isExpanded = expandedEvalId === ev.id
                    const d = new Date(ev.eval_date)
                    const dateStr = isNaN(d.getTime()) ? ev.eval_date : d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
                    const res = ev.results

                    return (
                        <div key={ev.id} className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
                            {/* Card Header (Clickable) */}
                            <button
                                onClick={() => {
                                    setExpandedEvalId(isExpanded ? null : ev.id)
                                    setActiveZone(null)
                                }}
                                className="w-full text-left p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors focus:outline-none"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0 transition-colors ${isExpanded ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                        <span className="font-black">ISAK</span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-slate-800 text-xl capitalize">{dateStr}</h3>
                                        <div className="flex space-x-3 text-sm font-semibold text-slate-500 mt-1">
                                            <span>Peso: {ev.measures.weight_kg} kg</span>
                                            <span>{res?.body_fat_pct?.value}% Grasa</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-full transition-transform text-slate-400 bg-white shadow-sm border border-slate-100 ${isExpanded ? 'rotate-180 bg-teal-50 border-teal-200 text-teal-600' : ''}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && res && (
                                <div className="p-5 md:p-6 pt-0 border-t border-slate-100 bg-slate-50/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">

                                        {/* Metricas Lista */}
                                        <div className="bg-white p-5 rounded-2xl border border-slate-200">
                                            <h4 className="font-bold text-slate-800 mb-4 text-base">Indicadores</h4>
                                            <div className="flex flex-col">
                                                <ResultIndicatorRow label="IMC" value={res.bmi.value} category={res.bmi.category} categoryLabel={res.bmi.label} reference={res.bmi.reference} />
                                                <ResultIndicatorRow label="% Grasa Corporal" value={res.body_fat_pct.value} unit="%" category={res.body_fat_pct.category} categoryLabel={res.body_fat_pct.label} reference={res.body_fat_pct.reference} />
                                                <ResultIndicatorRow label="Masa Muscular" value={res.muscle_mass_kg.value} unit="kg" category={res.muscle_mass_kg.category} categoryLabel={res.muscle_mass_kg.label} reference={res.muscle_mass_kg.reference} />
                                                <ResultIndicatorRow label="Rel. Cintura-Cadera" value={res.whr.value} category={res.whr.category} categoryLabel={res.whr.label} reference={res.whr.reference} />
                                            </div>
                                        </div>

                                        {/* Figura Interactiva */}
                                        <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col items-center">
                                            <h4 className="font-bold text-slate-800 mb-2 text-base text-center w-full">Mapa Corporal</h4>
                                            <p className="text-xs text-slate-400 mb-6 text-center">Toca las zonas iluminadas para ver qué significa.</p>

                                            <div className="w-full max-w-[200px] mb-6 relative">
                                                <BodyFigure
                                                    sex={patientSex}
                                                    results={res}
                                                    activeZone={activeZone}
                                                    onZoneClick={setActiveZone}
                                                />
                                            </div>

                                            <div className="w-full grid grid-cols-2 gap-2">
                                                <ZoneLabelRow
                                                    label="Torso / Grasa"
                                                    value={res.body_fat_pct.value} unit="%"
                                                    category={res.body_fat_pct.category}
                                                    isActive={activeZone === 'chest'} onClick={() => setActiveZone('chest')}
                                                />
                                                <ZoneLabelRow
                                                    label="Músculo" // Generalized instead of separating arms/thighs
                                                    value={res.muscle_mass_kg.value} unit="kg"
                                                    category={res.muscle_mass_kg.category}
                                                    isActive={activeZone === 'arms'} onClick={() => setActiveZone('arms')}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </main>
    )
}

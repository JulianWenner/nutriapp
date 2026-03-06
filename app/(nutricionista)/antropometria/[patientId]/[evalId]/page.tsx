'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import type { AnthropometryEval, BodyZone } from '@/types'
import ResultsHeroCard from '@/components/anthropometry/ResultsHeroCard'
import ResultIndicatorRow from '@/components/anthropometry/ResultIndicatorRow'
import SomatotypeChart from '@/components/anthropometry/SomatotypeChart'
import BodyFigure from '@/components/anthropometry/BodyFigure'
import ZoneLabelRow from '@/components/anthropometry/ZoneLabelRow'

export default function EvalResultDetail({ params }: { params: { patientId: string, evalId: string } }) {
    const [evalData, setEvalData] = useState<AnthropometryEval | null>(null)
    const [prevEvalData, setPrevEvalData] = useState<AnthropometryEval | null>(null)
    const [patientInfo, setPatientInfo] = useState<{ name: string, sex: 'F' | 'M' } | null>(null)
    const [loading, setLoading] = useState(true)
    const [togglingShare, setTogglingShare] = useState(false)

    // Interactive SVG statie
    const [activeZone, setActiveZone] = useState<BodyZone | null>(null)
    const [showFigure, setShowFigure] = useState(false)

    useEffect(() => {
        Promise.all([
            fetch(`/api/anthropometry/${params.evalId}`).then(r => r.json()),
            fetch(`/api/anthropometry?patientId=${params.patientId}`).then(r => r.json()),
            fetch(`/api/patients/${params.patientId}`).then(r => r.json())
        ]).then(([current, allEvals, patientRes]) => {
            if (current.id) {
                setEvalData(current)
                setPatientInfo({
                    name: patientRes.profile?.full_name || 'Paciente',
                    sex: patientRes.patient?.sex || 'F'
                })

                // Find previous eval to calculate deltas
                const sorted = (allEvals as AnthropometryEval[]).sort((a, b) => new Date(b.eval_date).getTime() - new Date(a.eval_date).getTime())
                const currentIndex = sorted.findIndex(e => e.id === current.id)
                if (currentIndex >= 0 && currentIndex + 1 < sorted.length) {
                    setPrevEvalData(sorted[currentIndex + 1])
                }
            }
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [params.evalId, params.patientId])

    const handleToggleShare = async () => {
        if (!evalData) return
        setTogglingShare(true)
        const newStatus = !evalData.shared_with_patient
        try {
            const res = await fetch(`/api/anthropometry/${evalData.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shared_with_patient: newStatus })
            })
            if (res.ok) {
                setEvalData({ ...evalData, shared_with_patient: newStatus })
            }
        } finally {
            setTogglingShare(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando resultados...</div>
    if (!evalData || !evalData.results) return <div className="p-8 text-center text-rose-500">Error: Evaluación no encontrada o sin resultados calculados.</div>

    // Calculate deltas
    const deltas: { weight?: number, bmi?: number, bfPct?: number, muscle?: number } = {}
    if (prevEvalData?.results) {
        deltas.weight = evalData.measures.weight_kg - prevEvalData.measures.weight_kg
        if (evalData.results.bmi && prevEvalData.results.bmi) {
            deltas.bmi = evalData.results.bmi.value - prevEvalData.results.bmi.value
        }
        if (evalData.results.body_fat_pct && prevEvalData.results.body_fat_pct) {
            deltas.bfPct = evalData.results.body_fat_pct.value - prevEvalData.results.body_fat_pct.value
        }
        if (evalData.results.muscle_mass_kg && prevEvalData.results.muscle_mass_kg) {
            deltas.muscle = evalData.results.muscle_mass_kg.value - prevEvalData.results.muscle_mass_kg.value
        }
    }

    const { results } = evalData

    return (
        <main className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
            <Link href={`/antropometria/${params.patientId}`} className="text-sm font-semibold text-teal-600 mb-6 group inline-flex items-center">
                <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Volver al historial
            </Link>

            <ResultsHeroCard
                date={evalData.eval_date}
                isakLevel={evalData.isak_level}
                patientName={patientInfo?.name}
                weight={evalData.measures.weight_kg}
                bmi={results.bmi.value}
                bfPct={results.body_fat_pct.value}
                muscle={results.muscle_mass_kg.value}
                deltas={deltas}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                {/* Panel Izquierdo: Acciones y Tabla */}
                <div className="space-y-6">
                    {/* Acciones Rápidas */}
                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 flex flex-col gap-3">
                        <button
                            onClick={handleToggleShare}
                            disabled={togglingShare}
                            className={`flex items-center justify-between p-4 rounded-xl font-bold transition-all ${evalData.shared_with_patient
                                ? 'bg-teal-50 text-teal-700 border border-teal-200'
                                : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${evalData.shared_with_patient ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-400'}`}>
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </div>
                                <span className={togglingShare ? 'opacity-50' : ''}>
                                    {evalData.shared_with_patient ? 'Visible por paciente' : 'Oculto al paciente'}
                                </span>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${evalData.shared_with_patient ? 'bg-teal-500' : 'bg-slate-300'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${evalData.shared_with_patient ? 'translate-x-6' : 'translate-x-0'}`}></div>
                            </div>
                        </button>

                        <button
                            onClick={() => setShowFigure(!showFigure)}
                            className="flex items-center justify-center gap-2 p-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors md:hidden"
                        >
                            <svg className="w-5 h-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            {showFigure ? 'Ocultar Figura Corporal' : 'Ver Figura Corporal'}
                        </button>

                        <button disabled title="Siguiente fase" className="flex items-center justify-center gap-2 p-4 rounded-xl font-bold border-2 border-slate-100 text-slate-400 bg-white">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Exportar PDF (Próximamente)
                        </button>
                    </div>

                    {/* Tabla de Indicadores */}
                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 md:p-6">
                        <h3 className="font-bold text-slate-800 mb-4 text-lg">Métricas Detalladas</h3>

                        <div className="flex flex-col">
                            <ResultIndicatorRow label="IMC" value={results.bmi.value} category={results.bmi.category} categoryLabel={results.bmi.label} reference={results.bmi.reference} />
                            <ResultIndicatorRow label="% Grasa Corporal" value={results.body_fat_pct.value} unit="%" category={results.body_fat_pct.category} categoryLabel={results.body_fat_pct.label} reference={results.body_fat_pct.reference} />
                            <ResultIndicatorRow label="Masa Muscular" value={results.muscle_mass_kg.value} unit="kg" category={results.muscle_mass_kg.category} categoryLabel={results.muscle_mass_kg.label} reference={results.muscle_mass_kg.reference} />
                            <ResultIndicatorRow label="Masa Ósea" value={results.bone_mass_kg.value} unit="kg" category={results.bone_mass_kg.category} categoryLabel={results.bone_mass_kg.label} reference={results.bone_mass_kg.reference} />
                            <ResultIndicatorRow label="Masa Residual" value={results.residual_mass_kg.value} unit="kg" category={results.residual_mass_kg.category} categoryLabel={results.residual_mass_kg.label} reference={results.residual_mass_kg.reference} />
                            <ResultIndicatorRow label="Rel. Cintura-Cadera" value={results.whr.value} category={results.whr.category} categoryLabel={results.whr.label} reference={results.whr.reference} />
                        </div>
                    </div>

                    {/* Somatotipo */}
                    {results.somatotype && (
                        <SomatotypeChart
                            endomorphy={results.somatotype.endomorphy}
                            mesomorphy={results.somatotype.mesomorphy}
                            ectomorphy={results.somatotype.ectomorphy}
                            dominant={results.somatotype.dominant}
                        />
                    )}
                </div>

                {/* Panel Derecho: Figura Interactiva */}
                <div className={`md:block ${showFigure ? 'block' : 'hidden'}`}>
                    <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 lg:p-8 sticky top-8">
                        <div className="text-center mb-6">
                            <h3 className="font-bold text-slate-800 text-xl">Mapa Corporal</h3>
                            <p className="text-slate-500 text-sm mt-1">Hacé click en las zonas para ver detalle</p>
                        </div>

                        <div className="mb-8">
                            <BodyFigure
                                sex={patientInfo?.sex || 'F'}
                                results={results}
                                activeZone={activeZone}
                                onZoneClick={setActiveZone}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <ZoneLabelRow
                                label="Torso / Grasa"
                                value={results.body_fat_pct.value} unit="%"
                                category={results.body_fat_pct.category}
                                isActive={activeZone === 'chest'} onClick={() => setActiveZone('chest')}
                            />
                            <ZoneLabelRow
                                label="Brazos"
                                value={results.muscle_mass_kg.value} unit="kg"
                                category={results.muscle_mass_kg.category}
                                isActive={activeZone === 'arms'} onClick={() => setActiveZone('arms')}
                            />
                            <ZoneLabelRow
                                label="Cintura (RCC)"
                                value={results.whr.value} unit=""
                                category={results.whr.category}
                                isActive={activeZone === 'waist'} onClick={() => setActiveZone('waist')}
                            />
                            <ZoneLabelRow
                                label="Piernas"
                                value={results.muscle_mass_kg.value} unit="kg"
                                category={results.muscle_mass_kg.category}
                                isActive={activeZone === 'thighs'} onClick={() => setActiveZone('thighs')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

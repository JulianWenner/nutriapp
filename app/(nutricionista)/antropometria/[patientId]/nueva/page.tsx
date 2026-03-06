'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ISAKLevel, AnthropometryMeasures, AnthropometryResults } from '@/types'
import { calculateAllResults } from '@/lib/formulas/isak'
import ISAKLevelSelector from '@/components/anthropometry/ISAKLevelSelector'
import MeasureFormSection from '@/components/anthropometry/MeasureFormSection'
import MeasureInput from '@/components/anthropometry/MeasureInput'

export default function NewEvalForm({ params }: { params: { patientId: string } }) {
    const router = useRouter()

    const [patientInfo, setPatientInfo] = useState<{ age: number, sex: 'F' | 'M', name: string } | null>(null)
    const [isakLevel, setIsakLevel] = useState<ISAKLevel | null>(null)

    // Estado del stepper / accordion
    const [activeSection, setActiveSection] = useState<'basicos' | 'pliegues' | 'circunferencias' | 'diametros' | 'longitudes' | 'resultados'>('basicos')
    const [completedSections, setCompletedSections] = useState<string[]>([])

    const [measures, setMeasures] = useState<Partial<AnthropometryMeasures>>({})
    const [results, setResults] = useState<AnthropometryResults | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    // Fetch base patient details required for formulas
    useEffect(() => {
        fetch(`/api/patients/${params.patientId}`)
            .then(res => res.json())
            .then(data => {
                if (data.patient) {
                    const birthDate = new Date(data.patient.birth_date)
                    const ageDifMs = Date.now() - birthDate.getTime()
                    const ageDate = new Date(ageDifMs)
                    const age = Math.abs(ageDate.getUTCFullYear() - 1970)

                    setPatientInfo({
                        age: age,
                        sex: data.patient.sex || 'F',
                        name: data.profile.full_name
                    })
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [params.patientId])

    const handleUpdateMeasure = (key: keyof AnthropometryMeasures, val: number | undefined) => {
        setMeasures(prev => ({ ...prev, [key]: val }))
        // Clear results if recalculating is needed
        setResults(null)
    }

    const markCompleted = (sec: string) => {
        if (!completedSections.includes(sec)) {
            setCompletedSections(prev => [...prev, sec])
        }
    }

    const handleNext = (nextSec: typeof activeSection, currentSec: string) => {
        markCompleted(currentSec)
        setActiveSection(nextSec)
    }

    const handleCalculate = () => {
        if (!patientInfo || !isakLevel) return

        // Validación básica (pesos altura required)
        if (!measures.weight_kg || !measures.height_cm) {
            setErrorMsg('Peso y Altura son obligatorios para calcular cualquier resultado.')
            return
        }

        const res = calculateAllResults(measures as AnthropometryMeasures, patientInfo.age, patientInfo.sex, isakLevel)
        setResults(res)
        handleNext('resultados', 'longitudes')
    }

    const handleSave = async () => {
        if (!patientInfo || !isakLevel || !results) return
        setSaving(true)
        setErrorMsg('')

        try {
            const today = new Date().toISOString().split('T')[0]
            const payload = {
                patient_id: params.patientId,
                eval_date: today,
                isak_level: isakLevel,
                shared_with_patient: false,
                measures: measures as AnthropometryMeasures,
                results: results
            }

            const res = await fetch('/api/anthropometry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Error al guardar la evaluación')
            }

            const savedEval = await res.json()
            router.push(`/antropometria/${params.patientId}/${savedEval.id}`)
            router.refresh()
        } catch (e: unknown) {
            setErrorMsg((e as Error).message)
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando paciente...</div>
    if (!patientInfo) return <div className="p-8 text-center text-rose-500">Error cargando paciente. Revisa que tenga Sexo y Fecha de Nacimiento en la tabla `patients`.</div>

    // PASO 0: ELEGIR NIVEL ISAK
    if (!isakLevel) {
        return (
            <main className="max-w-3xl mx-auto p-4 md:p-8">
                <button onClick={() => router.back()} className="text-sm font-semibold text-teal-600 mb-6 group inline-flex items-center">
                    <span className="mr-2 group-hover:-translate-x-1 transition-transform">←</span> Volver
                </button>
                <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h1 className="text-2xl font-black text-slate-800">Nueva Evaluación Antropométrica</h1>
                    <p className="text-slate-500">{patientInfo.name} • {patientInfo.age} años • Sexo: {patientInfo.sex === 'F' ? 'Femenino' : 'Masculino'}</p>
                </div>

                <h2 className="font-bold text-slate-700 mb-4 px-2">Seleccioná el protocolo a aplicar hoy:</h2>
                <ISAKLevelSelector selected={isakLevel} onSelect={setIsakLevel} />
            </main>
        )
    }

    // PASO 1 y 2: FORMULARIO + RESULTADOS
    return (
        <main className="max-w-3xl mx-auto p-4 md:p-8 pb-32">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Registro ISAK N{isakLevel}</h1>
                <button
                    onClick={() => setIsakLevel(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                    Cambiar Nivel
                </button>
            </div>

            {errorMsg && (
                <div className="bg-rose-50 text-rose-700 p-4 rounded-xl mb-6 text-sm font-bold border border-rose-200">
                    {errorMsg}
                </div>
            )}

            <div className="space-y-4">
                <MeasureFormSection
                    title="1. Datos Básicos"
                    isOpen={activeSection === 'basicos'}
                    isCompleted={completedSections.includes('basicos')}
                    onToggle={() => setActiveSection('basicos')}
                >
                    <MeasureInput label="Peso Coporal" unit="kg" value={measures.weight_kg} onChange={v => handleUpdateMeasure('weight_kg', v)} />
                    <MeasureInput label="Talla (Altura)" unit="cm" value={measures.height_cm} onChange={v => handleUpdateMeasure('height_cm', v)} />
                    <div className="md:col-span-2 pt-2">
                        <button onClick={() => handleNext('pliegues', 'basicos')} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors">Siguiente paso ➔</button>
                    </div>
                </MeasureFormSection>

                <MeasureFormSection
                    title="2. Pliegues Cutáneos"
                    isOpen={activeSection === 'pliegues'}
                    isCompleted={completedSections.includes('pliegues')}
                    onToggle={() => setActiveSection('pliegues')}
                >
                    <MeasureInput label="Tríceps" unit="mm" value={measures.skinfold_triceps} onChange={v => handleUpdateMeasure('skinfold_triceps', v)} />
                    <MeasureInput label="Subescapular" unit="mm" value={measures.skinfold_subscapular} onChange={v => handleUpdateMeasure('skinfold_subscapular', v)} />
                    <MeasureInput label="Supraespinal (Suprailíaco)" unit="mm" value={measures.skinfold_suprailiac} onChange={v => handleUpdateMeasure('skinfold_suprailiac', v)} />
                    <MeasureInput label="Pantorrilla Medial" unit="mm" value={measures.skinfold_calf_medial} onChange={v => handleUpdateMeasure('skinfold_calf_medial', v)} />

                    {isakLevel === 2 && (
                        <>
                            <MeasureInput label="Bíceps" unit="mm" value={measures.skinfold_biceps} onChange={v => handleUpdateMeasure('skinfold_biceps', v)} />
                            <MeasureInput label="Cresta Ilíaca" unit="mm" value={measures.skinfold_iliac_crest} onChange={v => handleUpdateMeasure('skinfold_iliac_crest', v)} />
                            <MeasureInput label="Abdominal" unit="mm" value={measures.skinfold_abdominal} onChange={v => handleUpdateMeasure('skinfold_abdominal', v)} />
                            <MeasureInput label="Muslo Frontal" unit="mm" value={measures.skinfold_front_thigh} onChange={v => handleUpdateMeasure('skinfold_front_thigh', v)} />
                        </>
                    )}

                    <div className="md:col-span-2 pt-2">
                        <button onClick={() => handleNext('circunferencias', 'pliegues')} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors">Siguiente paso ➔</button>
                    </div>
                </MeasureFormSection>

                <MeasureFormSection
                    title="3. Perímetros / Circunferencias"
                    isOpen={activeSection === 'circunferencias'}
                    isCompleted={completedSections.includes('circunferencias')}
                    onToggle={() => setActiveSection('circunferencias')}
                >
                    <MeasureInput label="Cintura (Mínima)" unit="cm" value={measures.circ_waist} onChange={v => handleUpdateMeasure('circ_waist', v)} />
                    <MeasureInput label="Cadera (Máxima)" unit="cm" value={measures.circ_hip} onChange={v => handleUpdateMeasure('circ_hip', v)} />
                    <MeasureInput label="Brazo Relajado" unit="cm" value={measures.circ_arm_relaxed} onChange={v => handleUpdateMeasure('circ_arm_relaxed', v)} />
                    <MeasureInput label="Pantorrilla" unit="cm" value={measures.circ_calf} onChange={v => handleUpdateMeasure('circ_calf', v)} />

                    {isakLevel === 2 && (
                        <>
                            <MeasureInput label="Cabeza" unit="cm" value={measures.circ_head} onChange={v => handleUpdateMeasure('circ_head', v)} />
                            <MeasureInput label="Cuello" unit="cm" value={measures.circ_neck} onChange={v => handleUpdateMeasure('circ_neck', v)} />
                            <MeasureInput label="Brazo Flexionado" unit="cm" value={measures.circ_arm_flexed} onChange={v => handleUpdateMeasure('circ_arm_flexed', v)} />
                            <MeasureInput label="Muslo Medio" unit="cm" value={measures.circ_mid_thigh} onChange={v => handleUpdateMeasure('circ_mid_thigh', v)} />
                        </>
                    )}

                    <div className="md:col-span-2 pt-2">
                        {isakLevel === 1 ? (
                            <button onClick={handleCalculate} className="w-full bg-teal-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-colors">⚡ Calcular Resultados</button>
                        ) : (
                            <button onClick={() => handleNext('diametros', 'circunferencias')} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors">Siguiente paso ➔</button>
                        )}
                    </div>
                </MeasureFormSection>

                {isakLevel === 2 && (
                    <MeasureFormSection
                        title="4. Diámetros Óseos"
                        isOpen={activeSection === 'diametros'}
                        isCompleted={completedSections.includes('diametros')}
                        onToggle={() => setActiveSection('diametros')}
                    >
                        <MeasureInput label="Húmero (Biepicondilar)" unit="cm" value={measures.diam_humerus} onChange={v => handleUpdateMeasure('diam_humerus', v)} />
                        <MeasureInput label="Fémur (Biepicondilar)" unit="cm" value={measures.diam_femur} onChange={v => handleUpdateMeasure('diam_femur', v)} />
                        <div className="md:col-span-2 pt-2">
                            <button onClick={() => handleNext('longitudes', 'diametros')} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl hover:bg-slate-900 transition-colors">Siguiente paso ➔</button>
                        </div>
                    </MeasureFormSection>
                )}

                {isakLevel === 2 && (
                    <MeasureFormSection
                        title="5. Longitudes"
                        isOpen={activeSection === 'longitudes'}
                        isCompleted={completedSections.includes('longitudes')}
                        onToggle={() => setActiveSection('longitudes')}
                    >
                        <MeasureInput label="Estatura Sentado" unit="cm" value={measures.height_sitting} onChange={v => handleUpdateMeasure('height_sitting', v)} />
                        <MeasureInput label="Envergadura" unit="cm" value={measures.wingspan} onChange={v => handleUpdateMeasure('wingspan', v)} />

                        <div className="md:col-span-2 pt-2">
                            <button onClick={handleCalculate} className="w-full bg-teal-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-teal-600/30 hover:bg-teal-700 transition-colors">⚡ Calcular Resultados</button>
                        </div>
                    </MeasureFormSection>
                )}

            </div>

            {/* Results Preview & Save button */}
            {results && (
                <div className="mt-12 bg-emerald-50 border-2 border-emerald-500 rounded-3xl p-6 text-center animate-in fade-in slide-in-from-bottom-8">
                    <div className="inline-flex w-16 h-16 bg-emerald-100 rounded-full items-center justify-center text-emerald-600 mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h2 className="text-2xl font-black text-emerald-900 mb-2">¡Cálculos exitosos!</h2>
                    <p className="text-emerald-700 font-medium mb-6">Encontramos resultados dentro de rangos normales y calculamos la composición corporal de {patientInfo.name}.</p>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full max-w-sm mx-auto bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center"
                    >
                        {saving ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : '💾 Guardar Evaluación Completa'}
                    </button>
                    <p className="text-xs text-emerald-600/70 mt-4 opacity-70">
                        Podrás revisar los detalles, la figura humana y comparar métricas en la siguiente pantalla.
                    </p>
                </div>
            )}
        </main>
    )
}

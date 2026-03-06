import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSharedEvals } from '@/lib/supabase/anthropometry'
import EvolutionLineChart from '@/components/charts/EvolutionLineChart'
import MetricCard from '@/components/charts/MetricCard'

export const dynamic = 'force-dynamic'

export default async function EvolutionChartsPage() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'paciente') redirect('/inicio')

    const { data: patient } = await supabase.from('patients').select('id').eq('profile_id', user.id).single()
    if (!patient) redirect('/inicio')

    const evals = await getSharedEvals(patient.id)

    // Sort ascending for charts (oldest first)
    const sortedEvals = [...evals].sort((a, b) => new Date(a.eval_date).getTime() - new Date(b.eval_date).getTime())

    // Prepare chart datasets
    const weightData = sortedEvals.map(e => ({
        date: new Date(e.eval_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
        value: e.measures.weight_kg
    }))

    const fatData = sortedEvals
        .filter(e => e.results?.body_fat_pct)
        .map(e => ({
            date: new Date(e.eval_date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
            value: e.results!.body_fat_pct.value
        }))

    // Calculate deltas from very FIRST eval (baseline) to LATEST eval (current)
    let weightDelta, fatDelta, muscleDelta, waistDelta
    let currentWeight, currentFat, currentMuscle, currentWaist

    if (sortedEvals.length > 0) {
        const first = sortedEvals[0]
        const last = sortedEvals[sortedEvals.length - 1]

        currentWeight = last.measures.weight_kg
        if (sortedEvals.length > 1) weightDelta = currentWeight - first.measures.weight_kg

        if (last.results?.body_fat_pct) {
            currentFat = last.results.body_fat_pct.value
            if (first.results?.body_fat_pct) fatDelta = currentFat - first.results.body_fat_pct.value
        }

        if (last.results?.muscle_mass_kg) {
            currentMuscle = last.results.muscle_mass_kg.value
            if (first.results?.muscle_mass_kg) muscleDelta = currentMuscle - first.results.muscle_mass_kg.value
        }

        if (last.measures.circ_waist) {
            currentWaist = last.measures.circ_waist
            if (first.measures.circ_waist) waistDelta = currentWaist - first.measures.circ_waist
        }
    }

    return (
        <main className="max-w-4xl mx-auto p-4 md:p-8 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Mi Evolución</h1>
                    <p className="text-slate-500 mt-1">Compará tus medidas desde que empezaste.</p>
                </div>

                <Link
                    href="/resultados"
                    className="text-teal-600 bg-teal-50 hover:bg-teal-100 font-bold px-6 py-3 rounded-xl border border-teal-200 transition-colors inline-block text-center"
                >
                    Ver detalle por fecha ➔
                </Link>
            </div>

            {evals.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-3xl border border-slate-200 border-dashed mt-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Sin evaluaciones compartidas</h3>
                    <p className="text-slate-500">Tu nutricionista todavía no compartió ninguna evaluación antropométrica con vos.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Tarjetas de Métricas Principales (Delta vs Inicio) */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <MetricCard title="Peso Actual" currentValue={currentWeight?.toString() || '-'} unit="kg" deltaValue={weightDelta} inverseColors={true} />
                        <MetricCard title="% Grasa" currentValue={currentFat?.toString() || '-'} unit="%" deltaValue={fatDelta} inverseColors={true} />
                        <MetricCard title="Masa Muscular" currentValue={currentMuscle?.toString() || '-'} unit="kg" deltaValue={muscleDelta} inverseColors={false} />
                        <MetricCard title="Cintura" currentValue={currentWaist?.toString() || '-'} unit="cm" deltaValue={waistDelta} inverseColors={true} />
                    </div>

                    {/* Gráficas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800 text-lg">Evolución de Peso</h3>
                                <div className="px-3 py-1 bg-teal-50 text-teal-700 font-bold text-xs rounded-full border border-teal-200">
                                    {weightData.length} mediciones
                                </div>
                            </div>
                            <EvolutionLineChart data={weightData} color="#0D7C72" unit="kg" />
                        </div>

                        <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-slate-800 text-lg">Evolución de Grasa</h3>
                                <div className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-full border border-rose-200">
                                    {fatData.length} mediciones
                                </div>
                            </div>
                            <EvolutionLineChart data={fatData} color="#E05555" unit="%" />
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

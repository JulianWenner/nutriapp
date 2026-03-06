'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import PlanCard from '@/components/plans/PlanCard'
import type { NutritionPlan } from '@/types'

export default function PlanesPage() {
    const [plans, setPlans] = useState<NutritionPlan[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await fetch('/api/plans')
                if (res.ok) {
                    const data = await res.json()
                    setPlans(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchPlans()
    }, [])

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Planes Nutricionales</h1>
                    <p className="text-slate-500 mt-1">Cree planes base y asígnelos a sus pacientes.</p>
                </div>
                <Link
                    href="/planes/nuevo"
                    className="inline-flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-teal-600/20 active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nuevo Plan</span>
                </Link>
            </header>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Cargando planes...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plans.length === 0 ? (
                        <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                            <p className="font-medium text-slate-600 mb-2">No hay planes creados aún.</p>
                            <p className="text-sm">Arme su primer plan nutricional para luego asignarlo.</p>
                        </div>
                    ) : (
                        plans.map(plan => (
                            <Link href={`/planes/${plan.id}`} key={plan.id} className="block group">
                                <PlanCard plan={plan} />
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

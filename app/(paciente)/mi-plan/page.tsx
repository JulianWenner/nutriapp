'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NutritionPlan, PlanMeal, MealAdherence, MEAL_SLOT_LABELS } from '@/types'
import { getCurrentWeekStart, getCurrentDayOfWeek } from '@/lib/utils/dates'
import DayTabSelector from '@/components/patient-portal/DayTabSelector'
import AdherenceBar from '@/components/patient-portal/AdherenceBar'
import MealSlotCard from '@/components/patient-portal/MealSlotCard'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

export default function MiPlanPage() {
    const [plan, setPlan] = useState<NutritionPlan | null>(null)
    const [selectedDay, setSelectedDay] = useState<number>(getCurrentDayOfWeek())
    const [adherence, setAdherence] = useState<MealAdherence[]>([])
    const [loading, setLoading] = useState(true)
    const [weekStart] = useState(getCurrentWeekStart())

    useEffect(() => {
        const loadData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Obtener ID del paciente
            const { data: patient } = await supabase
                .from('patients')
                .select('id')
                .eq('profile_id', user.id)
                .single()

            if (!patient) return

            // 2. Obtener plan activo y adherencia en paralelo
            const [planRes, adherenceRes] = await Promise.all([
                fetch(`/api/plans/active?patientId=${patient.id}`).then(r => r.json()),
                fetch(`/api/adherence?weekStart=${weekStart}`).then(r => r.json())
            ])

            if (planRes && !planRes.error) setPlan(planRes)
            if (adherenceRes && !adherenceRes.error) setAdherence(adherenceRes)

            setLoading(false)
        }
        loadData()
    }, [weekStart])

    // Handler para cambios de adherencia (optimistic update)
    const handleAdherenceChange = async (planMealId: string, completed: boolean, comment?: string) => {
        const oldAdherence = [...adherence]

        // Update local
        const newAdherence = [...adherence]
        const existingIdx = newAdherence.findIndex(a => a.plan_meal_id === planMealId)

        if (existingIdx >= 0) {
            newAdherence[existingIdx] = {
                ...newAdherence[existingIdx],
                completed,
                comment: comment !== undefined ? comment : (newAdherence[existingIdx].comment || '')
            }
        } else {
            // New entry (optimistic)
            newAdherence.push({
                id: 'temp-' + Date.now(),
                patient_id: '', // Will be set by API
                plan_meal_id: planMealId,
                week_start: weekStart,
                completed,
                comment: comment || ''
            })
        }
        setAdherence(newAdherence)

        // API call
        try {
            const res = await fetch('/api/adherence', {
                method: 'POST',
                body: JSON.stringify({ plan_meal_id: planMealId, week_start: weekStart, completed, comment })
            })
            if (!res.ok) throw new Error('Error al guardar')
            const saved = await res.json()

            // Sync official ID from server
            setAdherence(prev => prev.map(a => a.plan_meal_id === planMealId ? saved : a))
        } catch (error) {
            setAdherence(oldAdherence)
            toast.error('No se pudo guardar el cambio. Reintentá.')
        }
    }

    if (loading) {
        return (
            <div className="max-w-lg mx-auto p-4 space-y-6">
                <Skeleton className="h-[72px] rounded-2xl w-full" />
                <Skeleton className="h-32 rounded-3xl w-full" />
                <Skeleton className="h-64 rounded-3xl w-full" />
            </div>
        )
    }

    if (!plan) {
        return (
            <div className="max-w-lg mx-auto p-8 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <h3 className="text-xl font-black text-slate-800">Todavía no tenés un plan activo</h3>
                <p className="text-slate-500 text-sm">Consultá con tu nutricionista para recibir tu primer seguimiento personalizado.</p>
            </div>
        )
    }

    const todayMeals = plan.meals?.filter(m => m.day_of_week === selectedDay) || []
    const dayCompletedCount = todayMeals.filter(m => adherence.find(a => a.plan_meal_id === m.id && a.completed)).length

    // Calcular completion por día para el selector
    const dailyCompletion: Record<number, boolean> = {}
    for (let day = 1; day <= 7; day++) {
        const dayMeals = plan.meals?.filter(m => m.day_of_week === day) || []
        const dayCompletedMeals = dayMeals.filter(m => adherence.find(a => a.plan_meal_id === m.id && a.completed))
        dailyCompletion[day] = dayMeals.length > 0 && dayMeals.length === dayCompletedMeals.length
    }

    const currentHour = new Date().getHours()

    return (
        <main className="min-h-screen pb-20 bg-emerald-50/20">
            <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Mi Seguimiento</p>
                        <h1 className="text-3xl font-black text-slate-900 leading-none">Mi Plan</h1>
                    </div>
                </div>

                {/* Día Selector */}
                <DayTabSelector
                    selectedDay={selectedDay}
                    onDaySelect={setSelectedDay}
                    dailyCompletion={dailyCompletion}
                />

                {/* Resumen del día */}
                <AdherenceBar completed={dayCompletedCount} total={todayMeals.length} />

                {/* Comidas */}
                <div className="space-y-4 pt-2">
                    {todayMeals.sort((a, b) => getSlotOrder(a.meal_slot) - getSlotOrder(b.meal_slot)).map((meal) => {
                        const mealAdherence = adherence.find(a => a.plan_meal_id === meal.id)
                        let status: any = 'Pendiente'
                        if (mealAdherence?.completed) status = 'Cumplido'
                        else if (getSlotHour(meal.meal_slot) > currentHour) status = 'Más tarde'

                        return (
                            <MealSlotCard
                                key={meal.id}
                                slot={meal.meal_slot}
                                dishes={meal.dishes?.map(d => ({ id: meal.id, name: d.name })) || []}
                                adherence={{ [meal.id]: { completed: mealAdherence?.completed || false, comment: mealAdherence?.comment || '' } }}
                                onAdherenceToggle={(id, val) => handleAdherenceChange(id, val)}
                                onCommentChange={(id, val) => handleAdherenceChange(id, mealAdherence?.completed || false, val)}
                                status={status}
                            />
                        )
                    })}

                    {todayMeals.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-400 text-sm italic">Sin comidas asignadas para este día.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}

function getSlotOrder(slot: string): number {
    const order = ['desayuno', 'colacion_manana', 'almuerzo', 'merienda', 'colacion_tarde', 'cena', 'colacion_noche']
    return order.indexOf(slot)
}

function getSlotHour(slot: string): number {
    const hours: any = {
        desayuno: 8, colacion_manana: 11, almuerzo: 13, merienda: 17, colacion_tarde: 19, cena: 21, colacion_noche: 23
    }
    return hours[slot] || 0
}

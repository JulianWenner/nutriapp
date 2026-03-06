'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { NutritionPlan, PlanMeal, Dish, MealSlot } from '@/types'
import { DAY_LABELS } from '@/types'
import DaySelector from '@/components/plans/DaySelector'
import MealSlotSection from '@/components/plans/MealSlotSection'
import DayMacroBar from '@/components/plans/DayMacroBar'
import DishSelectorDrawer from '@/components/dishes/DishSelectorDrawer'
import AssignPlanModal from '@/components/plans/AssignPlanModal'
import { calculateDayMacros } from '@/lib/formulas/macros'
import { FileText } from 'lucide-react'

const MEAL_SLOTS: MealSlot[] = [
    'desayuno', 'colacion_manana', 'almuerzo',
    'merienda', 'colacion_tarde', 'cena', 'colacion_noche'
]

export default function PlanEditorPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const isNew = params.id === 'nuevo'
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)

    // Header setup
    const [name, setName] = useState('')
    const [targetKcal, setTargetKcal] = useState<number | ''>('')
    const [targetP, setTargetP] = useState<number | ''>('')
    const [targetC, setTargetC] = useState<number | ''>('')
    const [targetF, setTargetF] = useState<number | ''>('')

    // Meals state: day -> slot -> array of Dishes
    // For easy handling locally
    const [planMealsByDay, setPlanMealsByDay] = useState<Record<number, Record<string, Dish[]>>>({})
    const [selectedDay, setSelectedDay] = useState(1) // 1=Lunes

    // Drawers & Modals
    const [selectingSlot, setSelectingSlot] = useState<MealSlot | null>(null)
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

    useEffect(() => {
        if (isNew) return

        const fetchPlan = async () => {
            try {
                const res = await fetch(`/api/plans/${params.id}`)
                if (res.ok) {
                    const data: NutritionPlan = await res.json()
                    setName(data.name || '')
                    setTargetKcal(data.target_calories || '')
                    setTargetP(data.target_protein || '')
                    setTargetC(data.target_carbs || '')
                    setTargetF(data.target_fat || '')

                    // Reconstruct planMealsByDay
                    const grouped: Record<number, Record<string, Dish[]>> = {}
                    if (data.meals) {
                        data.meals.forEach(m => {
                            if (!grouped[m.day_of_week]) grouped[m.day_of_week] = {}
                            if (!grouped[m.day_of_week][m.meal_slot]) grouped[m.day_of_week][m.meal_slot] = []
                            grouped[m.day_of_week][m.meal_slot] = m.dishes || []
                        })
                    }
                    setPlanMealsByDay(grouped)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchPlan()
    }, [isNew, params.id])

    // Convert internal state to PlanMeal[] for API and calculations
    const getCurrentDayMeals = (): PlanMeal[] => {
        const slotsForDay = planMealsByDay[selectedDay] || {}
        return Object.entries(slotsForDay).map(([slot, dishes]) => ({
            id: 'temp', plan_id: '', day_of_week: selectedDay, meal_slot: slot as MealSlot,
            dish_ids: dishes.map(d => d.id), dishes
        }))
    }

    const getAllPlanMeals = (): PlanMeal[] => {
        const all: PlanMeal[] = []
        Object.entries(planMealsByDay).forEach(([dayStr, slots]) => {
            Object.entries(slots).forEach(([slot, dishes]) => {
                if (dishes.length > 0) {
                    all.push({
                        id: 'temp', plan_id: '', day_of_week: parseInt(dayStr), meal_slot: slot as MealSlot,
                        dish_ids: dishes.map(d => d.id)
                    })
                }
            })
        })
        return all
    }

    const handleAddDishToSlot = (slot: MealSlot, dish: Dish) => {
        setPlanMealsByDay(prev => {
            const currentDay = prev[selectedDay] || {}
            const currentSlot = currentDay[slot] || []
            return {
                ...prev,
                [selectedDay]: {
                    ...currentDay,
                    [slot]: [...currentSlot, dish]
                }
            }
        })
    }

    const handleRemoveDishFromSlot = (slot: MealSlot, index: number) => {
        setPlanMealsByDay(prev => {
            const currentDay = prev[selectedDay] || {}
            const currentSlot = currentDay[slot] || []
            currentSlot.splice(index, 1)
            return {
                ...prev,
                [selectedDay]: {
                    ...currentDay,
                    [slot]: [...currentSlot]
                }
            }
        })
    }

    const handleSave = async () => {
        if (!name.trim()) return
        setSaving(true)

        const payload: Partial<NutritionPlan> = {
            name,
            target_calories: targetKcal ? Number(targetKcal) : undefined,
            target_protein: targetP ? Number(targetP) : undefined,
            target_carbs: targetC ? Number(targetC) : undefined,
            target_fat: targetF ? Number(targetF) : undefined,
            meals: getAllPlanMeals()
        }

        const method = isNew ? 'POST' : 'PUT'
        const url = isNew ? '/api/plans' : `/api/plans/${params.id}`

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                router.push('/planes')
                router.refresh()
            } else {
                alert('Error al guardar el plan')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    const copyFromPreviousDay = () => {
        if (selectedDay === 1) return
        const prevDayMeals = planMealsByDay[selectedDay - 1]
        if (!prevDayMeals) return

        setPlanMealsByDay(prev => ({
            ...prev,
            [selectedDay]: JSON.parse(JSON.stringify(prevDayMeals)) // Deep copy
        }))
    }

    // Indicators
    const hasContentByDay: Record<number, boolean> = {}
    for (let i = 1; i <= 7; i++) {
        hasContentByDay[i] = Object.values(planMealsByDay[i] || {}).some(arr => arr.length > 0)
    }

    const currentDayMacros = calculateDayMacros(getCurrentDayMeals())

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando editor...</div>

    return (
        <div className="max-w-4xl mx-auto pb-32 space-y-6">
            <header className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                    <Link href="/planes" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                        {isNew ? 'Nuevo Plan' : 'Editar Plan'}
                    </h1>
                </div>
                {!isNew && (
                    <div className="flex items-center gap-2">
                        <a
                            href={`/api/pdf/plan/${params.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-slate-50 text-slate-600 hover:bg-slate-100 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center space-x-2"
                        >
                            <FileText className="w-5 h-5 text-teal-600" />
                            <span className="hidden sm:inline">Exportar PDF</span>
                        </a>

                        <button
                            onClick={() => setIsAssignModalOpen(true)}
                            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <span className="hidden sm:inline">Asignar Paciente</span>
                        </button>
                    </div>
                )}
            </header>

            {/* Config Básica */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre del Plan</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ej. Plan Keto Mensual"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-lg rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none transition-colors"
                    />
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Objetivos Diarios (Opcional)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                            <span className="text-xs text-slate-400">Calorías</span>
                            <input type="number" placeholder="kcal" value={targetKcal} onChange={e => setTargetKcal(Number(e.target.value) || '')} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-sm" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Proteína (g)</span>
                            <input type="number" placeholder="g" value={targetP} onChange={e => setTargetP(Number(e.target.value) || '')} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-sm" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Carbos (g)</span>
                            <input type="number" placeholder="g" value={targetC} onChange={e => setTargetC(Number(e.target.value) || '')} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-sm" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-400">Grasas (g)</span>
                            <input type="number" placeholder="g" value={targetF} onChange={e => setTargetF(Number(e.target.value) || '')} className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navegación por Día */}
            <div className="sticky top-0 z-20 py-2 bg-slate-50">
                <DaySelector
                    selectedDay={selectedDay}
                    onChange={setSelectedDay}
                    hasContentByDay={hasContentByDay}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left col: Comidas */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative">
                        {selectedDay > 1 && !hasContentByDay[selectedDay] && (
                            <button
                                onClick={copyFromPreviousDay}
                                className="absolute top-4 right-4 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                                <span>Copiar del {DAY_LABELS[selectedDay - 2]}</span>
                            </button>
                        )}

                        <h2 className="text-xl font-black text-slate-800 mb-6">Dieta del Día</h2>

                        {MEAL_SLOTS.map(slot => (
                            <MealSlotSection
                                key={slot}
                                slot={slot}
                                dishes={planMealsByDay[selectedDay]?.[slot] || []}
                                onAddDish={() => setSelectingSlot(slot)}
                                onRemoveDish={handleRemoveDishFromSlot}
                            />
                        ))}
                    </div>
                </div>

                {/* Right col: Stats del día */}
                <div className="lg:col-span-1">
                    <DayMacroBar
                        dayMacros={currentDayMacros}
                        targetCalories={targetKcal || undefined}
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-40">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all flex justify-center"
                    >
                        {saving ? 'Guardando...' : 'Guardar Plan'}
                    </button>
                </div>
            </div>

            <DishSelectorDrawer
                isOpen={!!selectingSlot}
                onClose={() => setSelectingSlot(null)}
                // We map slots to equivalent tags roughly, if possible.
                // slot: 'desayuno' | 'colacion_manana' | 'almuerzo' | 'merienda' | 'colacion_tarde' | 'cena' | 'colacion_noche'
                suggestedTag={
                    selectingSlot?.includes('colacion') ? 'colacion' :
                        selectingSlot === 'merienda' ? 'merienda' :
                            selectingSlot === 'desayuno' ? 'desayuno' :
                                selectingSlot === 'almuerzo' ? 'almuerzo' :
                                    selectingSlot === 'cena' ? 'cena' : undefined
                }
                onSelect={(dish) => selectingSlot && handleAddDishToSlot(selectingSlot, dish)}
            />

            <AssignPlanModal
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                planId={params.id}
                planName={name}
                onAssigned={() => {
                    alert('Plan asignado correctamente')
                }}
            />
        </div>
    )
}

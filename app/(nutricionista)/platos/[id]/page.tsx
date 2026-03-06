'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { TAG_LABELS } from '@/types'
import type { Dish, DishIngredient, Food, Portion } from '@/types'
import MacroSummaryCard from '@/components/dishes/MacroSummaryCard'
import IngredientRow from '@/components/dishes/IngredientRow'
import FoodSearchDrawer from '@/components/foods/FoodSearchDrawer'
import { calculateDishMacros } from '@/lib/formulas/macros'

export default function PlatoEditorPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const isNew = params.id === 'nuevo'
    const [loading, setLoading] = useState(!isNew)
    const [saving, setSaving] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [tag, setTag] = useState('')
    const [ingredients, setIngredients] = useState<DishIngredient[]>([])

    // Drawer state
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    useEffect(() => {
        if (isNew) return

        const fetchDish = async () => {
            try {
                const res = await fetch(`/api/dishes/${params.id}`)
                if (res.ok) {
                    const data: Dish = await res.json()
                    setName(data.name || '')
                    setTag(data.tag || '')
                    setIngredients(data.ingredients || [])
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchDish()
    }, [isNew, params.id])

    const handleAddIngredient = (food: Food, portion: Portion | undefined, quantity: number, weight: number) => {
        // Wait calculateIngredientMacros should be better, but we have the util calculateDishMacros.

        // Let's use calculateIngredientMacros directly to be exact for this row
        const factor = weight / 100
        const newIng: DishIngredient = {
            id: crypto.randomUUID(), // temp ID
            dish_id: params.id,
            food_id: food.id,
            portion_id: portion?.id,
            quantity,
            weight_grams: weight,
            calories: Math.round(food.calories_per_100g * factor * 10) / 10,
            protein: Math.round(food.protein_per_100g * factor * 10) / 10,
            carbs: Math.round(food.carbs_per_100g * factor * 10) / 10,
            fat: Math.round(food.fat_per_100g * factor * 10) / 10,
            fiber: Math.round(food.fiber_per_100g * factor * 10) / 10,
            food,
            portion
        }

        setIngredients(prev => [...prev, newIng])
    }

    const handleRemoveIngredient = (index: number) => {
        setIngredients(prev => prev.filter((_, i) => i !== index))
    }

    const handleSave = async () => {
        if (!name.trim() || ingredients.length === 0) return
        setSaving(true)

        const macros = calculateDishMacros(ingredients)

        const dishPayload = {
            name,
            tag: tag || null,
            total_calories: macros.calories,
            total_protein: macros.protein,
            total_carbs: macros.carbs,
            total_fat: macros.fat,
            total_fiber: macros.fiber
        }

        const method = isNew ? 'POST' : 'PUT'
        const url = isNew ? '/api/dishes' : `/api/dishes/${params.id}`

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    dish: dishPayload,
                    // Strip populated food/portion out before sending to API
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    ingredients: ingredients.map(({ food, portion, id, ...rest }) => rest)
                })
            })

            if (res.ok) {
                router.push('/platos')
                router.refresh()
            } else {
                alert('Error al guardar el plato')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setSaving(false)
        }
    }

    // Calculo total en vivo
    const totalMacros = calculateDishMacros(ingredients)

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando editor...</div>

    return (
        <div className="max-w-4xl mx-auto pb-24 space-y-6">
            <header className="flex items-center space-x-4 mb-4">
                <Link href="/platos" className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                    {isNew ? 'Nuevo Plato' : 'Editar Plato'}
                </h1>
            </header>

            {/* Basic Info form */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nombre del plato</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Ej. Pollo con arroz y brócoli"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-lg rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Etiqueta (Opcional)</label>
                    <select
                        value={tag}
                        onChange={e => setTag(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none transition-colors"
                    >
                        <option value="">Ninguna</option>
                        {Object.entries(TAG_LABELS).map(([val, label]) => (
                            <option key={val} value={val}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Live Macros */}
            <MacroSummaryCard summary={totalMacros} title="Macros del Plato" />

            {/* Ingredients List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800">Ingredientes</h2>
                    <span className="text-sm font-bold text-slate-400">{ingredients.length} items</span>
                </div>

                {ingredients.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 flex flex-col items-center">
                        <svg className="w-12 h-12 text-slate-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <p>Aún no agregaste ingredientes.</p>
                    </div>
                ) : (
                    <div className="space-y-1 mb-4">
                        {ingredients.map((ing, i) => (
                            <IngredientRow
                                key={ing.id || i}
                                ingredient={ing}
                                onRemove={() => handleRemoveIngredient(i)}
                            />
                        ))}
                    </div>
                )}

                <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="w-full flex justify-center items-center space-x-2 py-3.5 border-2 border-dashed border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl font-bold transition-all"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Agregar ingrediente</span>
                </button>
            </div>

            {/* Save Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-40 transform translate-z-0">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleSave}
                        disabled={saving || ingredients.length === 0 || !name.trim()}
                        className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-teal-600/20 active:scale-[0.98] transition-all flex justify-center"
                    >
                        {saving ? 'Guardando...' : 'Guardar Plato'}
                    </button>
                </div>
            </div>

            <FoodSearchDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onAddIngredient={handleAddIngredient}
            />
        </div>
    )
}

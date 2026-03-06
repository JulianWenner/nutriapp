'use client'

import React, { useState, useEffect } from 'react'
import Drawer from '@/components/ui/Drawer'
import FoodCard from '@/components/foods/FoodCard'
import Stepper from '@/components/ui/Stepper'
import type { Food, Portion } from '@/types'
import { calculateIngredientMacros } from '@/lib/formulas/macros'

interface FoodSearchDrawerProps {
    isOpen: boolean
    onClose: () => void
    onAddIngredient: (food: Food, portion: Portion | undefined, quantity: number, weight: number) => void
}

export default function FoodSearchDrawer({ isOpen, onClose, onAddIngredient }: FoodSearchDrawerProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Food[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedFood, setSelectedFood] = useState<Food | null>(null)
    const [selectedPortionId, setSelectedPortionId] = useState<string>('')
    const [customGrams, setCustomGrams] = useState<number>(100)
    const [quantity, setQuantity] = useState<number>(1) // Stepper value

    // Debounced Search
    useEffect(() => {
        if (!isOpen) return
        if (query.trim().length < 2) {
            setResults([])
            return
        }

        const timer = setTimeout(async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/foods?q=${encodeURIComponent(query)}`)
                if (res.ok) {
                    const data = await res.json()
                    setResults(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query, isOpen])

    // Reset when drawer closes
    useEffect(() => {
        if (!isOpen) {
            setQuery('')
            setResults([])
            setSelectedFood(null)
            setSelectedPortionId('')
            setCustomGrams(100)
            setQuantity(1)
        }
    }, [isOpen])

    const handleSelectFood = (food: Food) => {
        setSelectedFood(food)
        const hasPortions = food.portions && food.portions.length > 0
        setSelectedPortionId(hasPortions ? food.portions![0].id : 'custom')
        setQuantity(1)
        setCustomGrams(100)
    }

    const handleAdd = () => {
        if (!selectedFood) return

        let portion: Portion | undefined = undefined
        let weight = customGrams

        if (selectedPortionId !== 'custom') {
            portion = selectedFood.portions?.find(p => p.id === selectedPortionId)
            if (portion) {
                weight = portion.weight_grams * quantity
            }
        } else {
            // For custom grams, quantity steppers is conceptually 1, we just use the raw grams
            weight = customGrams
        }

        onAddIngredient(selectedFood, portion, quantity, weight)
        onClose()
    }

    // Calcular preview en tiempo real
    let previewWeight = 0
    let previewKcal = 0
    if (selectedFood) {
        if (selectedPortionId !== 'custom') {
            const p = selectedFood.portions?.find(p => p.id === selectedPortionId)
            previewWeight = (p?.weight_grams || 0) * quantity
        } else {
            previewWeight = customGrams
        }
        const m = calculateIngredientMacros(selectedFood, previewWeight)
        previewKcal = m.calories
    }

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Buscar Alimento" position="bottom">
            {!selectedFood ? (
                <div className="flex flex-col h-full space-y-4">
                    <input
                        type="search"
                        placeholder="Empezá a escribir para buscar..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow text-slate-800"
                        autoFocus
                    />

                    {loading && <p className="text-sm text-slate-500 text-center py-4">Buscando...</p>}

                    {!loading && results.length === 0 && query.trim().length >= 2 && (
                        <p className="text-sm text-slate-500 text-center py-4">No se encontraron resultados.</p>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-2 pb-10">
                        {results.map(food => (
                            <FoodCard
                                key={food.id}
                                food={food}
                                onClick={() => handleSelectFood(food)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="flex flex-col h-full space-y-6">
                    {/* Header: Selected Food */}
                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-800 text-lg leading-tight">{selectedFood.name}</h3>
                            <button
                                onClick={() => setSelectedFood(null)}
                                className="text-xs text-teal-600 font-medium bg-teal-50 px-2 py-1 rounded"
                            >
                                Cambiar
                            </button>
                        </div>
                        <p className="text-sm text-slate-500">
                            Base: {selectedFood.calories_per_100g} kcal por 100g
                        </p>
                    </div>

                    {/* Portions */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">Seleccionar Porción</label>
                        <div className="flex flex-wrap gap-2">
                            {selectedFood.portions?.map(port => (
                                <button
                                    key={port.id}
                                    onClick={() => { setSelectedPortionId(port.id); setQuantity(1); }}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedPortionId === port.id
                                            ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                                            : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-700'
                                        }`}
                                >
                                    {port.name} ({port.weight_grams}g)
                                </button>
                            ))}
                            <button
                                onClick={() => { setSelectedPortionId('custom'); setQuantity(1); }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${selectedPortionId === 'custom'
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-700'
                                    }`}
                            >
                                Gramos manuales
                            </button>
                        </div>
                    </div>

                    {/* Quantity or Grams */}
                    <div className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                        {selectedPortionId === 'custom' ? (
                            <div className="w-full">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Gramos totales (g)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={customGrams}
                                    onChange={(e) => setCustomGrams(Number(e.target.value) || 0)}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                                />
                            </div>
                        ) : (
                            <div className="w-full flex items-center justify-between">
                                <span className="font-medium text-slate-700">Cantidad</span>
                                <Stepper
                                    value={quantity}
                                    onChange={setQuantity}
                                    min={0.5}
                                    max={20}
                                    step={0.5}
                                />
                            </div>
                        )}
                    </div>

                    {/* Preview & Action */}
                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-end mb-4 px-2">
                            <span className="text-slate-500 font-medium">Total calculado:</span>
                            <div className="text-right">
                                <span className="block text-2xl font-black text-teal-800 leading-none">{previewKcal} kcal</span>
                                <span className="text-sm text-slate-500 font-medium">{previewWeight}g</span>
                            </div>
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={previewWeight <= 0}
                            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md shadow-teal-600/20 transition-all active:scale-[0.98]"
                        >
                            Agregar al plato
                        </button>
                    </div>
                </div>
            )}
        </Drawer>
    )
}

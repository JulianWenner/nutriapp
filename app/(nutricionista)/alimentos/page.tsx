'use client'

import React, { useState, useEffect } from 'react'
import FoodCard from '@/components/foods/FoodCard'
import type { Food } from '@/types'

export default function AlimentosPage() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<Food[]>([])
    const [loading, setLoading] = useState(false)

    // Initial load + search
    useEffect(() => {
        const fetchFoods = async () => {
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
        }

        const timer = setTimeout(() => {
            fetchFoods()
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Base de Alimentos</h1>
                <p className="text-slate-500 mt-1">Busque alimentos para conocer su composición nutricional cada 100g.</p>
            </header>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <input
                    type="search"
                    placeholder="Buscar por nombre..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
            </div>

            {loading ? (
                <div className="text-center py-10 text-slate-500">Buscando...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.length === 0 ? (
                        <div className="col-span-full text-center py-10 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-200">
                            No se encontraron alimentos.
                        </div>
                    ) : (
                        results.map(food => (
                            <FoodCard key={food.id} food={food} />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

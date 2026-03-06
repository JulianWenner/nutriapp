'use client'

import React, { useState, useEffect } from 'react'
import Drawer from '@/components/ui/Drawer'
import DishCard from '@/components/dishes/DishCard'
import type { Dish } from '@/types'

interface DishSelectorDrawerProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (dish: Dish) => void
    suggestedTag?: string
}

export default function DishSelectorDrawer({ isOpen, onClose, onSelect, suggestedTag }: DishSelectorDrawerProps) {
    const [query, setQuery] = useState('')
    const [dishes, setDishes] = useState<Dish[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isOpen) return

        const fetchDishes = async () => {
            setLoading(true)
            try {
                // Fetch all for the selector. Filtering is local for better UX.
                const res = await fetch('/api/dishes')
                if (res.ok) {
                    const data = await res.json()
                    setDishes(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }

        fetchDishes()
    }, [isOpen])

    // Reset when drawer closes
    useEffect(() => {
        if (!isOpen) {
            setQuery('')
            // Don't clear dishes so it caches smoothly when reopening
        }
    }, [isOpen])

    // Local filtering
    const filteredDishes = dishes.filter(d =>
        d.name.toLowerCase().includes(query.toLowerCase())
    )

    // Sort: If suggestedTag exists, push those to the top
    const sortedDishes = [...filteredDishes].sort((a, b) => {
        if (suggestedTag) {
            const aMatch = a.tag === suggestedTag
            const bMatch = b.tag === suggestedTag
            if (aMatch && !bMatch) return -1
            if (!aMatch && bMatch) return 1
        }
        return 0
    })

    const handleSelect = (dish: Dish) => {
        onSelect(dish)
        onClose()
    }

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Seleccionar Plato" position="bottom">
            <div className="flex flex-col h-full space-y-4">
                <input
                    type="search"
                    placeholder="Buscar plato por nombre..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-shadow text-slate-800"
                    autoFocus
                />

                {loading && dishes.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">Cargando biblioteca...</p>
                )}

                <div className="flex-1 overflow-y-auto pb-10 space-y-3">
                    {sortedDishes.length === 0 && !loading && (
                        <p className="text-sm text-slate-500 text-center py-4">No se encontraron platos.</p>
                    )}

                    {sortedDishes.map(dish => (
                        <DishCard
                            key={dish.id}
                            dish={dish}
                            onClick={() => handleSelect(dish)}
                            actionButton={
                                <div className="p-1.5 bg-teal-100 text-teal-700 rounded-full">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            }
                        />
                    ))}
                </div>
            </div>
        </Drawer>
    )
}

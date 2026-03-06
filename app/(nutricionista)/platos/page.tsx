'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import DishCard from '@/components/dishes/DishCard'
import type { Dish } from '@/types'
import { Skeleton } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import { Utensils, Plus } from 'lucide-react'

export default function PlatosPage() {
    const [dishes, setDishes] = useState<Dish[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDishes = async () => {
            try {
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
    }, [])

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Biblioteca de Platos</h1>
                    <p className="text-slate-500 mt-1">Administre los platos que usará para armar planes nutricionales.</p>
                </div>
                <Link
                    href="/platos/nuevo"
                    className="inline-flex items-center justify-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-teal-600/20 active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nuevo Plato</span>
                </Link>
            </header>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                    <Skeleton className="h-64 rounded-3xl" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dishes.length === 0 ? (
                        <div className="col-span-full">
                            <EmptyState
                                icon={Utensils}
                                title="Sin platos aún"
                                description="Arme su biblioteca de comidas para cargarlas rápidamente en sus planes."
                                action={
                                    <Link href="/platos/nuevo" className="bg-teal-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2">
                                        <Plus size={20} />
                                        Crear primer plato
                                    </Link>
                                }
                            />
                        </div>
                    ) : (
                        dishes.map(dish => (
                            <Link href={`/platos/${dish.id}`} key={dish.id} className="block group">
                                <DishCard dish={dish} />
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

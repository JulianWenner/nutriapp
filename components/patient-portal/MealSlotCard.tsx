import React from 'react'
import { MealSlot, MEAL_SLOT_LABELS } from '@/types'
import MealCheckbox from './MealCheckbox'
import { Clock } from 'lucide-react'

interface Props {
    slot: MealSlot
    dishes: { id: string; name: string }[]
    adherence: Record<string, { completed: boolean; comment: string }>
    onAdherenceToggle: (planMealId: string, completed: boolean) => void
    onCommentChange: (planMealId: string, comment: string) => void
    status: 'Cumplido' | 'Pendiente' | 'Más tarde'
}

export default function MealSlotCard({
    slot,
    dishes,
    adherence,
    onAdherenceToggle,
    onCommentChange,
    status,
}: Props) {
    if (dishes.length === 0) return null

    const statusColors = {
        'Cumplido': 'bg-emerald-50 text-emerald-700 border-emerald-100',
        'Pendiente': 'bg-rose-50 text-rose-700 border-rose-100',
        'Más tarde': 'bg-slate-50 text-slate-500 border-slate-100'
    }

    return (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-slate-900 font-black text-xl leading-none">
                    {MEAL_SLOT_LABELS[slot]}
                </h4>
                <div className={`px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${statusColors[status]}`}>
                    {status === 'Más tarde' && <Clock className="w-3 h-3" />}
                    {status}
                </div>
            </div>

            <div className="space-y-3">
                {dishes.map((dish) => {
                    // Nota: El planMealId es necesario para el guardado. 
                    // En esta implementación simplificada, asumimos un dish por planMeal o pasamos el planMealId correcto.
                    // data structure provided by props will need to be correctly mapped.
                    return (
                        <MealCheckbox
                            key={dish.id}
                            dishId={dish.id}
                            name={dish.name}
                            completed={adherence[dish.id]?.completed || false}
                            comment={adherence[dish.id]?.comment || ''}
                            onToggle={(completed) => onAdherenceToggle(dish.id, completed)}
                            onCommentChange={(comment) => onCommentChange(dish.id, comment)}
                        />
                    )
                })}
            </div>
        </div>
    )
}

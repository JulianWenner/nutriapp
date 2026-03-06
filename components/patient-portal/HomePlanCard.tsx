import React from 'react'
import Link from 'next/link'
import { NutritionPlan, MEAL_SLOT_LABELS } from '@/types'
import { Utensils, CheckCircle2, ChevronRight } from 'lucide-react'
import { getCurrentDayOfWeek } from '@/lib/utils/dates'

interface Props {
    plan: NutritionPlan | null
}

export default function HomePlanCard({ plan }: Props) {
    const today = getCurrentDayOfWeek()
    const todayMeals = plan?.meals?.filter(m => m.day_of_week === today) || []

    if (!plan || (todayMeals.length === 0)) {
        return (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm transition-all">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                    <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg leading-tight">Tu Plan Alimentario</h3>
                <p className="text-slate-500 text-sm mt-1">Todavía no tenés un plan asignado para hoy.</p>
                <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                    Consultá con tu nutricionista para recibir tu primer plan personalizado.
                </p>
            </div>
        )
    }

    // Tomamos hasta 3 comidas para el resumen
    const mealSummary = todayMeals.slice(0, 3)
    const remainingCount = todayMeals.length - mealSummary.length

    return (
        <Link href="/mi-plan" className="block bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Utensils className="w-5 h-5 text-orange-600" />
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Plan de Hoy</p>
                    <h3 className="text-slate-900 font-black text-2xl mt-1 leading-tight">
                        {plan.name}
                    </h3>
                </div>

                <div className="space-y-2 py-3 border-t border-slate-50">
                    {mealSummary.map((meal) => (
                        <div key={meal.id} className="flex items-center gap-2 group">
                            <CheckCircle2 className="w-4 h-4 text-slate-200 group-hover:text-teal-500 transition-colors" />
                            <span className="text-slate-700 font-bold text-sm">
                                {MEAL_SLOT_LABELS[meal.meal_slot]}
                            </span>
                            <span className="text-slate-400 text-xs truncate max-w-[150px]">
                                {meal.dishes?.map(d => d.name).join(', ')}
                            </span>
                        </div>
                    ))}
                    {remainingCount > 0 && (
                        <p className="text-xs text-slate-400 font-medium pt-1">
                            + {remainingCount} franjas horarias más
                        </p>
                    )}
                </div>

                {plan.target_calories && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-full border border-orange-100">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        <span className="text-orange-700 text-xs font-bold">{plan.target_calories} kcal/día</span>
                    </div>
                )}
            </div>
        </Link>
    )
}

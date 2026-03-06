import React from 'react'
import Link from 'next/link'
import { AnthropometryEval } from '@/types'
import { Activity, TrendingUp, TrendingDown, ChevronRight } from 'lucide-react'
import { formatDateSpanish } from '@/lib/utils/dates'

interface Props {
    evaluation: AnthropometryEval | null
}

export default function HomeEvalCard({ evaluation }: Props) {
    if (!evaluation) return null

    const weight = evaluation.measures.weight_kg
    const bmi = evaluation.results?.bmi.value
    const bodyFat = evaluation.results?.body_fat_pct.value

    return (
        <Link href="/resultados" className="block bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <Activity className="w-5 h-5 text-indigo-600" />
                    </div>
                    <span className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border border-slate-100">
                        {formatDateSpanish(evaluation.eval_date)}
                    </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Última Evaluación</p>
                    <div className="flex items-end gap-2 mt-1">
                        <h3 className="text-slate-900 font-black text-3xl leading-none">
                            {weight.toFixed(1)}
                        </h3>
                        <span className="text-slate-500 font-black text-lg pb-0.5">kg</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-50">
                    <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Grasa Corporal</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-slate-900 font-black text-xl">{bodyFat?.toFixed(1) || '--'}</span>
                            <span className="text-slate-500 text-xs font-bold">%</span>
                        </div>
                    </div>

                    <div className="bg-slate-50/50 rounded-2xl p-3 border border-slate-100/50">
                        <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">IMC</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-slate-900 font-black text-xl">{bmi?.toFixed(1) || '--'}</span>
                            <span className="text-slate-500 text-xs font-bold font-mono">kg/m²</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100 w-fit">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-indigo-700 text-[11px] font-black uppercase tracking-wide">Analizar Evolución completa</span>
                </div>
            </div>
        </Link>
    )
}

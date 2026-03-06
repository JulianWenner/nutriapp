import React from 'react'
import { MessageSquare, Calendar, ChevronRight } from 'lucide-react'

interface Comment {
    id: string
    comment: string
    updated_at: string
    plan_meals: {
        meal_slot: string
        day_of_week: number
        dishes: { name: string }[]
    }
}

interface Props {
    comments: Comment[]
}

export default function RecentCommentsList({ comments }: Props) {
    if (comments.length === 0) {
        return (
            <div className="bg-white rounded-3xl p-8 border-2 border-dashed border-slate-100 text-center">
                <MessageSquare className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                <p className="text-slate-400 font-bold text-sm">Sin comentarios recientes de este paciente</p>
            </div>
        )
    }

    const DAY_LABELS = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

    return (
        <div className="bg-white rounded-3xl p-6 border-2 border-slate-100 shadow-sm">
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                REPORTE DE PACIENTE
            </h3>

            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100/50 hover:border-teal-300 transition-colors">
                        <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{DAY_LABELS[comment.plan_meals.day_of_week]}</span>
                            </div>
                            <span>{new Date(comment.updated_at).toLocaleDateString()}</span>
                        </div>

                        <p className="text-slate-900 font-bold text-sm flex items-center gap-2 mb-2">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                            {comment.plan_meals.meal_slot.toUpperCase()}
                            <span className="text-slate-400 font-medium normal-case shrink-0 truncate max-w-[150px]">
                                ({comment.plan_meals.dishes?.map(d => d.name).join(', ')})
                            </span>
                        </p>

                        <div className="bg-white/80 p-3 rounded-xl border border-slate-100 shadow-sm italic text-slate-700 text-sm">
                            &quot;{comment.comment}&quot;
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

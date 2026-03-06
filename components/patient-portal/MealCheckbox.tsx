'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, MessageSquare, Info, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
    dishId: string
    name: string
    completed: boolean
    comment: string
    onToggle: (completed: boolean) => void
    onCommentChange: (comment: string) => void
}

export default function MealCheckbox({
    dishId,
    name,
    completed,
    comment,
    onToggle,
    onCommentChange,
}: Props) {
    const [internalComment, setInternalComment] = useState(comment)
    const [isCommentVisible, setIsCommentVisible] = useState(!!comment)

    useEffect(() => {
        setInternalComment(comment)
    }, [comment])

    // Debounce para el comentario
    useEffect(() => {
        const timer = setTimeout(() => {
            if (internalComment !== comment) {
                onCommentChange(internalComment)
            }
        }, 800)
        return () => clearTimeout(timer)
    }, [internalComment])

    const hasComment = internalComment.trim().length > 0

    return (
        <div className={`p-4 rounded-2xl border transition-all ${completed
                ? 'bg-emerald-50/50 border-emerald-100 shadow-sm shadow-emerald-500/5'
                : 'bg-white border-slate-100'
            } ${hasComment ? 'bg-amber-50/30 border-amber-100' : ''}`}>

            <div className="flex items-center justify-between">
                <label className="flex items-center gap-4 cursor-pointer flex-1">
                    <input
                        type="checkbox"
                        checked={completed}
                        onChange={(e) => onToggle(e.target.checked)}
                        className="hidden"
                    />
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${completed
                            ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/20'
                            : 'border-slate-200 bg-white'
                        }`}>
                        {completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className={`text-sm font-bold transition-all ${completed ? 'text-emerald-900 line-through opacity-70' : 'text-slate-900'
                        }`}>
                        {name}
                    </span>
                </label>

                <button
                    onClick={() => setIsCommentVisible(!isCommentVisible)}
                    className={`p-2 rounded-xl transition-all ${hasComment ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:bg-slate-50'
                        }`}
                    title="Agregar comentario"
                >
                    {isCommentVisible ? <ChevronUp className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                </button>
            </div>

            {isCommentVisible && (
                <div className="mt-4 pt-4 border-t border-slate-100/50">
                    <textarea
                        value={internalComment}
                        onChange={(e) => setInternalComment(e.target.value)}
                        placeholder="¿Cómo te sentiste? ¿Hubo cambios?..."
                        className="w-full text-xs bg-slate-50/50 border-none rounded-xl p-3 focus:ring-2 focus:ring-amber-500/20 transition-all min-h-[60px] resize-none text-slate-700"
                    />
                    {hasComment && (
                        <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Guardado automático
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}

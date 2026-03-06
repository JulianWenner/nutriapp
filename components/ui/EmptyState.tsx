import React from 'react'
import { LucideIcon } from 'lucide-react'

interface Props {
    icon: LucideIcon
    title: string
    description: string
    action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
    return (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto mb-6 leading-relaxed">
                {description}
            </p>
            {action && (
                <div className="animate-in fade-in slide-in-from-bottom-2 delay-300">
                    {action}
                </div>
            )}
        </div>
    )
}

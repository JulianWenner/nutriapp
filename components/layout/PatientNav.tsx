'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    ClipboardList,
    Calendar,
    LineChart,
    Bot,
} from 'lucide-react'

const PATIENT_NAV = [
    { href: '/inicio', icon: Home, label: 'Inicio' },
    { href: '/mi-plan', icon: ClipboardList, label: 'Mi Plan' },
    { href: '/mis-turnos', icon: Calendar, label: 'Turnos' },
    { href: '/mi-evolucion', icon: LineChart, label: 'Evolución' },
    { href: '/asistente', icon: Bot, label: 'Chat' },
]

export default function PatientNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-md bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2rem] h-20 flex items-center justify-around px-4 shadow-2xl shadow-slate-900/10 z-50">
            {PATIENT_NAV.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/inicio' && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center gap-1.5 transition-all w-16 group ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-600'
                            }`}
                    >
                        <div className={`p-2.5 rounded-2xl transition-all duration-300 relative ${isActive
                                ? 'bg-teal-50 scale-110 shadow-sm shadow-teal-500/10'
                                : 'group-hover:bg-slate-50 group-active:scale-95'
                            }`}>
                            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />

                            {isActive && (
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-teal-600 rounded-full" />
                            )}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${isActive ? 'opacity-100' : 'opacity-0 scale-75'
                            }`}>
                            {item.label}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}

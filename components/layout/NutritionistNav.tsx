'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Home,
    Calendar,
    Users,
    ClipboardList,
    ChefHat,
    LogOut,
    Menu,
    X
} from 'lucide-react'

const NAV_ITEMS = [
    { href: '/dashboard', icon: Home, label: 'Inicio' },
    { href: '/agenda', icon: Calendar, label: 'Agenda' },
    { href: '/antropometria', icon: Users, label: 'Pacientes' },
    { href: '/planes', icon: ClipboardList, label: 'Planes' },
    { href: '/platos', icon: ChefHat, label: 'Platos' },
]

export default function NutritionistNav({ onSignOut }: { onSignOut: () => void }) {
    const pathname = usePathname()

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 z-40">
                <div className="p-8">
                    <h2 className="text-2xl font-black text-teal-600 tracking-tighter">NutriApp</h2>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname.startsWith(item.href)
                        const Icon = item.icon
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${isActive
                                        ? 'bg-teal-50 text-teal-700 shadow-sm shadow-teal-700/5'
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 mt-auto">
                    <button
                        onClick={onSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-rose-500 hover:bg-rose-50 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Bar */}
            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl h-16 flex items-center justify-around px-2 shadow-2xl shadow-slate-900/10 z-50">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 group relative ${isActive ? 'text-teal-600' : 'text-slate-400'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-teal-50 shadow-sm shadow-teal-500/10 scale-110' : 'group-active:scale-95'}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </Link>
                    )
                })}
                <button
                    onClick={onSignOut}
                    className="p-2 rounded-xl text-rose-500 bg-rose-50/50"
                    title="Salir"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </nav>
        </>
    )
}

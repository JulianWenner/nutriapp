'use client'

import React from 'react'
import Link from 'next/link'
import { Bird, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-1000">

            {/* Visual Element */}
            <div className="relative mb-12">
                <div className="absolute inset-0 bg-teal-100 rounded-full blur-3xl opacity-50 scale-150 animate-pulse" />
                <div className="relative w-32 h-32 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center border border-slate-100/50">
                    <Bird size={64} className="text-teal-600 animate-bounce transition-all duration-3000" />
                </div>
                <div className="absolute -bottom-4 -right-2 bg-slate-900 text-white font-black px-4 py-2 rounded-2xl text-2xl shadow-xl">
                    404
                </div>
            </div>

            <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">¡Página no encontrada!</h1>
            <p className="text-slate-500 max-w-sm mb-12 leading-relaxed font-bold">
                Te perdiste en el bosque nutricional. La página que buscás no existe o fue movida.
            </p>

            <div className="flex flex-col gap-4 w-full max-w-sm">
                <Link
                    href="/"
                    className="bg-teal-600 text-white font-black py-5 px-8 rounded-3xl shadow-xl shadow-teal-600/30 active:scale-95 transition-all text-xl flex items-center justify-center gap-3 group"
                >
                    <Home size={24} className="group-hover:-translate-y-1 transition-transform" />
                    Volver al Inicio
                </Link>
                <button
                    onClick={() => window.history.back()}
                    className="bg-white border-2 border-slate-200 text-slate-600 font-black py-4 px-8 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-2 transition-transform" />
                    Regresar
                </button>
            </div>
        </div>
    )
}

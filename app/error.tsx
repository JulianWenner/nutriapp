'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RotateCcw, Home } from 'lucide-react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Unhandled local error:', error)
    }, [error])

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mb-8 text-rose-500 animate-bounce transition-all duration-1000">
                <AlertCircle size={40} />
            </div>

            <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Ocurrió un error inesperado</h1>
            <p className="text-slate-500 max-w-md mx-auto mb-10 leading-relaxed font-medium">
                Lo sentimos, algo no salió como esperábamos. Hemos registrado el error y nuestro equipo lo revisará.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                <button
                    onClick={reset}
                    className="flex-1 bg-slate-900 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <RotateCcw size={20} />
                    Reintentar
                </button>

                <Link
                    href="/"
                    className="flex-1 bg-white border-2 border-slate-100 text-slate-600 font-bold py-4 px-6 rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <Home size={20} />
                    Inicio
                </Link>
            </div>

            {error.digest && (
                <span className="mt-12 text-[10px] text-slate-300 font-mono uppercase tracking-widest">
                    Error ID: {error.digest}
                </span>
            )}
        </div>
    )
}

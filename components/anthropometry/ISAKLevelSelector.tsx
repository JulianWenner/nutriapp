'use client'

import React from 'react'

interface ISAKLevelSelectorProps {
    selected: 1 | 2 | null
    onSelect: (level: 1 | 2) => void
}

export default function ISAKLevelSelector({ selected, onSelect }: ISAKLevelSelectorProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
                type="button"
                onClick={() => onSelect(1)}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all overflow-hidden ${selected === 1
                        ? 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-500 ring-offset-2'
                        : 'border-slate-200 bg-white hover:border-teal-300'
                    }`}
            >
                {selected === 1 && (
                    <div className="absolute top-3 right-3 text-teal-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                <div className="flex items-center space-x-3 mb-2">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${selected === 1 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>N1</span>
                    <h3 className="font-bold text-slate-800">ISAK Nivel 1</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4 h-10">Perfil Restringido. Ideal para población general y chequeos rápidos (~10 min).</p>
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md">Básicos</span>
                    <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md">4 Pliegues</span>
                    <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md">4 Circunf.</span>
                </div>
            </button>

            <button
                type="button"
                onClick={() => onSelect(2)}
                className={`relative p-5 rounded-2xl border-2 text-left transition-all overflow-hidden ${selected === 2
                        ? 'border-teal-500 bg-teal-50 shadow-md ring-2 ring-teal-500 ring-offset-2'
                        : 'border-slate-200 bg-white hover:border-teal-300'
                    }`}
            >
                {selected === 2 && (
                    <div className="absolute top-3 right-3 text-teal-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}
                <div className="flex items-center space-x-3 mb-2">
                    <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${selected === 2 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>N2</span>
                    <h3 className="font-bold text-slate-800">ISAK Nivel 2</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4 h-10">Perfil Completo. Para deportistas y somatotipo exacto (~20 min).</p>
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md text-teal-600">8 Pliegues</span>
                    <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md text-teal-600">8 Circunf.</span>
                    <span className="text-xs font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-md text-teal-600">Diámetros</span>
                </div>
            </button>
        </div>
    )
}

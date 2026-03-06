'use client'

import React from 'react'
import Modal from './Modal'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    isDestructive?: boolean
    isLoading?: boolean
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    isDestructive = true,
    isLoading = false
}: Props) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="flex flex-col items-center text-center p-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isDestructive ? 'bg-rose-50 text-rose-500' : 'bg-teal-50 text-teal-600'}`}>
                    <AlertTriangle size={28} />
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-8">
                    {description}
                </p>

                <div className="flex gap-3 w-full">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-6 py-4 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`flex-1 px-6 py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 ${isDestructive
                                ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20'
                                : 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20'
                            }`}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

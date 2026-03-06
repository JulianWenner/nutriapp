'use client'

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import clsx from 'clsx'

interface DrawerProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    position?: 'right' | 'bottom'
}

export default function Drawer({ isOpen, onClose, title, children, position = 'right' }: DrawerProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!mounted) return null

    const positionClasses = {
        right: {
            container: "fixed inset-y-0 right-0 max-w-sm w-full h-full flex transform transition duration-300 ease-in-out",
            open: "translate-x-0",
            closed: "translate-x-full"
        },
        bottom: {
            container: "fixed bottom-0 inset-x-0 w-full rounded-t-2xl transform transition duration-300 ease-in-out max-h-[85vh] flex flex-col",
            open: "translate-y-0",
            closed: "translate-y-full"
        }
    }

    const { container, open, closed } = positionClasses[position]

    return createPortal(
        <div className={clsx("fixed inset-0 z-50 overflow-hidden", !isOpen && "pointer-events-none")}>
            {/* Overlay */}
            <div
                className={clsx(
                    "absolute inset-0 bg-black/40 transition-opacity duration-300 backdrop-blur-sm",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
                )}
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className={clsx(
                container,
                isOpen ? open : closed,
                "bg-white shadow-xl flex flex-col pointer-events-auto"
            )}>
                <div className="flex items-center justify-between px-4 py-4 border-b">
                    <h2 className="text-lg font-bold text-slate-800">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    )
}

'use client'

import { useState } from 'react'
import type { AppointmentRequest } from '@/types'
import { REQUEST_TYPE_LABELS } from '@/types'

interface PendingRequestCardProps {
    request: AppointmentRequest
    onConfirm: (id: string) => Promise<void>
    onReject: (id: string) => Promise<void>
}

export default function PendingRequestCard({
    request,
    onConfirm,
    onReject,
}: PendingRequestCardProps) {
    const [loading, setLoading] = useState<'confirm' | 'reject' | null>(null)

    async function handleConfirm() {
        setLoading('confirm')
        await onConfirm(request.id)
        setLoading(null)
    }

    async function handleReject() {
        setLoading('reject')
        await onReject(request.id)
        setLoading(null)
    }

    const dateFormatted = request.requested_date
        ? new Date(request.requested_date + 'T00:00:00').toLocaleDateString('es-AR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            timeZone: 'America/Argentina/Buenos_Aires',
        })
        : null

    return (
        <div className="bg-white rounded-xl border border-border px-4 py-3 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-semibold text-dark">
                        {request.patient?.full_name ?? 'Paciente'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {REQUEST_TYPE_LABELS[request.type]}
                    </p>
                    {dateFormatted && (
                        <p className="text-xs text-gray-500 mt-1">
                            📅 {dateFormatted}
                            {request.requested_time && ` · ${request.requested_time.slice(0, 5)}`}
                        </p>
                    )}
                    {request.message && (
                        <p className="text-xs text-gray-500 mt-1 italic">"{request.message}"</p>
                    )}
                </div>
                <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: '#FFF4E5', color: '#E8A04A' }}>
                    Pendiente
                </span>
            </div>

            {/* Botones */}
            <div className="flex gap-2">
                <button
                    onClick={handleConfirm}
                    disabled={loading !== null}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold text-white transition disabled:opacity-50"
                    style={{ backgroundColor: '#0D7C72' }}
                >
                    {loading === 'confirm' ? 'Confirmando...' : 'Confirmar ✓'}
                </button>
                <button
                    onClick={handleReject}
                    disabled={loading !== null}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition disabled:opacity-50"
                    style={{ backgroundColor: '#FFF0F0', color: '#E05555' }}
                >
                    {loading === 'reject' ? 'Rechazando...' : 'Rechazar ✕'}
                </button>
            </div>
        </div>
    )
}

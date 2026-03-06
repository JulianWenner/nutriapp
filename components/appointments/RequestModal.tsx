'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import DatePicker from '@/components/ui/DatePicker'
import type { RequestType } from '@/types'

const TIMES = Array.from({ length: 25 }, (_, i) => {
    const h = Math.floor(i / 2) + 8
    const m = i % 2 === 0 ? '00' : '30'
    return `${String(h).padStart(2, '0')}:${m}`
})

interface RequestModalProps {
    isOpen: boolean
    onClose: () => void
    type: RequestType
    appointmentId?: string  // para cambio / cancelación
    patientId: string
    onSubmitted: () => void
}

export default function RequestModal({
    isOpen,
    onClose,
    type,
    appointmentId,
    patientId,
    onSubmitted,
}: RequestModalProps) {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('09:00')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isCancelacion = type === 'cancelacion'

    const titles: Record<RequestType, string> = {
        nuevo: 'Solicitar nuevo turno',
        cambio: 'Pedir cambio de turno',
        cancelacion: 'Cancelar turno',
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!isCancelacion && !date) return setError('Seleccioná una fecha.')
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/appointment-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: patientId,
                    appointment_id: appointmentId ?? null,
                    type,
                    status: 'pendiente',
                    requested_date: isCancelacion ? null : date,
                    requested_time: isCancelacion ? null : time,
                    message: message || null,
                }),
            })
            if (!res.ok) throw new Error()
            onSubmitted()
            onClose()
            resetForm()
        } catch {
            setError('No se pudo enviar la solicitud. Intentá de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    function resetForm() {
        setDate('')
        setTime('09:00')
        setMessage('')
        setError(null)
    }

    const inputClass =
        'w-full px-4 py-3 rounded-xl border border-border text-dark text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20'

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={titles[type]}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {isCancelacion ? (
                    <p className="text-sm text-gray-500">
                        ¿Estás segura de que querés cancelar este turno? La solicitud quedará pendiente de confirmación por parte de la nutricionista.
                    </p>
                ) : (
                    <>
                        <DatePicker label="Fecha deseada *" value={date} onChange={setDate} required />
                        <div>
                            <label className="block text-sm font-medium text-dark mb-1.5">Hora deseada *</label>
                            <select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass}>
                                {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </>
                )}

                {/* Mensaje opcional */}
                <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Mensaje (opcional)</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={2}
                        placeholder="Contale algo a la nutricionista..."
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {error && (
                    <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
                )}

                <div className="flex gap-3 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-border text-dark hover:bg-gray-50 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50"
                        style={{ backgroundColor: isCancelacion ? '#E05555' : '#0D7C72' }}
                    >
                        {loading ? 'Enviando...' : isCancelacion ? 'Confirmar cancelación' : 'Enviar solicitud'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

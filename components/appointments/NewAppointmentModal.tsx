'use client'

import { useState } from 'react'
import Modal from '@/components/ui/Modal'
import DatePicker from '@/components/ui/DatePicker'
import type { AppointmentType } from '@/types'
import { APPOINTMENT_TYPE_LABELS } from '@/types'

const TIMES = Array.from({ length: 25 }, (_, i) => {
    const h = Math.floor(i / 2) + 8
    const m = i % 2 === 0 ? '00' : '30'
    return `${String(h).padStart(2, '0')}:${m}`
}) // 08:00 … 20:00

interface Patient {
    id: string
    full_name: string
}

interface NewAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    patients: Patient[]
    onCreated: () => void
}

export default function NewAppointmentModal({
    isOpen,
    onClose,
    patients,
    onCreated,
}: NewAppointmentModalProps) {
    const [patientId, setPatientId] = useState('')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('09:00')
    const [type, setType] = useState<AppointmentType>('control')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!patientId || !date) return setError('Completá todos los campos obligatorios.')
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patient_id: patientId, date, time, type, notes: notes || null, status: 'confirmado' }),
            })
            if (!res.ok) throw new Error('Error al crear el turno')
            onCreated()
            onClose()
            resetForm()
        } catch {
            setError('No se pudo crear el turno. Intentá de nuevo.')
        } finally {
            setLoading(false)
        }
    }

    function resetForm() {
        setPatientId('')
        setDate('')
        setTime('09:00')
        setType('control')
        setNotes('')
        setError(null)
    }

    const inputClass =
        'w-full px-4 py-3 rounded-xl border border-border text-dark text-sm outline-none transition focus:border-teal focus:ring-2 focus:ring-teal/20'

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Nuevo turno">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Paciente */}
                <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Paciente *</label>
                    <select
                        value={patientId}
                        onChange={(e) => setPatientId(e.target.value)}
                        required
                        className={inputClass}
                    >
                        <option value="">— Seleccioná un paciente —</option>
                        {patients.map((p) => (
                            <option key={p.id} value={p.id}>{p.full_name}</option>
                        ))}
                    </select>
                </div>

                {/* Fecha */}
                <DatePicker label="Fecha *" value={date} onChange={setDate} required />

                {/* Hora */}
                <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Hora *</label>
                    <select value={time} onChange={(e) => setTime(e.target.value)} className={inputClass}>
                        {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>

                {/* Tipo */}
                <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Tipo de consulta *</label>
                    <select value={type} onChange={(e) => setType(e.target.value as AppointmentType)} className={inputClass}>
                        {(Object.entries(APPOINTMENT_TYPE_LABELS) as [AppointmentType, string][]).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>

                {/* Notas */}
                <div>
                    <label className="block text-sm font-medium text-dark mb-1.5">Notas (opcional)</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={2}
                        placeholder="Observaciones del turno..."
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
                        style={{ backgroundColor: '#0D7C72' }}
                    >
                        {loading ? 'Guardando...' : 'Crear turno'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

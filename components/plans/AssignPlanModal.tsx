'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'

interface PatientOption {
    id: string
    full_name: string
}

interface AssignPlanModalProps {
    isOpen: boolean
    onClose: () => void
    planId: string
    planName: string
    onAssigned: () => void
}

export default function AssignPlanModal({ isOpen, onClose, planId, planName, onAssigned }: AssignPlanModalProps) {
    const [patients, setPatients] = useState<PatientOption[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedPatientId, setSelectedPatientId] = useState('')
    const [assigning, setAssigning] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) return

        // Cargar lista de pacientes
        const fetchPatients = async () => {
            setLoading(true)
            try {
                // To fetch patients we can create an endpoint or reuse some appointment helper endpoint.
                // We'll simulate fetching from a route we haven't built yet, but we will have to build it 
                // or just import the existing helper if we move logic to Server Action / Route Handler.
                // For simplicity, let's create a dedicated endpoint /api/patients -> GET list.
                const res = await fetch('/api/patients')
                if (res.ok) {
                    const data = await res.json()
                    setPatients(data)
                } else {
                    setError('Error al cargar pacientes')
                }
            } catch {
                setError('Error de red')
            } finally {
                setLoading(false)
            }
        }

        fetchPatients()
    }, [isOpen])

    const handleAssign = async () => {
        if (!selectedPatientId) return
        setAssigning(true)
        setError('')

        try {
            const res = await fetch(`/api/plans/${planId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patientId: selectedPatientId })
            })

            if (res.ok) {
                onAssigned()
                onClose()
            } else {
                const data = await res.json()
                setError(data.error || 'Error al asignar el plan')
            }
        } catch {
            setError('Error de red')
        } finally {
            setAssigning(false)
        }
    }

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setSelectedPatientId('')
            setError('')
        }
    }, [isOpen])

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Asignar Plan">
            <div className="space-y-4 pt-2">
                <p className="text-sm text-slate-600">
                    Seleccioná a qué paciente querés asignarle el plan <strong>&quot;{planName}&quot;</strong>.
                    <br /><br />
                    Esto reemplazará cualquier plan que el paciente tenga actualmente activo.
                </p>

                {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}

                {loading ? (
                    <p className="text-sm text-slate-500 py-4 text-center">Cargando pacientes...</p>
                ) : (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Paciente</label>
                        <select
                            value={selectedPatientId}
                            onChange={e => setSelectedPatientId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-teal-500 focus:border-teal-500 block p-3 outline-none transition-colors"
                        >
                            <option value="" disabled>Seleccionar paciente...</option>
                            {patients.map(p => (
                                <option key={p.id} value={p.id}>{p.full_name}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-6 mt-6 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={assigning}
                        className="py-3 px-4 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleAssign}
                        disabled={assigning || !selectedPatientId}
                        className="py-3 px-4 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors disabled:pointer-events-none disabled:opacity-50 flex items-center justify-center space-x-2 shadow-md shadow-teal-500/20"
                    >
                        {assigning ? (
                            <span className="animate-pulse">Asignando...</span>
                        ) : (
                            <span>Asignar Plan</span>
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}

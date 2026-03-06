'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { requestNotificationPermission, showLocalNotification } from '@/lib/notifications/webpush'

export default function NotificationListener({ role, patientId }: { role: 'nutricionista' | 'paciente', patientId?: string }) {

    useEffect(() => {
        // 1. Pedir permisos al cargar el dashboard (una vez)
        requestNotificationPermission()

        const supabase = createClient()

        if (role === 'nutricionista') {
            // Canal para nuevas solicitudes (Nutricionista)
            const channel = supabase
                .channel('new-requests')
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'appointment_requests',
                }, (payload) => {
                    showLocalNotification(
                        '📅 Nueva solicitud de turno',
                        'Un paciente solicitó un cambio o nuevo turno.',
                        '/agenda'
                    )
                })
                .subscribe()

            return () => { supabase.removeChannel(channel) }
        } else if (role === 'paciente' && patientId) {
            // Canal para actualizaciones de solicitudes enviadas (Paciente)
            const channel = supabase
                .channel('request-updates')
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'appointment_requests',
                    filter: `patient_id=eq.${patientId}`,
                }, (payload) => {
                    const status = payload.new.status
                    if (status === 'aprobado') {
                        showLocalNotification(
                            '✅ Turno confirmado',
                            'Tu nutricionista aprobó tu solicitud de turno.',
                            '/mis-turnos'
                        )
                    } else if (status === 'rechazado') {
                        showLocalNotification(
                            '❌ Solicitud rechazada',
                            'Tu solicitud de turno no pudo ser confirmada.',
                            '/mis-turnos'
                        )
                    }
                })
                .subscribe()

            return () => { supabase.removeChannel(channel) }
        }
    }, [role, patientId])

    return null
}

import type { Appointment } from '@/types'
import { APPOINTMENT_TYPE_LABELS } from '@/types'
import AppointmentBadge from './AppointmentBadge'

interface AppointmentCardProps {
    appointment: Appointment
    onClick?: () => void
}

export default function AppointmentCard({ appointment, onClick }: AppointmentCardProps) {
    const time = appointment.time?.slice(0, 5) // HH:MM

    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 px-4 py-3 bg-white rounded-xl border border-border
                 hover:border-teal/40 hover:shadow-sm transition text-left"
        >
            {/* Hora */}
            <div className="flex-shrink-0 w-14 text-center">
                <span className="text-base font-bold text-dark">{time}</span>
            </div>

            {/* Separador */}
            <div className="w-px h-10 bg-border flex-shrink-0" />

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-dark truncate">
                    {appointment.patient?.full_name ?? 'Paciente'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                    {APPOINTMENT_TYPE_LABELS[appointment.type]}
                </p>
            </div>

            {/* Badge */}
            <AppointmentBadge status={appointment.status} />
        </button>
    )
}

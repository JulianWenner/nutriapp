import type { AppointmentStatus } from '@/types'

const STATUS_CONFIG: Record<
    AppointmentStatus,
    { label: string; bg: string; color: string }
> = {
    confirmado: { label: 'Confirmado', bg: '#E8F7EE', color: '#3BAD7A' },
    pendiente: { label: 'Pendiente', bg: '#FFF4E5', color: '#E8A04A' },
    cancelado: { label: 'Cancelado', bg: '#FFF0F0', color: '#E05555' },
    realizado: { label: 'Realizado', bg: '#F2F7F6', color: '#8A9E9C' },
}

interface AppointmentBadgeProps {
    status: AppointmentStatus
}

export default function AppointmentBadge({ status }: AppointmentBadgeProps) {
    const cfg = STATUS_CONFIG[status]
    return (
        <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: cfg.bg, color: cfg.color }}
        >
            {cfg.label}
        </span>
    )
}

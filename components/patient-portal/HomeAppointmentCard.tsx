import React from 'react'
import Link from 'next/link'
import { Appointment, APPOINTMENT_TYPE_LABELS } from '@/types'
import { Calendar, Clock, ChevronRight } from 'lucide-react'
import { formatDateSpanish } from '@/lib/utils/dates'

interface Props {
    appointment: Appointment | null
}

export default function HomeAppointmentCard({ appointment }: Props) {
    if (!appointment) {
        return (
            <Link href="/mis-turnos" className="block bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-teal-600" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold text-lg leading-tight">Agendá tu consulta</h3>
                <p className="text-slate-500 text-sm mt-1">Todavía no tenés turnos programados.</p>
                <button className="mt-4 w-full py-3 bg-teal-600 text-white rounded-xl text-sm font-semibold hover:bg-teal-700 transition-colors">
                    Solicitar Turno
                </button>
            </Link>
        )
    }

    return (
        <Link href="/mis-turnos" className="block bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-teal-600" />
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border border-emerald-100">
                        Confirmado
                    </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">Próxima Consulta</p>
                    <h3 className="text-slate-900 font-black text-2xl mt-1 leading-tight">
                        {formatDateSpanish(appointment.date)}
                    </h3>
                </div>

                <div className="flex items-center gap-4 py-3 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 font-bold">{appointment.time.slice(0, 5)} hs</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                    <span className="text-slate-500 text-sm font-medium">
                        {APPOINTMENT_TYPE_LABELS[appointment.type]}
                    </span>
                </div>
            </div>
        </Link>
    )
}

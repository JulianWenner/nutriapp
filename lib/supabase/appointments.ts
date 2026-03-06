import { createClient } from '@/lib/supabase/server'
import type {
    Appointment,
    AppointmentRequest,
    AppointmentStatus,
} from '@/types'

// Zona horaria para Argentina
export const TZ = 'America/Argentina/Buenos_Aires'

// Formato de fecha a YYYY-MM-DD en AR
export function todayAR(): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

// ─── Nutricionista ────────────────────────────────────────

/** Turnos entre dos fechas (inclusive) con join al perfil del paciente */
export async function getAppointmentsByWeek(
    startDate: string,
    endDate: string
): Promise<Appointment[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('appointments')
        .select(`
      *,
      patients!inner(
        profile_id,
        profiles!inner(full_name, email)
      )
    `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

    if (error) {
        console.error('getAppointmentsByWeek:', error)
        return []
    }

    interface AppointmentRow {
        patients?: { profiles?: { full_name?: string; email?: string } }
        [key: string]: unknown
    }

    const rows = data as unknown as AppointmentRow[]
    return (rows ?? []).map((row) => ({
        ...row,
        patient: {
            full_name: row.patients?.profiles?.full_name ?? '',
            email: row.patients?.profiles?.email ?? '',
        },
    })) as Appointment[]
}

/** Próximo turno confirmado de un paciente */
export async function getNextAppointment(
    patientId: string
): Promise<Appointment | null> {
    const supabase = createClient()
    const today = todayAR()

    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'confirmado')
        .gte('date', today)
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(1)
        .single()

    if (error) return null
    return data as Appointment
}

/** Turnos del día de hoy para el dashboard de la nutricionista */
export async function getTodayAppointments(): Promise<Appointment[]> {
    const today = todayAR()
    return getAppointmentsByWeek(today, today)
}

/** Solicitudes pendientes con join al perfil */
export async function getPendingRequests(): Promise<AppointmentRequest[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('appointment_requests')
        .select(`
      *,
      patients!inner(
        profiles!inner(full_name)
      )
    `)
        .eq('status', 'pendiente')
        .order('created_at', { ascending: true })

    if (error) {
        console.error('getPendingRequests:', error)
        return []
    }

    interface RequestRow {
        patients?: { profiles?: { full_name?: string } }
        [key: string]: unknown
    }

    const rows = data as unknown as RequestRow[]
    return (rows ?? []).map((row) => ({
        ...row,
        patient: {
            full_name: row.patients?.profiles?.full_name ?? '',
        },
    })) as AppointmentRequest[]
}

/** Crear un turno nuevo */
export async function createAppointment(
    data: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'patient'>
): Promise<Appointment | null> {
    const supabase = createClient()
    const { data: result, error } = await supabase
        .from('appointments')
        .insert(data)
        .select()
        .single()

    if (error) {
        console.error('createAppointment:', error)
        return null
    }
    return result as Appointment
}

/** Actualizar estado de un turno */
export async function updateAppointmentStatus(
    id: string,
    status: AppointmentStatus
): Promise<boolean> {
    const supabase = createClient()
    const { error } = await supabase
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)

    if (error) {
        console.error('updateAppointmentStatus:', error)
        return false
    }
    return true
}

/** Resolver una solicitud (aprobar o rechazar) con lógica transaccional */
export async function resolveRequest(
    requestId: string,
    action: 'aprobado' | 'rechazado'
): Promise<boolean> {
    const supabase = createClient()

    // Leer la solicitud
    const { data: req, error: reqErr } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('id', requestId)
        .single()

    if (reqErr || !req) return false

    if (action === 'aprobado') {
        if (req.type === 'nuevo') {
            // Crear turno nuevo
            const { error: insErr } = await supabase.from('appointments').insert({
                patient_id: req.patient_id,
                date: req.requested_date,
                time: req.requested_time,
                type: 'control',
                status: 'confirmado',
                notes: req.message ?? null,
            })
            if (insErr) {
                console.error('resolveRequest (nuevo):', insErr)
                return false
            }
        } else if (req.type === 'cambio' && req.appointment_id) {
            const { error: updErr } = await supabase
                .from('appointments')
                .update({
                    date: req.requested_date,
                    time: req.requested_time,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', req.appointment_id)
            if (updErr) {
                console.error('resolveRequest (cambio):', updErr)
                return false
            }
        } else if (req.type === 'cancelacion' && req.appointment_id) {
            const { error: cancelErr } = await supabase
                .from('appointments')
                .update({ status: 'cancelado', updated_at: new Date().toISOString() })
                .eq('id', req.appointment_id)
            if (cancelErr) {
                console.error('resolveRequest (cancelacion):', cancelErr)
                return false
            }
        }
    }

    // Actualizar estado de la solicitud
    const { error: statusErr } = await supabase
        .from('appointment_requests')
        .update({ status: action, resolved_at: new Date().toISOString() })
        .eq('id', requestId)

    if (statusErr) {
        console.error('resolveRequest (status update):', statusErr)
        return false
    }
    return true
}

// ─── Paciente ─────────────────────────────────────────────

/** Crear una solicitud de turno */
export async function createAppointmentRequest(
    data: Omit<AppointmentRequest, 'id' | 'created_at' | 'patient'>
): Promise<AppointmentRequest | null> {
    const supabase = createClient()
    const { data: result, error } = await supabase
        .from('appointment_requests')
        .insert(data)
        .select()
        .single()

    if (error) {
        console.error('createAppointmentRequest:', error)
        return null
    }
    return result as AppointmentRequest
}

/** Turnos pasados de un paciente (realizado o cancelado) */
export async function getPastAppointments(
    patientId: string
): Promise<Appointment[]> {
    const supabase = createClient()
    const today = todayAR()

    const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .in('status', ['realizado', 'cancelado'])
        .lt('date', today)
        .order('date', { ascending: false })

    if (error) return []
    return (data ?? []) as Appointment[]
}

/** Solicitudes pendientes de un paciente */
export async function getPatientPendingRequests(
    patientId: string
): Promise<AppointmentRequest[]> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('appointment_requests')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'pendiente')

    if (error) return []
    return (data ?? []) as AppointmentRequest[]
}

/** ID del paciente a partir de su profile_id */
export async function getPatientIdFromProfileId(
    profileId: string
): Promise<string | null> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('patients')
        .select('id')
        .eq('profile_id', profileId)
        .single()

    if (error) return null
    return data?.id ?? null
}

/** Lista de todos los pacientes para el selector de la nutricionista */
export async function getAllPatients(): Promise<
    { id: string; full_name: string }[]
> {
    const supabase = createClient()
    const { data, error } = await supabase
        .from('patients')
        .select('id, profiles!inner(full_name)')

    if (error) return []
    interface PatientRow {
        id: string
        profiles?: { full_name?: string }
        [key: string]: unknown
    }

    const rows = data as unknown as PatientRow[]
    return (rows ?? []).map((row) => ({
        id: row.id,
        full_name: row.profiles?.full_name ?? '',
    }))
}

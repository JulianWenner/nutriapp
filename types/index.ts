export type Role = 'nutricionista' | 'paciente'

export interface Profile {
  id: string
  role: Role
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  profile_id: string
  birth_date?: string
  sex?: 'F' | 'M'
  private_notes?: string
  created_at: string
  updated_at: string
}

// --- Fase 2: Turnos ---

export type AppointmentStatus = 'confirmado' | 'pendiente' | 'cancelado' | 'realizado'
export type AppointmentType = 'primera_consulta' | 'control' | 'seguimiento' | 'antropometria'
export type RequestType = 'nuevo' | 'cambio' | 'cancelacion'
export type RequestStatus = 'pendiente' | 'aprobado' | 'rechazado'

export interface Appointment {
  id: string
  patient_id: string
  date: string        // YYYY-MM-DD
  time: string        // HH:MM
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
  created_at: string
  updated_at?: string
  // join con profiles del paciente
  patient?: {
    full_name: string
    email: string
  }
}

export interface AppointmentRequest {
  id: string
  patient_id: string
  appointment_id?: string
  type: RequestType
  status: RequestStatus
  requested_date?: string
  requested_time?: string
  message?: string
  resolved_at?: string
  created_at: string
  patient?: {
    full_name: string
  }
}

// Labels legibles por tipo de consulta
export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  primera_consulta: 'Primera consulta',
  control: 'Control mensual',
  seguimiento: 'Seguimiento',
  antropometria: 'Antropometría',
}

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  nuevo: 'Solicitud de nuevo turno',
  cambio: 'Solicitud de cambio de turno',
  cancelacion: 'Solicitud de cancelación',
}

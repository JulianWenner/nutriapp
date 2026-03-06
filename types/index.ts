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

// --- Fase 3: Planes Nutricionales ---

export interface Food {
  id: string
  name: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  fiber_per_100g: number
  source: 'usda' | 'sara' | 'custom'
  external_id?: string
  is_public: boolean
  portions?: Portion[]
}

export interface Portion {
  id: string
  food_id: string
  name: string
  weight_grams: number
}

export interface DishIngredient {
  id: string
  dish_id: string
  food_id: string
  portion_id?: string
  quantity: number
  weight_grams: number
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  food?: Food
  portion?: Portion
}

export interface Dish {
  id: string
  name: string
  tag?: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  total_fiber: number
  ingredients?: DishIngredient[]
}

export type MealSlot =
  | 'desayuno' | 'colacion_manana' | 'almuerzo'
  | 'merienda' | 'colacion_tarde' | 'cena' | 'colacion_noche'

export interface PlanMeal {
  id: string
  plan_id: string
  day_of_week: number   // 1=Lunes ... 7=Domingo
  meal_slot: MealSlot
  dish_ids: string[]
  dishes?: Dish[]       // populated via join
}

export interface NutritionPlan {
  id: string
  name: string
  target_calories?: number
  target_protein?: number
  target_carbs?: number
  target_fat?: number
  meals?: PlanMeal[]
}

export interface MacroSummary {
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
}

// Labels legibles para la UI
export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  desayuno: '☀️ Desayuno',
  colacion_manana: '🌤 Col. mañana',
  almuerzo: '🌞 Almuerzo',
  merienda: '🌤 Merienda',
  colacion_tarde: '🌥 Col. tarde',
  cena: '🌙 Cena',
  colacion_noche: '🌑 Col. noche',
}

export const DAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export const TAG_LABELS: Record<string, string> = {
  desayuno: 'Desayuno',
  almuerzo: 'Almuerzo',
  cena: 'Cena',
  colacion: 'Colación',
  merienda: 'Merienda',
  alto_proteina: 'Alto en proteína',
  otro: 'Otro',
}

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

// --- Fase 4: Antropometría ---

export type ISAKLevel = 1 | 2
export type RangeCategory = 'normal' | 'limite' | 'riesgo' | 'referencia'
export type BodyZone = 'chest' | 'waist' | 'hips' | 'arms' | 'thighs' | 'calves' | 'back'

export interface AnthropometryMeasures {
  // Básicos
  weight_kg: number
  height_cm: number
  // Pliegues N1
  skinfold_triceps?: number
  skinfold_subscapular?: number
  skinfold_suprailiac?: number
  skinfold_calf_medial?: number
  // Pliegues N2 adicionales
  skinfold_biceps?: number
  skinfold_iliac_crest?: number
  skinfold_abdominal?: number
  skinfold_front_thigh?: number
  // Circunferencias N1
  circ_waist?: number
  circ_hip?: number
  circ_arm_relaxed?: number
  circ_calf?: number
  // Circunferencias N2 adicionales
  circ_head?: number
  circ_neck?: number
  circ_arm_flexed?: number
  circ_mid_thigh?: number
  // Diámetros N2
  diam_humerus?: number
  diam_femur?: number
  // Longitudes N2
  height_sitting?: number
  wingspan?: number
}

export interface AnthropometryResult {
  value: number
  category: RangeCategory
  label: string           // texto legible de la categoría
  reference: string       // ej: "18.5 – 24.9"
}

export interface AnthropometryResults {
  bmi: AnthropometryResult
  body_fat_pct: AnthropometryResult
  muscle_mass_kg: AnthropometryResult
  bone_mass_kg: AnthropometryResult
  residual_mass_kg: AnthropometryResult
  whr: AnthropometryResult
  somatotype?: {
    endomorphy: number
    mesomorphy: number
    ectomorphy: number
    dominant: string      // "Mesomorfo", "Ectomorfo", "Endomorfo", etc
  }
}

export interface AnthropometryEval {
  id: string
  patient_id: string
  eval_date: string
  isak_level: ISAKLevel
  shared_with_patient: boolean
  measures: AnthropometryMeasures
  results?: AnthropometryResults
  created_at: string
}

// --- Fase 5: Portal del Paciente + Asistente IA ---

export interface MealAdherence {
  id: string
  patient_id: string
  plan_meal_id: string
  week_start: string        // YYYY-MM-DD (lunes de la semana)
  completed: boolean
  completed_at?: string
  comment?: string
}

export interface AdherenceSummary {
  total_meals: number
  completed_meals: number
  percentage: number        // 0-100
  by_day: {
    day_of_week: number     // 1-7
    total: number
    completed: number
    percentage: number
  }[]
}

export interface ChatMessage {
  id: string
  patient_id: string
  role: 'user' | 'assistant'
  content: string
  image_url?: string
  created_at: string
}

export interface AIUsage {
  date: string
  message_count: number
  limit: number
  remaining: number
}

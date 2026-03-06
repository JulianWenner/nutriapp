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

export type UserRole = 'EMPLOYEE' | 'SUPERVISOR' | 'HR' | 'ADMIN'

export interface Profile {
  id: string
  user_id: string
  legajo: string
  name: string
  dni: string
  company: string
  area: string
  sector: string
  position: string
  category: string
  supervisor_id: string | null
  manager_name: string | null
  role: UserRole
  regime: string
  shift: string
  schedule: string
  worksite: string
  base: string
  cost_center: string
  entry_date: string
  email: string
  phone: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface AccessPoint {
  id: string
  code: string
  name: string
  worksite: string
  device: string
  ip_address: string
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
  created_at: string
}

export interface BiometricEvent {
  id: string
  code: string
  employee_id: string
  access_point_id: string
  timestamp: string
  type: 'INGRESO' | 'EGRESO'
  original_timestamp: string
  received_timestamp: string
  status: string
  worksite: string
  shift: string
  created_at: string
  // Joined
  profiles?: Profile
  access_points?: AccessPoint
}

export interface OvertimeRequest {
  id: string
  code: string
  employee_id: string
  date: string
  normal_hours: string
  extra_hours: string
  reason: string
  cost_center: string
  project: string
  supervisor_id: string | null
  status: 'PENDIENTE SUPERVISOR' | 'APROBADA' | 'RECHAZADA' | 'VALIDADA'
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  // Joined
  profiles?: Profile
}

export interface StandbyDuty {
  id: string
  code: string
  employee_id: string
  date: string
  start_time: string
  end_time: string
  type: 'GUARDIA PASIVA' | 'GUARDIA ACTIVA' | 'GUARDIA DE EMERGENCIA'
  sector: string
  supervisor_id: string | null
  cost_center: string
  project: string
  status: 'PROGRAMADA' | 'CONFIRMADA' | 'CUMPLIDA' | 'CANCELADA'
  reason: string
  created_at: string
  // Joined
  profiles?: Profile
}

export interface Correction {
  id: string
  code: string
  employee_id: string
  correction_type: string
  original_record: string
  requested_change: string
  reason: string
  status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface HRTicket {
  id: string
  code: string
  employee_id: string
  category: string
  subject: string
  status: 'ABIERTO' | 'EN ANÁLISIS' | 'RESUELTO' | 'CERRADO'
  created_at: string
  updated_at: string
}

export interface TicketMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  created_at: string
  profiles?: Profile
}

export interface Preliquidation {
  id: string
  employee_id: string
  period: string
  programmed_days: number
  worked_days: number
  normal_hours: number
  approved_ot: number
  pending_ot: number
  standby_count: number
  holidays: number
  absences: number
  status: 'EN CONSTRUCCIÓN' | 'VALIDADO' | 'REQUIERE ATENCIÓN' | 'CERRADO'
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface AuditLog {
  id: string
  code: string
  user_id: string | null
  user_name: string
  role: UserRole
  action: string
  detail: string
  ip_address: string
  created_at: string
}

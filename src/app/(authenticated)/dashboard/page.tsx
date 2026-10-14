'use client'

import { useAuth } from '@/lib/hooks'
import { useRoleView } from '@/lib/role-context'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import {
  Clock, Users, AlertTriangle, Calendar, CheckCircle,
  Activity, Briefcase, Settings, TrendingUp, Fingerprint
} from 'lucide-react'
import type { BiometricEvent, OvertimeRequest, StandbyDuty, Profile } from '@/lib/types'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { activeRole } = useRoleView()
  const supabase = createClient()
  const [events, setEvents] = useState<BiometricEvent[]>([])
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([])
  const [teamMembers, setTeamMembers] = useState<Profile[]>([])
  const [standbyDuties, setStandbyDuties] = useState<StandbyDuty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    loadData()
  }, [profile])

  const loadData = async () => {
    if (!profile) return
    setLoading(true)

    // Load biometric events
    const { data: eventsData } = await supabase
      .from('biometric_events')
      .select('*, access_points(*)')
      .order('timestamp', { ascending: false })
      .limit(10)

    if (eventsData) setEvents(eventsData)

    // Load overtime requests
    const { data: otData } = await supabase
      .from('overtime_requests')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })
      .limit(10)

    if (otData) setOvertimeRequests(otData)

    // Load standby duties
    const { data: sbData } = await supabase
      .from('standby_duties')
      .select('*, profiles(*)')
      .order('date', { ascending: true })
      .limit(5)

    if (sbData) setStandbyDuties(sbData)

    // If supervisor or admin, load team/profiles
    if (profile.role === 'SUPERVISOR') {
      const { data: teamData } = await supabase
        .from('profiles')
        .select('*')
        .eq('supervisor_id', profile.id)

      if (teamData) setTeamMembers(teamData)
    }

    // If HR/Admin, load all employees
    if (profile.role === 'HR' || profile.role === 'ADMIN') {
      const { data: allData } = await supabase
        .from('profiles')
        .select('*')
        .order('name')

      if (allData) setTeamMembers(allData)
    }

    setLoading(false)
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm animate-pulse">Cargando dashboard...</p>
      </div>
    )
  }

  const displayRole = profile.role === 'ADMIN' ? activeRole : profile.role
  const todayEntry = events.find(e => e.type === 'INGRESO')
  const pendingOT = overtimeRequests.filter(ot => ot.status === 'PENDIENTE SUPERVISOR').length
  const nextStandby = standbyDuties[0]

  // Employee Dashboard
  if (displayRole === 'EMPLOYEE') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Portal del Empleado • Operación Tierra del Fuego</span>
            <h1 className="text-2xl font-bold text-white mt-1">Bienvenido, {profile.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Legajo {profile.legajo} • {profile.position} • {profile.worksite}</p>
          </div>
          <div className="flex items-center space-x-3 bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-400">EN LÍNEA</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Ingreso de Hoy"
            value={todayEntry ? new Date(todayEntry.timestamp).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Sin registro'}
            icon={<Clock className="w-4 h-4" />}
          />
          <StatCard
            label="Horas Extra del Mes"
            value={`${overtimeRequests.length} solicitudes`}
            icon={<TrendingUp className="w-4 h-4" />}
            valueColor="text-emerald-400"
          />
          <StatCard
            label="Próxima Guardia"
            value={nextStandby ? new Date(nextStandby.date).toLocaleDateString('es-AR') : 'Sin guardias'}
            icon={<Calendar className="w-4 h-4" />}
            valueColor="text-blue-400"
          />
        </div>

        {/* Events table */}
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center mb-4">
            <Activity className="w-4 h-4 mr-2 text-emerald-400" />
            Registro de Eventos Biométricos
          </h3>
          {events.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-700">
                  <tr>
                    <th className="p-3">Dispositivo / Punto</th>
                    <th className="p-3">Fecha y Hora</th>
                    <th className="p-3">Tipo</th>
                    <th className="p-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {events.map(e => (
                    <tr key={e.id}>
                      <td className="p-3 text-slate-300">{e.access_points?.name || 'N/A'}</td>
                      <td className="p-3 font-mono">{new Date(e.timestamp).toLocaleString('es-AR')}</td>
                      <td className="p-3"><Badge status={e.type === 'INGRESO' ? 'EN JORNADA' : 'FUERA'} />{' '}<span className="text-white font-medium">{e.type}</span></td>
                      <td className="p-3"><Badge status={e.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">No hay eventos biométricos registrados</p>
          )}
        </div>
      </div>
    )
  }

  // Supervisor Dashboard
  if (displayRole === 'SUPERVISOR') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-xl font-bold text-white">Gestión de Personal en Yacimiento</h1>
          <p className="text-xs text-slate-400">Supervisor: {profile.name} • {profile.worksite}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Personal Asignado" value={`${teamMembers.length} operarios`} icon={<Users className="w-4 h-4" />} />
          <StatCard label="Presentes" value={`${teamMembers.length} operarios`} icon={<CheckCircle className="w-4 h-4" />} valueColor="text-emerald-400" />
          <StatCard label="HE Pendientes" value={`${pendingOT} solicitudes`} icon={<AlertTriangle className="w-4 h-4" />} valueColor="text-amber-400" />
          <StatCard label="Guardias Activas" value={`${standbyDuties.length} guardias`} icon={<Calendar className="w-4 h-4" />} valueColor="text-blue-400" />
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-4">Listado de Operarios</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">Legajo & Empleado</th>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Posición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {teamMembers.map(emp => (
                  <tr key={emp.id}>
                    <td className="p-3">
                      <strong className="text-white block">{emp.name}</strong>
                      <span className="text-[10px] text-slate-400">Legajo {emp.legajo}</span>
                    </td>
                    <td className="p-3 text-slate-300">{emp.company}</td>
                    <td className="p-3 text-slate-300">{emp.sector}</td>
                    <td className="p-3 text-slate-300">{emp.position}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {teamMembers.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No hay personal asignado</p>}
        </div>
      </div>
    )
  }

  // HR Dashboard
  if (displayRole === 'HR') {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Centro de Gestión RRHH</h1>
            <p className="text-xs text-slate-400">Control Operativo Tierra del Fuego</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="Personal Activo TDF" value={`${teamMembers.length} operarios`} icon={<Users className="w-4 h-4" />} />
          <StatCard label="Jornadas Incompletas" value="—" icon={<AlertTriangle className="w-4 h-4" />} valueColor="text-amber-400" />
          <StatCard label="HE Pendientes" value={`${pendingOT} solicitudes`} icon={<Briefcase className="w-4 h-4" />} valueColor="text-purple-400" />
          <StatCard label="Lectores Online" value="—" icon={<Fingerprint className="w-4 h-4" />} valueColor="text-emerald-400" />
        </div>

        {overtimeRequests.filter(ot => ot.status === 'PENDIENTE SUPERVISOR').length > 0 && (
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4">Bandeja "Requiere Atención"</h3>
            <div className="space-y-2">
              {overtimeRequests.filter(ot => ot.status === 'PENDIENTE SUPERVISOR').map(ot => (
                <div key={ot.id} className="bg-amber-950/40 border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <strong className="text-amber-200 block">{ot.profiles?.name} - Hora Extra Pendiente ({ot.extra_hours})</strong>
                    <span className="text-[11px] text-slate-300">{ot.reason}</span>
                  </div>
                  <Badge status={ot.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-white">Panel de Administración General & Biometría</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-2">Dispositivos Biométricos</h3>
          <p className="text-xs text-slate-400 mb-4">Integración mediante API, Webhooks y Base SQL.</p>
          <div className="text-2xl font-bold text-emerald-400">—</div>
        </div>
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-2">Motor de Reglas & Convenio</h3>
          <p className="text-xs text-slate-400 mb-4">Configuración de regímenes 14x14, 7x7, etc.</p>
          <button className="w-full bg-slate-700 text-white py-2 rounded-xl text-xs font-semibold hover:bg-slate-600 transition-all">Configurar Reglas</button>
        </div>
        <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-2">Audit Log</h3>
          <p className="text-xs text-slate-400 mb-4">Trazabilidad de accesos y modificaciones.</p>
          <button onClick={() => window.location.href = '/admin/auditoria'} className="w-full bg-slate-700 text-white py-2 rounded-xl text-xs font-semibold hover:bg-slate-600 transition-all">Ver Audit Logs</button>
        </div>
      </div>
    </div>
  )
}

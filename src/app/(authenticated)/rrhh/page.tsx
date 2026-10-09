'use client'

import { useAuth } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import { Briefcase, Users, AlertTriangle, Fingerprint, Download } from 'lucide-react'
import type { Profile, OvertimeRequest, HRTicket } from '@/lib/types'

export default function RRHHPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const { showToast } = useToast()
  const [employees, setEmployees] = useState<Profile[]>([])
  const [overtime, setOvertime] = useState<OvertimeRequest[]>([])
  const [tickets, setTickets] = useState<HRTicket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    setLoading(true)
    const [empRes, otRes, ticketRes] = await Promise.all([
      supabase.from('profiles').select('*').order('name'),
      supabase.from('overtime_requests').select('*, profiles(*)').order('created_at', { ascending: false }),
      supabase.from('hr_tickets').select('*').order('created_at', { ascending: false }),
    ])
    if (empRes.data) setEmployees(empRes.data)
    if (otRes.data) setOvertime(otRes.data)
    if (ticketRes.data) setTickets(ticketRes.data)
    setLoading(false)
  }

  const validateOvertime = async (id: string) => {
    await supabase.from('overtime_requests').update({ status: 'VALIDADA' }).eq('id', id)
    showToast('Validado', 'La hora extra fue validada por RRHH.')
    loadData()
  }

  const pendingOT = overtime.filter(ot => ot.status === 'APROBADA')
  const openTickets = tickets.filter(t => t.status !== 'CERRADO')

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center"><Briefcase className="w-5 h-5 mr-2 text-purple-400" /> Centro de Gestión RRHH</h1>
          <p className="text-xs text-slate-400">Control Operativo Tierra del Fuego</p>
        </div>
        <button onClick={() => window.location.href = '/rrhh/preliquidacion'} className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center">
          <Download className="w-4 h-4 mr-2" /> Preliquidación
        </button>
      </div>

      {loading ? <p className="text-slate-400 animate-pulse text-center py-8">Cargando...</p> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard label="Personal Activo TDF" value={`${employees.length} operarios`} icon={<Users className="w-4 h-4" />} />
            <StatCard label="Tickets Abiertos" value={`${openTickets.length} casos`} icon={<AlertTriangle className="w-4 h-4" />} valueColor="text-amber-400" />
            <StatCard label="HE para Validar" value={`${pendingOT.length} solicitudes`} icon={<Briefcase className="w-4 h-4" />} valueColor="text-purple-400" />
            <StatCard label="Lectores Online" value="—" icon={<Fingerprint className="w-4 h-4" />} valueColor="text-emerald-400" />
          </div>

          {/* Overtime to validate */}
          {pendingOT.length > 0 && (
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4">Horas Extra Aprobadas — Pendientes de Validación RRHH</h3>
              <div className="space-y-2">
                {pendingOT.map(ot => (
                  <div key={ot.id} className="bg-purple-950/30 border border-purple-500/30 p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <strong className="text-purple-200 block">{ot.profiles?.name} — {ot.extra_hours}</strong>
                      <span className="text-[11px] text-slate-300">{ot.reason}</span>
                    </div>
                    <button onClick={() => validateOvertime(ot.id)} className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg font-semibold">Validar</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tickets */}
          {openTickets.length > 0 && (
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-4">Tickets de Atención ({openTickets.length})</h3>
              <div className="space-y-2">
                {openTickets.map(t => (
                  <div key={t.id} className="bg-slate-900/60 border border-slate-700/50 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-purple-400 font-bold">{t.code}</span>
                      <span className="ml-2 text-white">{t.subject}</span>
                    </div>
                    <Badge status={t.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

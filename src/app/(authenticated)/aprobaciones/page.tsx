'use client'

import { useAuth } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import Badge from '@/components/ui/Badge'
import { CheckSquare } from 'lucide-react'
import type { OvertimeRequest, Correction } from '@/lib/types'

export default function AprobacionesPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const { showToast } = useToast()
  const [overtime, setOvertime] = useState<OvertimeRequest[]>([])
  const [corrections, setCorrections] = useState<Correction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    setLoading(true)
    const [otRes, corrRes] = await Promise.all([
      supabase.from('overtime_requests').select('*, profiles(*)').eq('supervisor_id', profile!.id).order('created_at', { ascending: false }),
      supabase.from('corrections').select('*, profiles:employee_id(*)').order('created_at', { ascending: false }),
    ])
    if (otRes.data) setOvertime(otRes.data)
    if (corrRes.data) setCorrections(corrRes.data as any)
    setLoading(false)
  }

  const handleOvertimeAction = async (id: string, status: 'APROBADA' | 'RECHAZADA', empName: string) => {
    const { error } = await supabase.from('overtime_requests').update({
      status,
      approved_by: profile!.id,
      approved_at: new Date().toISOString(),
    }).eq('id', id)
    if (error) { showToast('Error', error.message, 'error'); return }
    
    // Audit log
    await supabase.from('audit_logs').insert({
      code: `AUD-${Math.floor(Math.random() * 9000 + 1000)}`,
      user_id: profile!.id,
      user_name: profile!.name,
      role: profile!.role,
      action: status === 'APROBADA' ? 'APROBACIÓN DE HORA EXTRA' : 'RECHAZO DE HORA EXTRA',
      detail: `${status} hora extra para ${empName}`,
    })

    showToast(status === 'APROBADA' ? 'Aprobado' : 'Rechazado', status === 'APROBADA' ? `Hora extra de ${empName} aprobada.` : 'La solicitud fue rechazada.', status === 'APROBADA' ? 'success' : 'error')
    loadData()
  }

  const handleCorrectionAction = async (id: string, status: 'APROBADA' | 'RECHAZADA') => {
    await supabase.from('corrections').update({ status, reviewed_by: profile!.id, reviewed_at: new Date().toISOString() }).eq('id', id)
    showToast(status === 'APROBADA' ? 'Aprobado' : 'Rechazado', `Corrección ${status.toLowerCase()}.`, status === 'APROBADA' ? 'success' : 'error')
    loadData()
  }

  const pendingOT = overtime.filter(ot => ot.status === 'PENDIENTE SUPERVISOR')
  const pendingCorr = corrections.filter(c => c.status === 'PENDIENTE')

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-white flex items-center">
        <CheckSquare className="w-5 h-5 mr-2 text-blue-400" /> Bandeja de Aprobaciones
      </h1>

      {loading ? (
        <p className="text-slate-400 text-sm animate-pulse text-center py-8">Cargando...</p>
      ) : (
        <>
          {/* Overtime approvals */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">Horas Extra Pendientes ({pendingOT.length})</h2>
            {pendingOT.length === 0 ? (
              <p className="text-slate-400 text-sm bg-slate-800 p-4 rounded-xl">No hay horas extra pendientes de aprobación</p>
            ) : (
              <div className="space-y-3">
                {pendingOT.map(ot => (
                  <div key={ot.id} className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-white text-sm">{ot.profiles?.name || 'Empleado'}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300">{ot.extra_hours} Adicionales</span>
                        <span className="text-xs text-slate-400">({new Date(ot.date).toLocaleDateString('es-AR')})</span>
                      </div>
                      <p className="text-xs text-slate-300"><strong>Motivo:</strong> {ot.reason}</p>
                      <p className="text-[11px] text-slate-400">Centro de Costo: <span className="font-mono">{ot.cost_center}</span> • Proyecto: {ot.project}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => handleOvertimeAction(ot.id, 'APROBADA', ot.profiles?.name || '')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow">Aprobar</button>
                      <button onClick={() => handleOvertimeAction(ot.id, 'RECHAZADA', ot.profiles?.name || '')} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow">Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Correction approvals */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">Correcciones Pendientes ({pendingCorr.length})</h2>
            {pendingCorr.length === 0 ? (
              <p className="text-slate-400 text-sm bg-slate-800 p-4 rounded-xl">No hay correcciones pendientes</p>
            ) : (
              <div className="space-y-3">
                {pendingCorr.map(c => (
                  <div key={c.id} className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <span className="font-bold text-white text-sm">{c.correction_type}</span>
                      <p className="text-xs text-slate-300">{c.reason}</p>
                      <p className="text-[11px] text-slate-400">Original: {c.original_record}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => handleCorrectionAction(c.id, 'APROBADA')} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow">Aprobar</button>
                      <button onClick={() => handleCorrectionAction(c.id, 'RECHAZADA')} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow">Rechazar</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          <div>
            <h2 className="text-sm font-bold text-white mb-3">Historial Completo</h2>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="p-2">Empleado</th>
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Detalle</th>
                      <th className="p-2">Estado</th>
                      <th className="p-2">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {overtime.filter(ot => ot.status !== 'PENDIENTE SUPERVISOR').map(ot => (
                      <tr key={ot.id}>
                        <td className="p-2 text-white">{ot.profiles?.name}</td>
                        <td className="p-2 text-slate-300">Hora Extra</td>
                        <td className="p-2 text-slate-300">{ot.extra_hours} - {ot.reason?.substring(0, 40)}...</td>
                        <td className="p-2"><Badge status={ot.status} /></td>
                        <td className="p-2 text-slate-400 font-mono">{new Date(ot.date).toLocaleDateString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

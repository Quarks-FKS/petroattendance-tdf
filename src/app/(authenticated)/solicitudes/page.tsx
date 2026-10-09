'use client'

import { useAuth } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Badge from '@/components/ui/Badge'
import { FileText, PlusCircle } from 'lucide-react'
import type { OvertimeRequest, Correction } from '@/lib/types'

export default function SolicitudesPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [overtime, setOvertime] = useState<OvertimeRequest[]>([])
  const [corrections, setCorrections] = useState<Correction[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overtime' | 'corrections'>('overtime')

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    setLoading(true)
    const [otRes, corrRes] = await Promise.all([
      supabase.from('overtime_requests').select('*').eq('employee_id', profile!.id).order('created_at', { ascending: false }),
      supabase.from('corrections').select('*').eq('employee_id', profile!.id).order('created_at', { ascending: false }),
    ])
    if (otRes.data) setOvertime(otRes.data)
    if (corrRes.data) setCorrections(corrRes.data)
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-white flex items-center">
          <FileText className="w-5 h-5 mr-2 text-emerald-400" /> Mis Solicitudes
        </h1>
        <button onClick={() => window.location.href = '/jornada'} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center">
          <PlusCircle className="w-4 h-4 mr-1.5" /> Nueva Solicitud
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        <button onClick={() => setTab('overtime')} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === 'overtime' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          Horas Extra ({overtime.length})
        </button>
        <button onClick={() => setTab('corrections')} className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${tab === 'corrections' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
          Correcciones ({corrections.length})
        </button>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm animate-pulse text-center py-8">Cargando solicitudes...</p>
      ) : tab === 'overtime' ? (
        <div className="space-y-3">
          {overtime.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tiene solicitudes de horas extra</p>
            </div>
          ) : overtime.map(ot => (
            <div key={ot.id} className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white">Hora Extra ({ot.extra_hours})</span>
                <Badge status={ot.status} size="md" />
              </div>
              <p className="text-xs text-slate-300">{ot.reason}</p>
              <div className="text-[10px] text-slate-400 flex justify-between pt-2 border-t border-slate-700/50">
                <span>Fecha: {new Date(ot.date).toLocaleDateString('es-AR')}</span>
                <span>Centro de Costo: {ot.cost_center}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {corrections.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tiene correcciones solicitadas</p>
            </div>
          ) : corrections.map(c => (
            <div key={c.id} className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white">{c.correction_type}</span>
                <Badge status={c.status} size="md" />
              </div>
              <p className="text-xs text-slate-300">{c.reason}</p>
              <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-700/50">
                Solicitado: {new Date(c.created_at).toLocaleDateString('es-AR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

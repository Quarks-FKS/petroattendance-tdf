'use client'

import { useAuth } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import Badge from '@/components/ui/Badge'
import { Download } from 'lucide-react'
import type { Preliquidation } from '@/lib/types'

export default function PreliquidacionPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const { showToast } = useToast()
  const [data, setData] = useState<Preliquidation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    setLoading(true)
    const { data: preliqData } = await supabase
      .from('preliquidations')
      .select('*, profiles(*)')
      .order('created_at', { ascending: false })
    if (preliqData) setData(preliqData)
    setLoading(false)
  }

  const exportCSV = () => {
    if (data.length === 0) return
    const headers = 'Legajo,Nombre,DNI,Días Prog.,Días Trab.,Hs Norm.,HE Aprob.,HE Pend.,Guardias,Feriados,Ausencias,Estado\n'
    const rows = data.map(p => `${p.profiles?.legajo},${p.profiles?.name},${p.profiles?.dni},${p.programmed_days},${p.worked_days},${p.normal_hours},${p.approved_ot},${p.pending_ot},${p.standby_count},${p.holidays},${p.absences},${p.status}`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `preliquidacion_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    showToast('Exportado', 'Dataset de preliquidación exportado a CSV exitosamente.')
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Módulo de Preliquidación</h1>
          <p className="text-xs text-slate-400">Consolidado oficial para Payroll</p>
        </div>
        <button onClick={exportCSV} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-lg flex items-center">
          <Download className="w-4 h-4 mr-2" /> Exportar para Payroll
        </button>
      </div>

      {loading ? <p className="text-slate-400 animate-pulse text-center py-8">Cargando...</p> : (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-700">
              <tr>
                <th className="p-3">Legajo & Empleado</th>
                <th className="p-3">Días Prog.</th>
                <th className="p-3">Días Trab.</th>
                <th className="p-3">Hs. Norm.</th>
                <th className="p-3">HE Aprob.</th>
                <th className="p-3">HE Pend.</th>
                <th className="p-3">Guardias</th>
                <th className="p-3">Feriados</th>
                <th className="p-3">Ausencias</th>
                <th className="p-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {data.map(p => (
                <tr key={p.id}>
                  <td className="p-3"><strong className="text-white block">{p.profiles?.name}</strong><span className="text-[10px] text-slate-400">Legajo {p.profiles?.legajo}</span></td>
                  <td className="p-3 font-mono">{p.programmed_days}</td>
                  <td className="p-3 font-mono">{p.worked_days}</td>
                  <td className="p-3 font-mono text-emerald-400">{p.normal_hours}</td>
                  <td className="p-3 font-mono text-emerald-400">{p.approved_ot} hs</td>
                  <td className="p-3 font-mono text-amber-400">{p.pending_ot} hs</td>
                  <td className="p-3 font-mono text-blue-400">{p.standby_count}</td>
                  <td className="p-3 font-mono">{p.holidays}</td>
                  <td className="p-3 font-mono">{p.absences}</td>
                  <td className="p-3"><Badge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No hay datos de preliquidación</p>}
        </div>
      )}
    </div>
  )
}

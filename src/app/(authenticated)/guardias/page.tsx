'use client'

import { useAuth } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { Calendar, PlusCircle } from 'lucide-react'
import type { StandbyDuty, Profile } from '@/lib/types'

export default function GuardiasPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const { showToast } = useToast()
  const [duties, setDuties] = useState<StandbyDuty[]>([])
  const [employees, setEmployees] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee_id: '', type: 'GUARDIA PASIVA' as StandbyDuty['type'], date: '', start: '19:00', end: '07:00', reason: '' })

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    setLoading(true)
    const { data: dutiesData } = await supabase.from('standby_duties').select('*, profiles(*)').order('date', { ascending: true })
    if (dutiesData) setDuties(dutiesData)
    if (profile?.role === 'SUPERVISOR') {
      const { data: empData } = await supabase.from('profiles').select('*').eq('supervisor_id', profile.id).order('name')
      if (empData) setEmployees(empData)
    }
    setLoading(false)
  }

  const createDuty = async () => {
    if (!profile) return
    const code = `SB-${Math.floor(Math.random() * 9000 + 1000)}`
    const { error } = await supabase.from('standby_duties').insert({
      code,
      employee_id: form.employee_id,
      date: form.date,
      start_time: form.start,
      end_time: form.end,
      type: form.type,
      sector: profile.sector,
      supervisor_id: profile.id,
      cost_center: profile.cost_center,
      project: 'Guardias Operativas TDF',
      reason: form.reason || 'Retén operativo',
    })
    if (error) { showToast('Error', error.message, 'error'); return }
    showToast('Guardia Programada', 'La guardia se agregó al cronograma.')
    setShowModal(false)
    loadData()
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-white flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-400" /> Cronograma de Guardias</h1>
        {profile?.role === 'SUPERVISOR' && (
          <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center"><PlusCircle className="w-4 h-4 mr-1.5" /> Nueva Guardia</button>
        )}
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm animate-pulse text-center py-8">Cargando guardias...</p>
      ) : duties.length === 0 ? (
        <div className="text-center py-12 text-slate-400 bg-slate-800 rounded-2xl"><Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No hay guardias programadas</p></div>
      ) : (
        <div className="space-y-3">
          {duties.map(g => (
            <div key={g.id} className="bg-slate-800 border border-slate-700/60 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-bold text-white">{g.profiles?.name || 'Empleado'}</span>
                  <Badge status={g.type} size="md" />
                </div>
                <p className="text-xs text-slate-300">{g.reason}</p>
                <p className="text-[10px] text-slate-400">Fecha: {new Date(g.date).toLocaleDateString('es-AR')} ({g.start_time} - {g.end_time}) • {g.sector}</p>
              </div>
              <Badge status={g.status} size="md" />
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Programar Nueva Guardia" icon={<Calendar className="w-5 h-5 text-blue-400" />}>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Empleado</label>
            <select value={form.employee_id} onChange={e => setForm({...form, employee_id: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
              <option value="">Seleccionar...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Tipo</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value as StandbyDuty['type']})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
                <option>GUARDIA PASIVA</option>
                <option>GUARDIA ACTIVA</option>
                <option>GUARDIA DE EMERGENCIA</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Fecha</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Motivo</label>
            <input value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" placeholder="Retén operativo fin de semana" />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">Cancelar</button>
            <button onClick={createDuty} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow">Guardar Guardia</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

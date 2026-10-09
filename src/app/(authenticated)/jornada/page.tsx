'use client'

import { useAuth } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { Clock, PlusCircle, AlertCircle, Activity } from 'lucide-react'
import type { BiometricEvent, OvertimeRequest } from '@/lib/types'

export default function JornadaPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const { showToast } = useToast()
  const [events, setEvents] = useState<BiometricEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showOTModal, setShowOTModal] = useState(false)
  const [showCorrModal, setShowCorrModal] = useState(false)
  const [otForm, setOtForm] = useState({ date: new Date().toISOString().split('T')[0], hours: '', reason: '', cost_center: 'CC-MANT-01' })
  const [corrForm, setCorrForm] = useState({ type: 'Olvidé registrar salida', reason: '' })

  useEffect(() => {
    if (profile) loadEvents()
  }, [profile])

  const loadEvents = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('biometric_events')
      .select('*, access_points(*)')
      .eq('employee_id', profile!.id)
      .order('timestamp', { ascending: false })
      .limit(20)
    if (data) setEvents(data)
    setLoading(false)
  }

  const submitOvertime = async () => {
    if (!profile) return
    const code = `OT-${Math.floor(Math.random() * 9000 + 1000)}`
    const { error } = await supabase.from('overtime_requests').insert({
      code,
      employee_id: profile.id,
      date: otForm.date,
      extra_hours: otForm.hours,
      reason: otForm.reason || 'Intervención operativa no programada',
      cost_center: otForm.cost_center,
      project: 'Yacimiento San Sebastián TDF',
      supervisor_id: profile.supervisor_id,
    })
    if (error) { showToast('Error', error.message, 'error'); return }
    showToast('Solicitud Enviada', 'La solicitud de horas extra ingresó al workflow de aprobación.')
    setShowOTModal(false)
    setOtForm({ date: new Date().toISOString().split('T')[0], hours: '', reason: '', cost_center: 'CC-MANT-01' })
  }

  const submitCorrection = async () => {
    if (!profile) return
    const code = `COR-${Math.floor(Math.random() * 9000 + 1000)}`
    const { error } = await supabase.from('corrections').insert({
      code,
      employee_id: profile.id,
      correction_type: corrForm.type,
      original_record: `Jornada del ${new Date().toLocaleDateString('es-AR')}`,
      requested_change: corrForm.type,
      reason: corrForm.reason || 'Error en registro biométrico',
    })
    if (error) { showToast('Error', error.message, 'error'); return }
    showToast('Corrección Enviada', 'Su solicitud fue derivada a supervisión.')
    setShowCorrModal(false)
    setCorrForm({ type: 'Olvidé registrar salida', reason: '' })
  }

  const todayEvents = events.filter(e => {
    const d = new Date(e.timestamp)
    const today = new Date()
    return d.toDateString() === today.toDateString()
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-emerald-400" /> Registro de Jornada & Fichadas
        </h1>
        <div className="flex space-x-2">
          <button onClick={() => setShowOTModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-all">
            <PlusCircle className="w-4 h-4 mr-1.5" /> Solicitar Hora Extra
          </button>
          <button onClick={() => setShowCorrModal(true)} className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center transition-all">
            <AlertCircle className="w-4 h-4 mr-1.5" /> Corregir Fichada
          </button>
        </div>
      </div>

      {/* Today's status */}
      <div className="bg-slate-800/90 border border-slate-700/60 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Fecha Actual</span>
          <span className="font-mono text-emerald-400">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Fichadas de Hoy</span>
          <span className="text-white font-bold">{todayEvents.length} movimientos</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Horario Planificado</span>
          <span className="text-slate-300">{profile?.schedule || '07:00 – 19:00'}</span>
        </div>
      </div>

      {/* Events list */}
      <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center">
          <Activity className="w-4 h-4 mr-2 text-emerald-400" /> Movimientos Biométricos
        </h3>
        {loading ? (
          <p className="text-slate-400 text-sm animate-pulse text-center py-8">Cargando eventos...</p>
        ) : events.length > 0 ? (
          <div className="space-y-2">
            {events.map(e => (
              <div key={e.id} className="bg-slate-900/60 border border-slate-700/50 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    e.type === 'INGRESO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {e.type === 'INGRESO' ? 'IN' : 'OUT'}
                  </div>
                  <div>
                    <strong className="block text-white">{new Date(e.timestamp).toLocaleString('es-AR')}</strong>
                    <span className="text-[10px] text-slate-400">{e.access_points?.name || 'Dispositivo desconocido'}</span>
                  </div>
                </div>
                <Badge status={e.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm text-center py-8">No hay eventos registrados</p>
        )}
      </div>

      {/* Overtime Modal */}
      <Modal isOpen={showOTModal} onClose={() => setShowOTModal(false)} title="Solicitar Horas Extraordinarias" icon={<PlusCircle className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Fecha de la Jornada</label>
            <input type="date" value={otForm.date} onChange={e => setOtForm({...otForm, date: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Horas Solicitadas</label>
              <input type="text" value={otForm.hours} onChange={e => setOtForm({...otForm, hours: e.target.value})} placeholder="2h 30m" className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Centro de Costo</label>
              <select value={otForm.cost_center} onChange={e => setOtForm({...otForm, cost_center: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
                <option value="CC-MANT-01">CC-MANT-01 (Mantenimiento)</option>
                <option value="CC-RIG-04">CC-RIG-04 (Perforación)</option>
                <option value="CC-INSTR-02">CC-INSTR-02 (Instrumentación)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Motivo / Trabajo Realizado</label>
            <textarea value={otForm.reason} onChange={e => setOtForm({...otForm, reason: e.target.value})} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" placeholder="Describa la tarea correctiva u operativa..." />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button onClick={() => setShowOTModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">Cancelar</button>
            <button onClick={submitOvertime} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow">Enviar Solicitud</button>
          </div>
        </div>
      </Modal>

      {/* Correction Modal */}
      <Modal isOpen={showCorrModal} onClose={() => setShowCorrModal(false)} title="Solicitud de Corrección de Fichada" icon={<AlertCircle className="w-5 h-5 text-amber-400" />}>
        <div className="space-y-3 text-xs">
          <p className="text-slate-400">El registro original biométrico NUNCA se elimina ni modifica directamente.</p>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Tipo de Inconsistencia</label>
            <select value={corrForm.type} onChange={e => setCorrForm({...corrForm, type: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
              <option>Olvidé registrar salida</option>
              <option>Olvidé registrar ingreso</option>
              <option>El lector biométrico no reconoció huella</option>
              <option>Horario incorrecto</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Comentario Justificativo</label>
            <textarea value={corrForm.reason} onChange={e => setCorrForm({...corrForm, reason: e.target.value})} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white" placeholder="Explique el motivo..." />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button onClick={() => setShowCorrModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">Cancelar</button>
            <button onClick={submitCorrection} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow">Enviar Corrección</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

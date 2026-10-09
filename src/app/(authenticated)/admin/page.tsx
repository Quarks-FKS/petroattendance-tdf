'use client'

import { useAuth } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/Toast'
import StatCard from '@/components/ui/StatCard'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { Settings, Fingerprint, Activity, Users, Wifi } from 'lucide-react'
import type { AccessPoint, Profile } from '@/lib/types'

export default function AdminPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const { showToast } = useToast()
  const [accessPoints, setAccessPoints] = useState<AccessPoint[]>([])
  const [employees, setEmployees] = useState<Profile[]>([])
  const [showBioModal, setShowBioModal] = useState(false)
  const [simForm, setSimForm] = useState({ device: '', employee: '', type: 'INGRESO' as 'INGRESO' | 'EGRESO' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    setLoading(true)
    const [apRes, empRes] = await Promise.all([
      supabase.from('access_points').select('*').order('code'),
      supabase.from('profiles').select('*').order('name'),
    ])
    if (apRes.data) setAccessPoints(apRes.data)
    if (empRes.data) setEmployees(empRes.data)
    setLoading(false)
  }

  const simulateBiometric = async () => {
    if (!simForm.device || !simForm.employee) { showToast('Error', 'Seleccione dispositivo y empleado.', 'error'); return }
    const emp = employees.find(e => e.id === simForm.employee)
    const ap = accessPoints.find(a => a.id === simForm.device)
    const code = `EV-${Math.floor(Math.random() * 9000 + 1000)}`
    const { error } = await supabase.from('biometric_events').insert({
      code,
      employee_id: simForm.employee,
      access_point_id: simForm.device,
      timestamp: new Date().toISOString(),
      type: simForm.type,
      original_timestamp: new Date().toISOString(),
      worksite: ap?.worksite,
      shift: 'Turno Día',
    })
    if (error) { showToast('Error', error.message, 'error'); return }
    await supabase.from('audit_logs').insert({
      code: `AUD-${Math.floor(Math.random() * 9000 + 1000)}`,
      user_id: profile!.id,
      user_name: profile!.name,
      role: profile!.role,
      action: 'SIMULACIÓN BIOMÉTRICA',
      detail: `${simForm.type} simulado para ${emp?.name} en ${ap?.name}`,
    })
    showToast('Fichada Registrada', `${simForm.type} exitoso para ${emp?.name} en ${ap?.name}`)
    setShowBioModal(false)
  }

  const onlineAPs = accessPoints.filter(a => a.status === 'ONLINE').length

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-white flex items-center"><Settings className="w-5 h-5 mr-2 text-rose-400" /> Panel de Administración General</h1>

      {loading ? <p className="text-slate-400 animate-pulse text-center py-8">Cargando...</p> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard label="Lectores Biométricos" value={`${onlineAPs}/${accessPoints.length}`} icon={<Fingerprint className="w-4 h-4" />} valueColor="text-emerald-400" />
            <StatCard label="Usuarios del Sistema" value={`${employees.length}`} icon={<Users className="w-4 h-4" />} />
            <StatCard label="Puntos de Acceso" value={`${accessPoints.length} dispositivos`} icon={<Wifi className="w-4 h-4" />} valueColor="text-blue-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
              <h3 className="text-sm font-bold text-white mb-2">Simulador Biométrico</h3>
              <p className="text-xs text-slate-400 mb-4">Simular fichadas en tiempo real.</p>
              <button onClick={() => setShowBioModal(true)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center"><Fingerprint className="w-4 h-4 mr-2" /> Simular Fichada</button>
            </div>
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
              <h3 className="text-sm font-bold text-white mb-2">Motor de Reglas</h3>
              <p className="text-xs text-slate-400 mb-4">Regímenes 14x14, 7x7 y convenios.</p>
              <button onClick={() => showToast('Motor', 'Parámetros actualizados.', 'info')} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-xs font-semibold">Configurar Reglas</button>
            </div>
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
              <h3 className="text-sm font-bold text-white mb-2">Audit Log</h3>
              <p className="text-xs text-slate-400 mb-4">Trazabilidad completa.</p>
              <button onClick={() => window.location.href = '/admin/auditoria'} className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center"><Activity className="w-4 h-4 mr-2" /> Ver Logs</button>
            </div>
          </div>

          {/* Access Points Table */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4">Dispositivos Biométricos</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-700">
                  <tr><th className="p-3">Código</th><th className="p-3">Nombre</th><th className="p-3">Ubicación</th><th className="p-3">Dispositivo</th><th className="p-3">IP</th><th className="p-3">Estado</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {accessPoints.map(ap => (
                    <tr key={ap.id}>
                      <td className="p-3 font-mono font-bold text-blue-400">{ap.code}</td>
                      <td className="p-3 text-white">{ap.name}</td>
                      <td className="p-3 text-slate-300">{ap.worksite}</td>
                      <td className="p-3 text-slate-300">{ap.device}</td>
                      <td className="p-3 font-mono text-slate-400">{ap.ip_address}</td>
                      <td className="p-3"><Badge status={ap.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Modal isOpen={showBioModal} onClose={() => setShowBioModal(false)} title="Simular Evento Biométrico" icon={<Fingerprint className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Punto de Acceso</label>
            <select value={simForm.device} onChange={e => setSimForm({...simForm, device: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
              <option value="">Seleccionar...</option>
              {accessPoints.map(ap => <option key={ap.id} value={ap.id}>{ap.name} ({ap.device})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Empleado</label>
            <select value={simForm.employee} onChange={e => setSimForm({...simForm, employee: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
              <option value="">Seleccionar...</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name} (Legajo {e.legajo})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Tipo</label>
            <select value={simForm.type} onChange={e => setSimForm({...simForm, type: e.target.value as 'INGRESO' | 'EGRESO'})} className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white">
              <option value="INGRESO">INGRESO</option>
              <option value="EGRESO">EGRESO</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button onClick={() => setShowBioModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold">Cancelar</button>
            <button onClick={simulateBiometric} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow">Registrar Fichada</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

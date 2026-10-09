'use client'

import { useAuth } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Badge from '@/components/ui/Badge'
import { Activity } from 'lucide-react'
import type { AuditLog } from '@/lib/types'

export default function AuditoriaPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadLogs()
  }, [profile])

  const loadLogs = async () => {
    setLoading(true)
    const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100)
    if (data) setLogs(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-bold text-white flex items-center"><Activity className="w-5 h-5 mr-2 text-rose-400" /> Audit Log de Seguridad</h1>

      {loading ? <p className="text-slate-400 animate-pulse text-center py-8">Cargando...</p> : (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-700">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Usuario</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Acción</th>
                <th className="p-3">Detalle</th>
                <th className="p-3">Fecha/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {logs.map(log => (
                <tr key={log.id}>
                  <td className="p-3 font-mono font-bold text-rose-400">{log.code}</td>
                  <td className="p-3 text-white">{log.user_name || '—'}</td>
                  <td className="p-3 text-slate-300">{log.role || '—'}</td>
                  <td className="p-3 text-slate-200 font-medium">{log.action}</td>
                  <td className="p-3 text-slate-400 max-w-xs truncate">{log.detail}</td>
                  <td className="p-3 font-mono text-slate-400">{new Date(log.created_at).toLocaleString('es-AR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No hay registros de auditoría</p>}
        </div>
      )}
    </div>
  )
}

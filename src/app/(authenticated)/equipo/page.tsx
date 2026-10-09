'use client'

import { useAuth } from '@/lib/hooks'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Badge from '@/components/ui/Badge'
import { Users } from 'lucide-react'
import type { Profile } from '@/lib/types'

export default function EquipoPage() {
  const { profile } = useAuth()
  const supabase = createClient()
  const [team, setTeam] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile) loadTeam()
  }, [profile])

  const loadTeam = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('supervisor_id', profile!.id)
      .order('name')
    if (data) setTeam(data)
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center"><Users className="w-5 h-5 mr-2 text-blue-400" /> Mi Equipo a Cargo</h1>
          <p className="text-xs text-slate-400">{profile?.worksite}</p>
        </div>
        <span className="bg-blue-500/20 text-blue-300 text-sm px-3 py-1.5 rounded-lg font-mono">{team.length} operarios</span>
      </div>

      {loading ? (
        <p className="text-slate-400 text-sm animate-pulse text-center py-8">Cargando equipo...</p>
      ) : (
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 font-semibold border-b border-slate-700">
                <tr>
                  <th className="p-3">Legajo & Empleado</th>
                  <th className="p-3">DNI</th>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">Sector</th>
                  <th className="p-3">Posición</th>
                  <th className="p-3">Régimen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {team.map(emp => (
                  <tr key={emp.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs">
                          {emp.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <strong className="text-white block">{emp.name}</strong>
                          <span className="text-[10px] text-slate-400">Legajo {emp.legajo}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-300">{emp.dni}</td>
                    <td className="p-3 text-slate-300">{emp.company}</td>
                    <td className="p-3 text-slate-300">{emp.sector}</td>
                    <td className="p-3 text-slate-300">{emp.position}</td>
                    <td className="p-3 text-slate-300">{emp.regime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {team.length === 0 && <p className="text-slate-400 text-sm text-center py-8">No hay personal asignado a su cargo</p>}
        </div>
      )}
    </div>
  )
}

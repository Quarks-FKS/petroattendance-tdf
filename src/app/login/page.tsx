'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ShieldCheck, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales inválidas. Verifique email y contraseña.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-56 sm:w-64 bg-white/95 rounded-3xl p-5 shadow-2xl shadow-emerald-950/60 border border-emerald-500/20 mb-4 flex items-center justify-center transition-all duration-300 hover:shadow-emerald-500/20 hover:scale-[1.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/peers-logo.png" 
              alt="PEERS Logo" 
              className="w-full h-auto max-h-36 object-contain" 
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Control de Asistencia y Jornadas</h1>
          <p className="text-xs text-slate-400 mt-1">Plataforma Operativa de Personal • Oil & Gas</p>
          <span className="text-[11px] px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-medium mt-2.5 inline-block">
            Yacimiento San Sebastián • Tierra del Fuego
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-6 shadow-2xl space-y-4">
          {error && (
            <div className="bg-rose-950/50 border border-rose-500/30 text-rose-300 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Corporativo</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@empresa.com.ar"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Ingresando...</>
            ) : (
              'Ingresar al Sistema'
            )}
          </button>

          <div className="text-center pt-2 border-t border-slate-700">
            <p className="text-xs text-slate-500">Acceso restringido • Operación Tierra del Fuego</p>
          </div>
        </form>
      </div>
    </div>
  )
}

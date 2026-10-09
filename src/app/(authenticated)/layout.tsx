'use client'

import { useState, ReactNode } from 'react'
import { useAuth } from '@/lib/hooks'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ToastProvider } from '@/components/ui/Toast'
import {
  ShieldCheck, Home, Clock, FileText, MessageSquare, Users,
  CheckSquare, Calendar, Briefcase, Settings, Activity, LogOut,
  Menu, X, ChevronRight, Fingerprint, Download
} from 'lucide-react'
import type { UserRole } from '@/lib/types'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  roles: UserRole[]
  badge?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" />, roles: ['EMPLOYEE', 'SUPERVISOR', 'HR', 'ADMIN'] },
  { label: 'Mi Jornada', href: '/jornada', icon: <Clock className="w-5 h-5" />, roles: ['EMPLOYEE'] },
  { label: 'Solicitudes', href: '/solicitudes', icon: <FileText className="w-5 h-5" />, roles: ['EMPLOYEE'] },
  { label: 'Mensajes RRHH', href: '/mensajes', icon: <MessageSquare className="w-5 h-5" />, roles: ['EMPLOYEE'] },
  { label: 'Mi Equipo', href: '/equipo', icon: <Users className="w-5 h-5" />, roles: ['SUPERVISOR'] },
  { label: 'Aprobaciones', href: '/aprobaciones', icon: <CheckSquare className="w-5 h-5" />, roles: ['SUPERVISOR'] },
  { label: 'Guardias', href: '/guardias', icon: <Calendar className="w-5 h-5" />, roles: ['SUPERVISOR', 'HR'] },
  { label: 'Panel RRHH', href: '/rrhh', icon: <Briefcase className="w-5 h-5" />, roles: ['HR'] },
  { label: 'Preliquidación', href: '/rrhh/preliquidacion', icon: <Download className="w-5 h-5" />, roles: ['HR'] },
  { label: 'Administración', href: '/admin', icon: <Settings className="w-5 h-5" />, roles: ['ADMIN'] },
  { label: 'Auditoría', href: '/admin/auditoria', icon: <Activity className="w-5 h-5" />, roles: ['ADMIN'] },
]

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold shadow-lg mb-4">
            <ShieldCheck className="w-6 h-6 mr-2" />
            <span className="tracking-wider">PETROATTENDANCE TDF</span>
          </div>
          <p className="text-slate-400 text-sm animate-pulse">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  const userRole = profile?.role || 'EMPLOYEE'
  const filteredNav = navItems.filter(item => item.roles.includes(userRole))

  const roleColors: Record<UserRole, string> = {
    EMPLOYEE: 'text-emerald-400',
    SUPERVISOR: 'text-blue-400',
    HR: 'text-purple-400',
    ADMIN: 'text-rose-400',
  }

  const roleLabels: Record<UserRole, string> = {
    EMPLOYEE: 'Empleado',
    SUPERVISOR: 'Supervisor',
    HR: 'Recursos Humanos',
    ADMIN: 'Administrador',
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-900 flex">
        {/* Sidebar overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800 flex flex-col transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          {/* Logo */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg shadow-emerald-900/30">
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                <span className="tracking-wider text-sm">PETROATTENDANCE</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[10px] text-amber-400/80 mt-2">Yacimiento San Sebastián • TDF</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
            {filteredNav.map(item => {
              const isActive = pathname === item.href
              return (
                <button
                  key={item.href}
                  onClick={() => { router.push(item.href); setSidebarOpen(false) }}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono">{item.badge}</span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                {profile?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || '??'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{profile?.name || 'Cargando...'}</p>
                <p className={`text-xs font-medium ${roleColors[userRole]}`}>{roleLabels[userRole]}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
          {/* Top bar */}
          <header className="bg-slate-950/60 border-b border-slate-800 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <p className="text-sm font-bold text-white">
                  {filteredNav.find(n => n.href === pathname)?.label || 'Dashboard'}
                </p>
                <p className="text-[10px] text-slate-400">Legajo: {profile?.legajo || '---'} • {profile?.worksite || 'Sin asignar'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-xs font-medium ${roleColors[userRole]} bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700`}>
                {roleLabels[userRole]}
              </span>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}

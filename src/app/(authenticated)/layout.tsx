'use client'

import { useState, ReactNode } from 'react'
import { useAuth } from '@/lib/hooks'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ToastProvider } from '@/components/ui/Toast'
import { RoleViewProvider, useRoleView } from '@/lib/role-context'
import {
  ShieldCheck, Home, Clock, FileText, MessageSquare, Users,
  CheckSquare, Calendar, Briefcase, Settings, Activity, LogOut,
  Menu, X, ChevronRight, Download, Sparkles
} from 'lucide-react'
import type { UserRole } from '@/lib/types'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
  roles: UserRole[]
  category?: string
  badge?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" />, roles: ['EMPLOYEE', 'SUPERVISOR', 'HR', 'ADMIN'], category: 'Principal' },
  { label: 'Mi Jornada', href: '/jornada', icon: <Clock className="w-5 h-5" />, roles: ['EMPLOYEE', 'ADMIN'], category: 'Operario' },
  { label: 'Solicitudes', href: '/solicitudes', icon: <FileText className="w-5 h-5" />, roles: ['EMPLOYEE', 'ADMIN'], category: 'Operario' },
  { label: 'Mensajes RRHH', href: '/mensajes', icon: <MessageSquare className="w-5 h-5" />, roles: ['EMPLOYEE', 'ADMIN'], category: 'Operario' },
  { label: 'Mi Equipo', href: '/equipo', icon: <Users className="w-5 h-5" />, roles: ['SUPERVISOR', 'ADMIN'], category: 'Supervisión' },
  { label: 'Aprobaciones', href: '/aprobaciones', icon: <CheckSquare className="w-5 h-5" />, roles: ['SUPERVISOR', 'ADMIN'], category: 'Supervisión' },
  { label: 'Guardias', href: '/guardias', icon: <Calendar className="w-5 h-5" />, roles: ['SUPERVISOR', 'HR', 'ADMIN'], category: 'Supervisión' },
  { label: 'Panel RRHH', href: '/rrhh', icon: <Briefcase className="w-5 h-5" />, roles: ['HR', 'ADMIN'], category: 'Recursos Humanos' },
  { label: 'Preliquidación', href: '/rrhh/preliquidacion', icon: <Download className="w-5 h-5" />, roles: ['HR', 'ADMIN'], category: 'Recursos Humanos' },
  { label: 'Administración', href: '/admin', icon: <Settings className="w-5 h-5" />, roles: ['ADMIN'], category: 'Sistema' },
  { label: 'Auditoría', href: '/admin/auditoria', icon: <Activity className="w-5 h-5" />, roles: ['ADMIN'], category: 'Sistema' },
]

function LayoutContent({ children }: { children: ReactNode }) {
  const { profile, loading } = useAuth()
  const { activeRole, setActiveRole, isMasterAdmin } = useRoleView()
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
        <div className="text-center flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-slate-700 bg-white p-1 mb-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/peers-logo.png" alt="PEERS" className="w-full h-full object-contain rounded-xl" />
          </div>
          <span className="tracking-wider text-lg font-bold text-white">PEERS</span>
          <p className="text-slate-400 text-xs animate-pulse mt-1">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  const userRole = profile?.role || 'EMPLOYEE'
  // If master admin, show all links. Otherwise filter by user role.
  const filteredNav = isMasterAdmin ? navItems : navItems.filter(item => item.roles.includes(userRole))

  const roleColors: Record<UserRole, string> = {
    EMPLOYEE: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    SUPERVISOR: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    HR: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    ADMIN: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
  }

  const roleLabels: Record<UserRole, string> = {
    EMPLOYEE: 'Empleado',
    SUPERVISOR: 'Supervisor',
    HR: 'Recursos Humanos',
    ADMIN: 'Administrador',
  }

  return (
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
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-1 border border-slate-700/60 shadow flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/peers-logo.png" alt="PEERS Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="tracking-wider text-base font-extrabold text-white leading-tight">PEERS</span>
                <span className="text-[10px] text-emerald-400 font-medium">Workforce TDF</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Yacimiento San Sebastián • TDF</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredNav.map((item, index) => {
            const isActive = pathname === item.href
            // Category header
            const prevItem = filteredNav[index - 1]
            const showCategory = isMasterAdmin && item.category && (!prevItem || prevItem.category !== item.category)

            return (
              <div key={item.href}>
                {showCategory && (
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 pt-3 pb-1">
                    {item.category}
                  </div>
                )}
                <button
                  onClick={() => { router.push(item.href); setSidebarOpen(false) }}
                  className={`w-full flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-all ${
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
              </div>
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
              <p className="text-xs font-medium text-emerald-400 truncate">{roleLabels[userRole]}</p>
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
        {/* Top bar with Role Switcher for Admin */}
        <header className="bg-slate-950/60 border-b border-slate-800 px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-sm font-bold text-white">
                {filteredNav.find(n => n.href === pathname)?.label || 'Dashboard'}
              </p>
              <p className="text-[10px] text-slate-400">Legajo: {profile?.legajo || '---'} • {profile?.worksite || 'San Sebastián'}</p>
            </div>
          </div>

          {/* Interactive Role Switcher for Master Admin */}
          <div className="flex items-center space-x-2">
            {isMasterAdmin ? (
              <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs">
                <span className="text-[11px] text-slate-400 mr-2 ml-1.5 flex items-center hidden sm:inline-flex">
                  <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" /> Vista:
                </span>
                <button
                  onClick={() => { setActiveRole('EMPLOYEE'); if (pathname === '/dashboard') router.refresh(); }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${activeRole === 'EMPLOYEE' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Empleado
                </button>
                <button
                  onClick={() => { setActiveRole('SUPERVISOR'); if (pathname === '/dashboard') router.refresh(); }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${activeRole === 'SUPERVISOR' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Supervisor
                </button>
                <button
                  onClick={() => { setActiveRole('HR'); if (pathname === '/dashboard') router.refresh(); }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${activeRole === 'HR' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  RRHH
                </button>
                <button
                  onClick={() => { setActiveRole('ADMIN'); if (pathname === '/dashboard') router.refresh(); }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${activeRole === 'ADMIN' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Admin
                </button>
              </div>
            ) : (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${roleColors[userRole]}`}>
                {roleLabels[userRole]}
              </span>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const userRole = profile?.role || 'EMPLOYEE'

  return (
    <ToastProvider>
      <RoleViewProvider userRole={userRole}>
        <LayoutContent>{children}</LayoutContent>
      </RoleViewProvider>
    </ToastProvider>
  )
}

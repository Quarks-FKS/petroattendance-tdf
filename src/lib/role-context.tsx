'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { UserRole } from '@/lib/types'

interface RoleViewContextType {
  activeRole: UserRole
  setActiveRole: (role: UserRole) => void
  isMasterAdmin: boolean
}

const RoleViewContext = createContext<RoleViewContextType>({
  activeRole: 'ADMIN',
  setActiveRole: () => {},
  isMasterAdmin: false,
})

export function useRoleView() {
  return useContext(RoleViewContext)
}

export function RoleViewProvider({ 
  userRole, 
  children 
}: { 
  userRole: UserRole
  children: ReactNode 
}) {
  const isMasterAdmin = userRole === 'ADMIN'
  const [activeRole, setActiveRoleState] = useState<UserRole>(userRole)

  useEffect(() => {
    const saved = localStorage.getItem('petro_active_role') as UserRole
    if (saved && isMasterAdmin && ['EMPLOYEE', 'SUPERVISOR', 'HR', 'ADMIN'].includes(saved)) {
      setActiveRoleState(saved)
    } else {
      setActiveRoleState(userRole)
    }
  }, [userRole, isMasterAdmin])

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role)
    if (isMasterAdmin) {
      localStorage.setItem('petro_active_role', role)
    }
  }

  return (
    <RoleViewContext.Provider value={{ activeRole, setActiveRole, isMasterAdmin }}>
      {children}
    </RoleViewContext.Provider>
  )
}

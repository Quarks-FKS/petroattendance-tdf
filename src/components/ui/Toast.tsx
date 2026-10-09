'use client'

import { useState, useCallback, createContext, useContext, ReactNode } from 'react'
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react'

interface Toast {
  id: number
  title: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  showToast: (title: string, message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, title, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const getStyles = (type: string) => {
    switch (type) {
      case 'success': return 'border-emerald-500/50 bg-emerald-950/90 text-emerald-200'
      case 'error': return 'border-rose-500/50 bg-rose-950/90 text-rose-200'
      default: return 'border-blue-500/50 bg-blue-950/90 text-blue-200'
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
      case 'error': return <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      default: return <Info className="w-5 h-5 shrink-0 mt-0.5" />
    }
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`border rounded-xl p-4 shadow-xl flex items-start space-x-3 backdrop-blur-md max-w-sm animate-in slide-in-from-right ${getStyles(toast.type)}`}>
            {getIcon(toast.type)}
            <div className="flex-1">
              <h4 className="text-sm font-bold">{toast.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{toast.message}</p>
            </div>
            <button onClick={() => removeToast(toast.id)} className="text-xs opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

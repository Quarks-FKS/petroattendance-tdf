import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PetroAttendance TDF - Control de Asistencia',
  description: 'Sistema Integral de Control de Asistencia y Jornadas - Operación Oil & Gas Tierra del Fuego',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-900 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  )
}

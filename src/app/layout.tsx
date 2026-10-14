import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PEERS - Control de Asistencia y Jornadas',
  description: 'PEERS - Plataforma Integral de Control de Asistencia, Jornadas y Recursos Humanos',
  icons: {
    icon: '/peers-logo.png',
  },
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

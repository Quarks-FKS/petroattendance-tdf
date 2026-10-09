interface BadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const statusStyles: Record<string, string> = {
  'EN JORNADA': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'FUERA': 'bg-slate-700 text-slate-400 border-slate-600',
  'PENDIENTE SUPERVISOR': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'PENDIENTE': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'APROBADA': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'RECHAZADA': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'VALIDADA': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'VALIDADO': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'PROGRAMADA': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'CONFIRMADA': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'EN CONSTRUCCIÓN': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'REQUIERE ATENCIÓN': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'ABIERTO': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'EN ANÁLISIS': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'RESUELTO': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'CERRADO': 'bg-slate-700 text-slate-400 border-slate-600',
  'ONLINE': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'OFFLINE': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'PROCESADO': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
}

export default function Badge({ status, size = 'sm' }: BadgeProps) {
  const style = statusStyles[status] || 'bg-slate-700 text-slate-400 border-slate-600'
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span className={`${sizeClasses} rounded-full font-medium border ${style}`}>
      {status}
    </span>
  )
}

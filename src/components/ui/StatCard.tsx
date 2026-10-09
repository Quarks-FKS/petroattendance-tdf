import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  valueColor?: string
}

export default function StatCard({ label, value, icon, valueColor = 'text-white' }: StatCardProps) {
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <div className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</div>
    </div>
  )
}

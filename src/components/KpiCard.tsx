'use client'

import { Coins, Users, Wrench, Package, ShoppingCart, FileText, TrendingUp, LucideIcon } from 'lucide-react'
import { toast } from 'sonner'

const iconMap: Record<string, LucideIcon> = {
  Coins,
  Users,
  Wrench,
  Package,
  ShoppingCart,
  FileText,
  TrendingUp,
}

interface KpiCardProps {
  title: string
  value: string
  delta: string
  iconName: keyof typeof iconMap
  color: 'blue' | 'green' | 'orange' | 'red'
  warn?: boolean
}

const colors = {
  blue: 'from-[#2a5298] to-[#00c2ff]',
  green: 'from-[#22c55e] to-[#4ade80]',
  orange: 'from-[#f59e0b] to-[#fbbf24]',
  red: 'from-[#ef4444] to-[#f87171]',
}

export default function KpiCard({
  title, value, delta, iconName, color, warn,
}: KpiCardProps) {
  const Icon = iconMap[iconName]

  return (
    <button
      onClick={() => toast.success(`📊 ${title} : ${value}`)}
      className="group bg-white rounded-2xl p-5 shadow-sm hover:shadow-xl hover:-translate-y-1.5 active:scale-[0.98] transition-all duration-300 text-left relative overflow-hidden"
    >
      <span className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1e3c72] to-[#00c2ff] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
          {title}
        </h3>
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-3xl font-extrabold text-[#1e3c72] mb-1">{value}</div>
      <div className={`text-xs font-semibold ${warn ? 'text-amber-500' : 'text-green-600'}`}>
        {delta}
      </div>
    </button>
  )
}
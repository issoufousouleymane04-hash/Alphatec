'use client'

import { Search, Bell } from 'lucide-react'
import { toast } from 'sonner'

interface HeaderProps {
  title: string
  subtitle?: string
  user?: {
    nom: string
    email: string
    role: string
  } | null
}

export default function Header({ title, subtitle, user }: HeaderProps) {
  const initiale = user?.nom?.charAt(0).toUpperCase() || 'A'

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 mb-7">
      <div>
        <h1 className="text-2xl font-bold text-[#1e3c72]">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="border-none outline-none text-sm w-40 bg-transparent"
          />
        </div>

        <button
          onClick={() => toast.info('🔔 3 nouvelles notifications')}
          className="relative w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-[#1e3c72] hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1e3c72] to-[#00c2ff] text-white flex items-center justify-center font-bold">
            {initiale}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-semibold text-[#1e3c72]">
              {user?.nom || 'Utilisateur'}
            </div>
            <div className="text-xs text-slate-500 capitalize">
              {user?.role || 'employe'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
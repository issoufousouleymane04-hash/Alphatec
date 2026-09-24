'use client'

import { Search, Bell } from 'lucide-react'
import { toast } from 'sonner'
import LanguageSwitcher from './LanguageSwitcher'
import ProfileMenu from './ProfileMenu'

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
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 mb-7">
      {/* Titre */}
      <div>
        <h1 className="text-2xl font-bold text-[#1e3c72]">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Recherche */}
        <div className="hidden md:flex items-center bg-white px-4 py-2.5 rounded-full shadow-sm">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="border-none outline-none text-sm w-40 bg-transparent text-[#1e3c72]"
          />
        </div>

        {/* Langue */}
        <LanguageSwitcher />

        {/* Notifications */}
        <button
          onClick={() => toast.info('🔔 3 nouvelles notifications')}
          className="relative w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-[#1e3c72] hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            3
          </span>
        </button>

        {/* Profil */}
        <ProfileMenu user={user || null} />
      </div>
    </header>
  )
}
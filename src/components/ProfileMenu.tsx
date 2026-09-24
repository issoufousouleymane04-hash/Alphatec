'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ROLES, Role } from '@/lib/roles'

interface Props {
  user: {
    nom: string
    email: string
    role: string
  } | null
}

export default function ProfileMenu({ user }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [open, setOpen] = useState(false)
  const initiale = user?.nom?.charAt(0).toUpperCase() || 'A'

  const roleConfig = user?.role ? ROLES[user.role as Role] : null
  const roleLabel = roleConfig?.label || user?.role || 'Utilisateur'

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Déconnecté')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full bg-white shadow-sm hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e3c72] to-[#00c2ff] text-white flex items-center justify-center font-bold text-sm relative">
          {initiale}
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div className="hidden sm:block text-left">
          <div className="text-xs font-bold text-[#1e3c72] leading-tight">
            {user?.nom?.split(' ')[0] || 'Utilisateur'}
          </div>
          <div className="text-[10px] text-slate-500 capitalize">
            {roleLabel}
          </div>
        </div>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-14 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 w-72 overflow-hidden animate-[fadeIn_0.15s_ease]">
            <div className="p-5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xl">
                  {initiale}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{user?.nom || 'Utilisateur'}</div>
                  <div className="text-xs text-white/70 truncate">
                    {user?.email || 'email@alpha-tec.com'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  roleConfig?.color || 'bg-white/20 text-white'
                }`}>
                  {roleLabel.toUpperCase()}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/30 text-green-100">
                  ● ACTIF
                </span>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
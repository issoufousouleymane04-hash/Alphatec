'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, ShoppingCart, Package,
  Wrench, FileText, Coins, UserCog, LogOut, Zap, X, Unlock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { hasAccess } from '@/lib/roles'

const ALL_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/ventes', label: 'Ventes', icon: ShoppingCart },
    { href: '/deblocage', label: 'Déblocage', icon: Unlock },
  { href: '/stock', label: 'Stock', icon: Package },
  { href: '/sav', label: 'SAV', icon: Wrench },
  { href: '/factures', label: 'Factures', icon: FileText },
  { href: '/caisse', label: 'Caisse', icon: Coins },
  { href: '/employes', label: 'Employés', icon: UserCog },
]

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [role, setRole] = useState<string>('employe')
  const [loading, setLoading] = useState(true)

  // Charge le rôle de l'utilisateur
  useEffect(() => {
    async function loadRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role) setRole(profile.role)
      setLoading(false)
    }

    loadRole()
  }, [supabase])

  // Filtre les liens selon le rôle
  const visibleLinks = ALL_LINKS.filter((l) => hasAccess(role, l.href))

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Déconnecté')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-[fadeIn_0.2s_ease]"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          w-64 h-screen
          bg-gradient-to-b from-[#1e3c72] to-[#2a5298] text-white
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between gap-2 px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#00c2ff]" />
            <span className="text-xl font-extrabold tracking-wide">Alpha-Tec</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-3 text-slate-400 text-xs">Chargement...</div>
          ) : (
            visibleLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    active
                      ? 'bg-white/15 text-white shadow-inner border-l-4 border-[#00c2ff]'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-1'
                  }`}
                >
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{label}</span>
                </Link>
              )
            })
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-6 py-4 border-t border-white/10 text-red-200 hover:bg-red-500/20 hover:text-white transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </aside>
    </>
  )
}
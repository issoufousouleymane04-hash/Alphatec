'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, ShoppingCart, Package,
  Wrench, FileText, Coins, UserCog, LogOut, X,
  Unlock, Smartphone,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { hasAccess } from '@/lib/roles'

const ALL_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/ventes', label: 'Ventes', icon: ShoppingCart },
  { href: '/services', label: 'Services', icon: Wrench },
  { href: '/telephones', label: 'Téléphones', icon: Smartphone },
  { href: '/articles', label: 'Articles', icon: Package },
  { href: '/deblocage', label: 'Déblocage', icon: Unlock },
  { href: '/reparation', label: 'Réparation', icon: Wrench },
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

  const visibleLinks = ALL_LINKS.filter((l) => hasAccess(role, l.href))

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Déconnecté')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-[fadeIn_0.2s_ease]"
        />
      )}

      {/* Sidebar */}
       <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50
          w-72 sm:w-64 min-h-screen h-screen lg:h-auto lg:min-h-screen
          bg-gradient-to-b from-[#0a0f1e] via-[#0f172a] to-[#1e293b]
          text-white
          flex flex-col
          transition-transform duration-300 ease-in-out
          border-r border-white/5
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {/* Logo + bouton fermer mobile */}
        <div className="flex items-center justify-between gap-2 px-6 py-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <img
              src="/logo/alpha-tec-icon.png"
              alt="Alpha-Tec"
              className="w-10 h-10 rounded-xl object-cover"
            />
            <span className="text-xl font-extrabold tracking-wide bg-gradient-to-r from-white to-[#00c2ff] bg-clip-text text-transparent">
              Alpha-Tec
            </span>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🎯 Navigation — prend TOUT l'espace disponible */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overscroll-contain">
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
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden ${
                    active
                      ? 'bg-gradient-to-r from-[#00c2ff]/15 to-[#2a5298]/10 text-white shadow-inner'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-[#00c2ff] to-[#2a5298]" />
                  )}

                  <Icon
                    className={`w-4 h-4 transition-all ${
                      active
                        ? 'text-[#00c2ff] scale-110'
                        : 'group-hover:scale-110 group-hover:text-[#00c2ff]'
                    }`}
                  />
                  <span className={active ? 'font-bold' : ''}>{label}</span>
                </Link>
              )
            })
          )}

          {/* Séparateur */}
          <div className="my-3 border-t border-white/5" />

          {/* Mon Profil */}
          <Link
            href="/profil"
            onClick={onClose}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group overflow-hidden ${
              pathname === '/profil'
                ? 'bg-gradient-to-r from-[#00c2ff]/15 to-[#2a5298]/10 text-white shadow-inner'
                : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
            }`}
          >
            {pathname === '/profil' && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-gradient-to-b from-[#00c2ff] to-[#2a5298]" />
            )}

            <UserCog
              className={`w-4 h-4 transition-all ${
                pathname === '/profil'
                  ? 'text-[#00c2ff] scale-110'
                  : 'group-hover:scale-110 group-hover:text-[#00c2ff]'
              }`}
            />
            <span className={pathname === '/profil' ? 'font-bold' : ''}>
              Mon Profil
            </span>
          </Link>
        </nav>

        {/* 🎯 Déconnexion — collée en bas, sans espace blanc */}
        <div className="shrink-0 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-6 py-4 text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
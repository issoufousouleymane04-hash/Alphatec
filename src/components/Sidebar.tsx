'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, ShoppingCart, Package,
  Wrench, FileText, Coins, UserCog, LogOut, Zap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/ventes', label: 'Ventes', icon: ShoppingCart },
  { href: '/stock', label: 'Stock', icon: Package },
  { href: '/sav', label: 'SAV', icon: Wrench },
  { href: '/factures', label: 'Factures', icon: FileText },
  { href: '/caisse', label: 'Caisse', icon: Coins },
  { href: '/employes', label: 'Employés', icon: UserCog },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Déconnecté')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-[#1e3c72] to-[#2a5298] text-white flex flex-col h-screen sticky top-0 shrink-0">
      <div className="flex items-center gap-2 px-6 py-6 border-b border-white/10">
        <Zap className="w-6 h-6 text-[#00c2ff]" />
        <span className="text-xl font-extrabold tracking-wide">Alpha-Tec</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
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
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-6 py-4 border-t border-white/10 text-red-200 hover:bg-red-500/20 hover:text-white transition-all"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-medium">Déconnexion</span>
      </button>
    </aside>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Bell, X, ShoppingCart, Wrench, FileText, Coins,
  Users, Package, CheckCheck, LogOut, User as UserIcon, Settings,
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ROLES, Role } from '@/lib/roles'

interface HeaderProps {
  title: string
  subtitle?: string
  user?: {
    nom: string
    email: string
    role: string
    avatar_url?: string | null
  } | null
}

interface Notification {
  id: string
  type: 'vente' | 'facture' | 'reparation' | 'caisse' | 'client' | 'stock'
  titre: string
  message: string
  date: string
  href: string
  unread: boolean
}

export default function Header({ title, subtitle, user }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  // Notifications
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Menu profil
  const [profileOpen, setProfileOpen] = useState(false)

  const initiale = user?.nom?.charAt(0).toUpperCase() || 'A'
  const roleConfig = user?.role ? ROLES[user.role as Role] : null
  const roleLabel = roleConfig?.label || user?.role || 'Utilisateur'

  // 🎯 Chargement des notifications
  async function loadNotifications() {
    setLoading(true)
    const list: Notification[] = []
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    try {
      const { data: ventes } = await supabase
        .from('ventes')
        .select('id, numero, total, created_at, clients(nom)')
        .gte('created_at', since)
        .order('created_at', { ascending: false })
        .limit(5)

      ventes?.forEach((v: any) => {
        list.push({
          id: `vente-${v.id}`,
          type: 'vente',
          titre: 'Nouvelle vente',
          message: `${v.clients?.nom || 'Comptoir'} — ${Number(v.total).toLocaleString('fr-FR')} F`,
          date: v.created_at,
          href: '/ventes',
          unread: true,
        })
      })
    } catch (e) {}

    try {
      const { data: factures } = await supabase
        .from('factures')
        .select('id, numero, montant, created_at, clients(nom)')
        .eq('statut', 'impayee')
        .order('created_at', { ascending: false })
        .limit(3)

      factures?.forEach((f: any) => {
        list.push({
          id: `facture-${f.id}`,
          type: 'facture',
          titre: 'Facture impayée',
          message: `${f.clients?.nom || 'Client'} — ${Number(f.montant).toLocaleString('fr-FR')} F`,
          date: f.created_at,
          href: '/factures',
          unread: true,
        })
      })
    } catch (e) {}

    try {
      const { data: reparations } = await supabase
        .from('reparations')
        .select('id, numero, panne, statut, created_at, clients(nom)')
        .in('statut', ['recu', 'en_cours'])
        .order('created_at', { ascending: false })
        .limit(3)

      reparations?.forEach((r: any) => {
        list.push({
          id: `reparation-${r.id}`,
          type: 'reparation',
          titre: 'Réparation en cours',
          message: `${r.clients?.nom || 'Client'} — ${r.panne?.slice(0, 40) || 'Panne'}`,
          date: r.created_at,
          href: '/reparation',
          unread: true,
        })
      })
    } catch (e) {}
    

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setNotifications(list)
    setUnreadCount(list.filter((n) => n.unread).length)
    setLoading(false)
  }

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openNotifications() {
    setNotifOpen(true)
    loadNotifications()
    setProfileOpen(false)
  }

  function openProfile() {
    setProfileOpen(!profileOpen)
    setNotifOpen(false)
  }

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    setUnreadCount(0)
  }

  function formatDate(date: string) {
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Déconnecté')
    router.push('/login')
    router.refresh()
  }

  const iconMap: Record<string, any> = {
    vente: ShoppingCart,
    facture: FileText,
    reparation: Wrench,
    caisse: Coins,
    client: Users,
    stock: Package,
  }

  const colorMap: Record<string, string> = {
    vente: 'from-green-500 to-emerald-600',
    facture: 'from-red-500 to-pink-600',
    reparation: 'from-amber-500 to-orange-600',
    caisse: 'from-blue-500 to-cyan-600',
    client: 'from-purple-500 to-fuchsia-600',
    stock: 'from-slate-500 to-slate-700',
  }

  return (
    <>
      <header className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-4 mb-6 sm:mb-7">
        {/* Titre */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1e3c72] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Recherche */}
          <div className="hidden md:flex items-center bg-white px-4 py-2.5 rounded-full shadow-sm">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="border-none outline-none text-sm w-40 bg-transparent text-[#1e3c72]"
            />
          </div>

          {/* Thème */}
          <ThemeToggle />

          {/* 🔔 Notifications */}
          <button
            onClick={openNotifications}
            className="relative w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-[#1e3c72] hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all shrink-0"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* 🎯 AVATAR PROFIL (à côté de la cloche) */}
          <div className="relative">
            <button
              onClick={openProfile}
              className="relative w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all shrink-0 overflow-hidden"
              aria-label="Mon profil"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.nom}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1e3c72] to-[#00c2ff] text-white flex items-center justify-center font-bold text-sm">
                  {initiale}
                </div>
              )}
              {/* Point vert */}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </button>

            {/* Menu déroulant du profil */}
            {profileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setProfileOpen(false)}
                />

                <div className="absolute right-0 top-14 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 w-72 overflow-hidden animate-[fadeIn_0.15s_ease]">
                  {/* En-tête profil */}
                  <div className="p-5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white">
                    <div className="flex items-center gap-3">
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.nom}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white/30"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center font-bold text-xl">
                          {initiale}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold truncate">
                          {user?.nom || 'Utilisateur'}
                        </div>
                        <div className="text-xs text-white/70 truncate">
                          {user?.email || 'email@alpha-tec.com'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          roleConfig?.color || 'bg-white/20 text-white'
                        }`}
                      >
                        {roleLabel.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/30 text-green-100">
                        ● ACTIF
                      </span>
                    </div>
                  </div>

                  {/* Liens */}
                  <div className="p-2">
                    <Link
                      href="/profil"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-[#2a5298]" />
                      Mon profil
                    </Link>

                    <Link
                      href="/profil"
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-purple-500" />
                      Sécurité
                    </Link>

                    <div className="my-1 border-t border-slate-100" />

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
        </div>
      </header>

      {/* 🔔 PANNEAU NOTIFICATIONS */}
      {notifOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setNotifOpen(false)}
          />

          <div className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white shadow-2xl z-[60] flex flex-col animate-[slideInRight_0.3s_ease]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-gradient-to-r from-[#1e3c72] to-[#2a5298] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-base">Notifications</div>
                  <div className="text-xs text-white/70">
                    {unreadCount > 0
                      ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
                      : 'Tout est lu'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setNotifOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                En temps réel
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#2a5298] hover:underline"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tout marquer lu
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-6 h-6 border-2 border-[#2a5298] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="font-bold text-slate-700 mb-1">
                    Aucune notification
                  </div>
                  <div className="text-xs text-slate-400">
                    Vous êtes à jour !
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {notifications.map((n) => {
                    const Icon = iconMap[n.type]
                    return (
                      <li key={n.id}>
                        <Link
                          href={n.href}
                          onClick={() => setNotifOpen(false)}
                          className={`flex items-start gap-3 p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors ${
                            n.unread ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorMap[n.type]} text-white flex items-center justify-center shrink-0`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-sm text-slate-800">
                                {n.titre}
                              </div>
                              {n.unread && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                              {n.message}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {formatDate(n.date)}
                            </div>
                          </div>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={loadNotifications}
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all disabled:opacity-60"
                >
                  {loading ? 'Actualisation...' : 'Actualiser'}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}
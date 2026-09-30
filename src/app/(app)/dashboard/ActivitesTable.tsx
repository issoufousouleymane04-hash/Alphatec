'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowRight, FileText, ShoppingCart, Wrench, Wallet } from 'lucide-react'

interface Activite {
  id: number
  type: 'vente' | 'facture' | 'reparation' | 'caisse'
  titre: string
  sous_titre: string
  montant: number | null
  statut: 'ok' | 'wait' | 'danger'
  statut_label: string
  date: string
  href: string
}

const badge: Record<string, string> = {
  ok: 'bg-green-100 text-green-700',
  wait: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
}

const typeIcon: Record<string, any> = {
  vente: ShoppingCart,
  facture: FileText,
  reparation: Wrench,
  caisse: Wallet,
}

export default function ActivitesTable() {
  const supabase = createClient()
  const [activites, setActivites] = useState<Activite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadActivites() {
      const activitesList: Activite[] = []

      // 1. Dernières ventes
      const { data: ventes } = await supabase
        .from('ventes')
        .select('id, numero, total, statut, created_at, clients(nom)')
        .order('created_at', { ascending: false })
        .limit(3)

      ventes?.forEach((v: any) => {
        activitesList.push({
          id: v.id,
          type: 'vente',
          titre: v.clients?.nom || 'Comptoir',
          sous_titre: `Vente ${v.numero}`,
          montant: Number(v.total),
          statut: v.statut === 'payee' ? 'ok' : v.statut === 'en_cours' ? 'wait' : 'danger',
          statut_label: v.statut === 'payee' ? 'Payée' : v.statut === 'en_cours' ? 'En cours' : 'Annulée',
          date: v.created_at,
          href: '/ventes',
        })
      })

      // 2. Dernières factures
      const { data: factures } = await supabase
        .from('factures')
        .select('id, numero, montant, statut, created_at, clients(nom)')
        .order('created_at', { ascending: false })
        .limit(2)

      factures?.forEach((f: any) => {
        activitesList.push({
          id: f.id,
          type: 'facture',
          titre: f.clients?.nom || 'Client',
          sous_titre: `Facture ${f.numero}`,
          montant: Number(f.montant),
          statut: f.statut === 'payee' ? 'ok' : 'wait',
          statut_label: f.statut === 'payee' ? 'Payée' : 'Impayée',
          date: f.created_at,
          href: '/factures',
        })
      })

      // 3. Dernières réparations
      const { data: reparations } = await supabase
        .from('reparations')
        .select('id, numero, panne, statut, created_at, clients(nom)')
        .order('created_at', { ascending: false })
        .limit(2)

      reparations?.forEach((r: any) => {
        activitesList.push({
          id: r.id,
          type: 'reparation',
          titre: r.clients?.nom || 'Client',
          sous_titre: r.panne?.slice(0, 30) || `Réparation ${r.numero}`,
          montant: null,
          statut:
            r.statut === 'termine' || r.statut === 'livre'
              ? 'ok'
              : r.statut === 'annule'
              ? 'danger'
              : 'wait',
          statut_label:
            r.statut === 'recu'
              ? 'Reçu'
              : r.statut === 'en_cours'
              ? 'En cours'
              : r.statut === 'termine'
              ? 'Terminé'
              : r.statut === 'livre'
              ? 'Livré'
              : 'Annulé',
          date: r.created_at,
          href: '/reparation',
        })
      })

      // 4. Dernières transactions caisse
      const { data: caisse } = await supabase
        .from('caisse')
        .select('id, motif, montant, type, created_at')
        .order('created_at', { ascending: false })
        .limit(2)

      caisse?.forEach((c: any) => {
        activitesList.push({
          id: c.id,
          type: 'caisse',
          titre: c.motif?.slice(0, 30) || 'Transaction',
          sous_titre: c.type === 'recette' ? '↑ Recette' : '↓ Dépense',
          montant: Number(c.montant),
          statut: c.type === 'recette' ? 'ok' : 'danger',
          statut_label: c.type === 'recette' ? 'Recette' : 'Dépense',
          date: c.created_at,
          href: '/caisse',
        })
      })

      // Trie par date décroissante
      activitesList.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )

      setActivites(activitesList.slice(0, 6))
      setLoading(false)
    }

    loadActivites()
  }, [supabase])

  function formatDate(date: string) {
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

    if (diff < 60) return 'À l\'instant'
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold text-[#1e3c72]">Dernières activités</h2>
          <p className="text-xs text-slate-500 mt-0.5">En temps réel</p>
        </div>
        <Link
          href="/dashboard"
          className="text-xs font-bold text-[#2a5298] hover:underline flex items-center gap-1"
        >
          Voir tout
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-[#2a5298] animate-spin" />
          </div>
        ) : activites.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            Aucune activité récente
          </div>
        ) : (
          <ul className="space-y-2">
            {activites.map((a) => {
              const Icon = typeIcon[a.type]
              return (
                <Link
                  key={`${a.type}-${a.id}`}
                  href={a.href}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover:translate-x-1 active:scale-[0.98] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-800 truncate">
                        {a.titre}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {a.sous_titre}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    {a.montant !== null && (
                      <div className="text-sm font-bold text-[#1e3c72]">
                        {a.montant.toLocaleString('fr-FR')} F
                      </div>
                    )}
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badge[a.statut]}`}>
                        {a.statut_label}
                      </span>
                    </div>
                    <div className="text-[9px] text-slate-400 mt-0.5">
                      {formatDate(a.date)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
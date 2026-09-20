'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2, Wrench,
  AlertTriangle, CheckCircle2, Clock, XCircle, Truck,
  User as UserIcon, Package,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

type Statut = 'recu' | 'en_cours' | 'termine' | 'livre' | 'annule'
type Priorite = 'basse' | 'normale' | 'haute' | 'urgente'

interface Ticket {
  id: number
  numero: string
  client_id: number | null
  produit_id: number | null
  appareil: string | null
  panne: string
  diagnostic: string | null
  statut: Statut
  priorite: Priorite
  technicien_id: string | null
  cout_estime: number
  cout_final: number
  date_reception: string
  date_livraison: string | null
  clients?: { nom: string } | null
  produits?: { nom: string } | null
  profiles?: { nom: string } | null
}

interface Client { id: number; nom: string }
interface Produit { id: number; nom: string; reference: string }
interface Technicien { id: string; nom: string; role: string }

interface Props {
  initialTickets: Ticket[]
  clients: Client[]
  produits: Produit[]
  techniciens: Technicien[]
}

const emptyForm = {
  client_id: '',
  produit_id: '',
  appareil: '',
  panne: '',
  diagnostic: '',
  statut: 'recu' as Statut,
  priorite: 'normale' as Priorite,
  technicien_id: '',
  cout_estime: '0',
  cout_final: '0',
}

export default function SavTable({ initialTickets, clients, produits, techniciens }: Props) {
  const supabase = createClient()
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState<'all' | Statut>('all')
  const [filterPriorite, setFilterPriorite] = useState<'all' | Priorite>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Ticket | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Ticket | null>(null)

  const filtered = tickets.filter((t) => {
    const matchSearch =
      t.numero.toLowerCase().includes(search.toLowerCase()) ||
      t.panne.toLowerCase().includes(search.toLowerCase()) ||
      (t.clients?.nom.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (t.appareil?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatut = filterStatut === 'all' || t.statut === filterStatut
    const matchPriorite = filterPriorite === 'all' || t.priorite === filterPriorite
    return matchSearch && matchStatut && matchPriorite
  })

  // KPIs
  const enCours = tickets.filter((t) => t.statut === 'en_cours' || t.statut === 'recu').length
  const urgentes = tickets.filter((t) => t.priorite === 'urgente' && t.statut !== 'livre' && t.statut !== 'annule').length
  const termines = tickets.filter((t) => t.statut === 'termine' || t.statut === 'livre').length

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(t: Ticket) {
    setEditing(t)
    setForm({
      client_id: t.client_id?.toString() || '',
      produit_id: t.produit_id?.toString() || '',
      appareil: t.appareil || '',
      panne: t.panne,
      diagnostic: t.diagnostic || '',
      statut: t.statut,
      priorite: t.priorite,
      technicien_id: t.technicien_id || '',
      cout_estime: t.cout_estime.toString(),
      cout_final: t.cout_final.toString(),
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      client_id: form.client_id ? parseInt(form.client_id) : null,
      produit_id: form.produit_id ? parseInt(form.produit_id) : null,
      appareil: form.appareil || null,
      panne: form.panne,
      diagnostic: form.diagnostic || null,
      statut: form.statut,
      priorite: form.priorite,
      technicien_id: form.technicien_id || null,
      cout_estime: parseFloat(form.cout_estime) || 0,
      cout_final: parseFloat(form.cout_final) || 0,
    }

    if (editing) {
      const { data, error } = await supabase
        .from('tickets_sav')
        .update(payload)
        .eq('id', editing.id)
        .select('*, clients(nom), produits(nom), profiles!tickets_sav_technicien_id_fkey(nom)')
        .single()

      setSaving(false)

      if (error) {
        toast.error('Erreur : ' + error.message)
        return
      }

      setTickets((prev) => prev.map((t) => (t.id === editing.id ? data : t)))
      toast.success('✅ Ticket modifié')
      setModalOpen(false)
    } else {
      const numero = `SAV-${Date.now().toString().slice(-6)}`
      const { data, error } = await supabase
        .from('tickets_sav')
        .insert({ ...payload, numero })
        .select('*, clients(nom), produits(nom), profiles!tickets_sav_technicien_id_fkey(nom)')
        .single()

      setSaving(false)

      if (error) {
        toast.error('Erreur : ' + error.message)
        return
      }

      setTickets((prev) => [data, ...prev])
      toast.success('✅ Ticket créé')
      setModalOpen(false)
    }
  }

  async function updateStatut(ticket: Ticket, statut: Statut) {
    const payload: any = { statut }
    if (statut === 'livre') payload.date_livraison = new Date().toISOString()

    const { data, error } = await supabase
      .from('tickets_sav')
      .update(payload)
      .eq('id', ticket.id)
      .select('*, clients(nom), produits(nom), profiles!tickets_sav_technicien_id_fkey(nom)')
      .single()

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? data : t)))
    toast.success(`Statut → ${statut.replace('_', ' ')}`)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('tickets_sav').delete().eq('id', deleteTarget.id)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setTickets((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    toast.success('🗑️ Ticket supprimé')
    setDeleteTarget(null)
  }

  function statutBadge(s: Statut) {
    const map = {
      recu: { label: 'Reçu', icon: Clock, color: 'bg-slate-100 text-slate-700' },
      en_cours: { label: 'En cours', icon: Wrench, color: 'bg-blue-100 text-blue-700' },
      termine: { label: 'Terminé', icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
      livre: { label: 'Livré', icon: Truck, color: 'bg-emerald-100 text-emerald-700' },
      annule: { label: 'Annulé', icon: XCircle, color: 'bg-red-100 text-red-700' },
    }
    const { label, icon: Icon, color } = map[s]
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${color}`}>
        <Icon className="w-3 h-3" /> {label}
      </span>
    )
  }

  function prioriteBadge(p: Priorite) {
    const map = {
      basse: { label: 'Basse', color: 'bg-slate-100 text-slate-600' },
      normale: { label: 'Normale', color: 'bg-blue-100 text-blue-700' },
      haute: { label: 'Haute', color: 'bg-amber-100 text-amber-700' },
      urgente: { label: 'Urgente', color: 'bg-red-100 text-red-700 animate-pulse' },
    }
    const { label, color } = map[p]
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${color}`}>
        {p === 'urgente' && <AlertTriangle className="w-3 h-3" />}
        {label}
      </span>
    )
  }

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Total tickets</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">{tickets.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">En cours</div>
          <div className="text-2xl font-extrabold text-blue-600">{enCours}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Urgentes</div>
          <div className="text-2xl font-extrabold text-red-500">{urgentes}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Terminés</div>
          <div className="text-2xl font-extrabold text-green-600">{termines}</div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] flex items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-[#2a5298] focus-within:ring-4 focus-within:ring-[#2a5298]/10 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un ticket..."
            className="border-none outline-none text-sm w-full bg-transparent"
          />
        </div>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-[#2a5298] bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="recu">Reçus</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminés</option>
          <option value="livre">Livrés</option>
          <option value="annule">Annulés</option>
        </select>

        <select
          value={filterPriorite}
          onChange={(e) => setFilterPriorite(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-[#2a5298] bg-white"
        >
          <option value="all">Toutes priorités</option>
          <option value="urgente">Urgentes</option>
          <option value="haute">Hautes</option>
          <option value="normale">Normales</option>
          <option value="basse">Basses</option>
        </select>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau ticket
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">N°</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Appareil</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Panne</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Technicien</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priorité</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    {tickets.length === 0
                      ? 'Aucun ticket pour l\'instant.'
                      : 'Aucun résultat pour cette recherche.'}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#1e3c72]">
                      {t.numero}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {t.clients?.nom || <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-slate-700 font-medium text-sm">
                        {t.appareil || '—'}
                      </div>
                      {t.produits?.nom && (
                        <div className="text-xs text-slate-400">{t.produits.nom}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm max-w-xs">
                      <div className="line-clamp-2">{t.panne}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {t.profiles?.nom || (
                        <span className="text-slate-300 italic">Non assigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{prioriteBadge(t.priorite)}</td>
                    <td className="px-6 py-4">{statutBadge(t.statut)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {t.statut === 'recu' && (
                          <button
                            onClick={() => updateStatut(t, 'en_cours')}
                            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-blue-500 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                            title="Passer en cours"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        )}
                        {t.statut === 'en_cours' && (
                          <button
                            onClick={() => updateStatut(t, 'termine')}
                            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-green-500 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                            title="Marquer terminé"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {t.statut === 'termine' && (
                          <button
                            onClick={() => updateStatut(t, 'livre')}
                            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-emerald-500 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                            title="Marquer livré"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(t)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-[slideUp_0.3s_ease] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#1e3c72]">
                {editing ? 'Modifier le ticket' : 'Nouveau ticket SAV'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <UserIcon className="w-4 h-4 inline mr-1" />
                    Client
                  </label>
                  <select
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] bg-white transition-all"
                  >
                    <option value="">— Aucun —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    <Package className="w-4 h-4 inline mr-1" />
                    Produit (optionnel)
                  </label>
                  <select
                    value={form.produit_id}
                    onChange={(e) => setForm({ ...form, produit_id: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] bg-white transition-all"
                  >
                    <option value="">— Aucun —</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nom} ({p.reference})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Appareil / Description
                </label>
                <input
                  type="text"
                  value={form.appareil}
                  onChange={(e) => setForm({ ...form, appareil: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] transition-all"
                  placeholder="Ex : PC Portable Dell XPS 15"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Panne signalée *
                </label>
                <textarea
                  value={form.panne}
                  onChange={(e) => setForm({ ...form, panne: e.target.value })}
                  required
                  rows={2}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] transition-all resize-none"
                  placeholder="Décrivez le problème..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Diagnostic (interne)
                </label>
                <textarea
                  value={form.diagnostic}
                  onChange={(e) => setForm({ ...form, diagnostic: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] transition-all resize-none"
                  placeholder="Diagnostic technique..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Priorité
                  </label>
                  <select
                    value={form.priorite}
                    onChange={(e) => setForm({ ...form, priorite: e.target.value as Priorite })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] bg-white transition-all"
                  >
                    <option value="basse">Basse</option>
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Statut
                  </label>
                  <select
                    value={form.statut}
                    onChange={(e) => setForm({ ...form, statut: e.target.value as Statut })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] bg-white transition-all"
                  >
                    <option value="recu">Reçu</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="livre">Livré</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Technicien
                  </label>
                  <select
                    value={form.technicien_id}
                    onChange={(e) => setForm({ ...form, technicien_id: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] bg-white transition-all"
                  >
                    <option value="">— Non assigné —</option>
                    {techniciens.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nom} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Coût estimé (F)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cout_estime}
                    onChange={(e) => setForm({ ...form, cout_estime: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Coût final (F)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.cout_final}
                    onChange={(e) => setForm({ ...form, cout_final: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 active:scale-95 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer ce ticket ?"
        message={`Êtes-vous sûr de vouloir supprimer le ticket "${deleteTarget?.numero}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
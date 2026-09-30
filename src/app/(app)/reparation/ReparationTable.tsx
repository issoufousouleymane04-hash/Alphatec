'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2, Wrench, Clock,
  CheckCircle2, AlertTriangle, Truck, XCircle, Inbox,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Reparation {
  id: number
  numero: string
  client_id: number | null
  produit_id: number | null
  appareil: string | null
  panne: string
  diagnostic: string | null
  statut: 'recu' | 'en_cours' | 'termine' | 'livre' | 'annule'
  priorite: 'basse' | 'normale' | 'haute' | 'urgente'
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
interface Produit { id: number; nom: string }
interface Technicien { id: string; nom: string }

interface Props {
  initialReparations: Reparation[]
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
  statut: 'recu' as Reparation['statut'],
  priorite: 'normale' as Reparation['priorite'],
  technicien_id: '',
  cout_estime: '0',
  cout_final: '0',
}

export default function ReparationTable({
  initialReparations,
  clients,
  produits,
  techniciens,
}: Props) {
  const supabase = createClient()
  const [items, setItems] = useState<Reparation[]>(initialReparations)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState<string>('all')
  const [filterPriorite, setFilterPriorite] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Reparation | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Reparation | null>(null)

  const filtered = items.filter((t) => {
    const matchSearch =
      t.numero.toLowerCase().includes(search.toLowerCase()) ||
      t.panne.toLowerCase().includes(search.toLowerCase()) ||
      (t.appareil?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (t.clients?.nom.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatut = filterStatut === 'all' || t.statut === filterStatut
    const matchPriorite = filterPriorite === 'all' || t.priorite === filterPriorite
    return matchSearch && matchStatut && matchPriorite
  })

  const total = items.length
  const enCours = items.filter((t) => t.statut === 'en_cours' || t.statut === 'recu').length
  const urgents = items.filter(
    (t) => t.priorite === 'urgente' && t.statut !== 'livre' && t.statut !== 'annule'
  ).length
  const termines = items.filter((t) => t.statut === 'termine' || t.statut === 'livre').length

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(t: Reparation) {
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
        .from('reparations')
        .update(payload)
        .eq('id', editing.id)
        .select('*, clients(nom), produits(nom), profiles!technicien_id(nom)')
        .single()

      setSaving(false)
      if (error) { toast.error('Erreur : ' + error.message); return }

      setItems((prev) => prev.map((t) => (t.id === editing.id ? data : t)))
      toast.success('✅ Réparation modifiée')
      setModalOpen(false)
    } else {
      const numero = `REP-${Date.now().toString().slice(-6)}`
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('reparations')
        .insert({ ...payload, numero, created_by: user?.id })
        .select('*, clients(nom), produits(nom), profiles!technicien_id(nom)')
        .single()

      setSaving(false)
      if (error) { toast.error('Erreur : ' + error.message); return }

      setItems((prev) => [data, ...prev])
      toast.success(`✅ Réparation ${numero} créée`)
      setModalOpen(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('reparations').delete().eq('id', deleteTarget.id)
    if (error) { toast.error('Erreur : ' + error.message); return }
    setItems((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    toast.success('🗑️ Réparation supprimée')
    setDeleteTarget(null)
  }

  function prioriteBadge(p: string) {
    const conf: Record<string, { color: string; label: string; icon: any }> = {
      basse: { color: 'bg-slate-100 text-slate-600', label: 'Basse', icon: Inbox },
      normale: { color: 'bg-blue-100 text-blue-700', label: 'Normale', icon: Inbox },
      haute: { color: 'bg-amber-100 text-amber-700', label: 'Haute', icon: AlertTriangle },
      urgente: { color: 'bg-red-100 text-red-700', label: 'Urgente', icon: AlertTriangle },
    }
    const c = conf[p] || conf.normale
    const Icon = c.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${c.color}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    )
  }

  function statutBadge(s: string) {
    const conf: Record<string, { color: string; label: string; icon: any }> = {
      recu: { color: 'bg-blue-100 text-blue-700', label: 'Reçu', icon: Inbox },
      en_cours: { color: 'bg-amber-100 text-amber-700', label: 'En cours', icon: Clock },
      termine: { color: 'bg-green-100 text-green-700', label: 'Terminé', icon: CheckCircle2 },
      livre: { color: 'bg-slate-100 text-slate-600', label: 'Livré', icon: Truck },
      annule: { color: 'bg-red-100 text-red-700', label: 'Annulé', icon: XCircle },
    }
    const c = conf[s] || conf.recu
    const Icon = c.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${c.color}`}>
        <Icon className="w-3 h-3" />
        {c.label}
      </span>
    )
  }

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Total</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">{total}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">En cours</div>
          <div className="text-2xl font-extrabold text-amber-500">{enCours}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Urgentes</div>
          <div className="text-2xl font-extrabold text-red-500">{urgents}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Terminées</div>
          <div className="text-2xl font-extrabold text-green-600">{termines}</div>
        </div>
      </div>

      {/* Barre d'actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] flex items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-[#2a5298]">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une réparation..."
            className="border-none outline-none text-sm w-full bg-transparent"
          />
        </div>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="recu">Reçu</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
          <option value="livre">Livré</option>
          <option value="annule">Annulé</option>
        </select>

        <select
          value={filterPriorite}
          onChange={(e) => setFilterPriorite(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
        >
          <option value="all">Toutes priorités</option>
          <option value="urgente">Urgente</option>
          <option value="haute">Haute</option>
          <option value="normale">Normale</option>
          <option value="basse">Basse</option>
        </select>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvelle réparation
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">N°</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Client</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Appareil / Panne</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Technicien</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Priorité</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Statut</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Coût</th>
                <th className="text-right px-4 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    {items.length === 0 ? 'Aucune réparation pour l\'instant.' : 'Aucun résultat.'}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 group">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-[#1e3c72]">
                      {t.numero}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">
                      {t.clients?.nom || <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-700 font-medium text-xs">
                        {t.appareil || t.produits?.nom || '—'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">
                        {t.panne}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {t.profiles?.nom || <span className="text-slate-400 italic">Non assigné</span>}
                    </td>
                    <td className="px-4 py-3">{prioriteBadge(t.priorite)}</td>
                    <td className="px-4 py-3">{statutBadge(t.statut)}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-slate-500">
                        Est. : {Number(t.cout_estime).toLocaleString('fr-FR')} F
                      </div>
                      {Number(t.cout_final) > 0 && (
                        <div className="font-bold text-[#1e3c72]">
                          Final : {Number(t.cout_final).toLocaleString('fr-FR')} F
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(t)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white text-slate-600 flex items-center justify-center"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 flex items-center justify-center"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#1e3c72]">
                  {editing ? `Modifier ${editing.numero}` : 'Nouvelle réparation'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Client
                  </label>
                  <select
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-[#2a5298]"
                  >
                    <option value="">— Aucun —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Produit lié
                  </label>
                  <select
                    value={form.produit_id}
                    onChange={(e) => setForm({ ...form, produit_id: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-[#2a5298]"
                  >
                    <option value="">— Aucun —</option>
                    {produits.map((p) => (
                      <option key={p.id} value={p.id}>{p.nom}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Appareil (si pas de produit)
                </label>
                <input
                  type="text"
                  value={form.appareil}
                  onChange={(e) => setForm({ ...form, appareil: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                  placeholder="Ex : MacBook Pro 2019"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Panne déclarée *
                </label>
                <textarea
                  required
                  value={form.panne}
                  onChange={(e) => setForm({ ...form, panne: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] resize-none"
                  placeholder="Description du problème..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Diagnostic technique
                </label>
                <textarea
                  value={form.diagnostic}
                  onChange={(e) => setForm({ ...form, diagnostic: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] resize-none"
                  placeholder="Diagnostic du technicien..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Priorité
                  </label>
                  <select
                    value={form.priorite}
                    onChange={(e) => setForm({ ...form, priorite: e.target.value as any })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-[#2a5298]"
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
                    onChange={(e) => setForm({ ...form, statut: e.target.value as any })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-[#2a5298]"
                  >
                    <option value="recu">Reçu</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                    <option value="livre">Livré</option>
                    <option value="annule">Annulé</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Technicien assigné
                </label>
                <select
                  value={form.technicien_id}
                  onChange={(e) => setForm({ ...form, technicien_id: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-[#2a5298]"
                >
                  <option value="">— Non assigné —</option>
                  {techniciens.map((t) => (
                    <option key={t.id} value={t.id}>{t.nom}</option>
                  ))}
                </select>
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
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
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
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
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
        title="Supprimer cette réparation ?"
        message={`Êtes-vous sûr de vouloir supprimer la réparation "${deleteTarget?.numero}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
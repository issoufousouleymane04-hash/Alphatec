'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2, Unlock,
  CheckCircle2, XCircle, Clock, Truck,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import { TYPES_SERVICE, STATUTS_DEBLOCAGE, getTypeService, getStatut } from '@/lib/services'

interface Deblocage {
  id: number
  numero: string
  client_id: number | null
  marque: string
  modele: string
  imei: string | null
  type_service: string
  prix: number
  statut: string
  resultat: string | null
  technicien_id: string | null
  date_reception: string
  date_livraison: string | null
  notes: string | null
  created_at: string
  clients?: { nom: string; telephone: string | null } | null
  profiles?: { nom: string } | null
}

interface Client { id: number; nom: string }
interface Technicien { id: string; nom: string }

interface Props {
  initialDeblocages: Deblocage[]
  clients: Client[]
  techniciens: Technicien[]
}

const emptyForm = {
  client_id: '',
  marque: '',
  modele: '',
  imei: '',
  type_service: 'frp',
  prix: '5000',
  statut: 'en_attente',
  technicien_id: '',
  notes: '',
}

export default function DeblocageTable({ initialDeblocages, clients, techniciens }: Props) {
  const supabase = createClient()
  const [items, setItems] = useState<Deblocage[]>(initialDeblocages)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatut, setFilterStatut] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Deblocage | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Deblocage | null>(null)

  const total = items.length
  const enCours = items.filter((i) => ['en_attente', 'en_cours'].includes(i.statut)).length
  const reussis = items.filter((i) => i.statut === 'reussi').length
  const ca = items
    .filter((i) => ['reussi', 'livre'].includes(i.statut))
    .reduce((s, i) => s + Number(i.prix), 0)

  const filtered = items.filter((item) => {
    const matchSearch =
      item.numero.toLowerCase().includes(search.toLowerCase()) ||
      item.marque.toLowerCase().includes(search.toLowerCase()) ||
      item.modele.toLowerCase().includes(search.toLowerCase()) ||
      (item.imei?.includes(search) ?? false) ||
      (item.clients?.nom.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchType = filterType === 'all' || item.type_service === filterType
    const matchStatut = filterStatut === 'all' || item.statut === filterStatut
    return matchSearch && matchType && matchStatut
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(item: Deblocage) {
    setEditing(item)
    setForm({
      client_id: item.client_id?.toString() || '',
      marque: item.marque,
      modele: item.modele,
      imei: item.imei || '',
      type_service: item.type_service,
      prix: item.prix.toString(),
      statut: item.statut,
      technicien_id: item.technicien_id || '',
      notes: item.notes || '',
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      client_id: form.client_id ? parseInt(form.client_id) : null,
      marque: form.marque,
      modele: form.modele,
      imei: form.imei || null,
      type_service: form.type_service,
      prix: parseFloat(form.prix) || 0,
      statut: form.statut,
      technicien_id: form.technicien_id || null,
      notes: form.notes || null,
    }

    if (editing) {
      const { data, error } = await supabase
        .from('deblocages')
        .update(payload)
        .eq('id', editing.id)
        .select('*, clients(nom, telephone), profiles!technicien_id(nom)')
        .single()

      setSaving(false)

      if (error) {
        toast.error('Erreur : ' + error.message)
        return
      }

      setItems((prev) => prev.map((i) => (i.id === editing.id ? data : i)))
      toast.success('✅ Déblocage modifié')
      setModalOpen(false)
    } else {
      const numero = `DEB-${Date.now().toString().slice(-6)}`
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('deblocages')
        .insert({ ...payload, numero, created_by: user?.id })
        .select('*, clients(nom, telephone), profiles!technicien_id(nom)')
        .single()

      setSaving(false)

      if (error) {
        toast.error('Erreur : ' + error.message)
        return
      }

      setItems((prev) => [data, ...prev])
      toast.success(`✅ Ticket ${numero} créé`)
      setModalOpen(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase
      .from('deblocages')
      .delete()
      .eq('id', deleteTarget.id)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id))
    toast.success('🗑️ Ticket supprimé')
    setDeleteTarget(null)
  }

  function typeBadge(value: string) {
    const t = getTypeService(value)
    const colors: Record<string, string> = {
      orange: 'bg-orange-100 text-orange-700',
      blue: 'bg-blue-100 text-blue-700',
      purple: 'bg-purple-100 text-purple-700',
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      pink: 'bg-pink-100 text-pink-700',
    }
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${colors[t.color]}`}>
        <span>{t.emoji}</span>
        {t.label}
      </span>
    )
  }

  function statutBadge(value: string) {
    const s = getStatut(value)
    const icons: Record<string, any> = {
      en_attente: Clock,
      en_cours: Clock,
      reussi: CheckCircle2,
      echoue: XCircle,
      livre: Truck,
    }
    const Icon = icons[value] || Clock
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${s.color}`}>
        <Icon className="w-3 h-3" />
        {s.label}
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
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Réussis</div>
          <div className="text-2xl font-extrabold text-green-600">{reussis}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">CA déblocage</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">
            {ca.toLocaleString('fr-FR')} F
          </div>
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
            placeholder="Rechercher (IMEI, client, modèle...)"
            className="border-none outline-none text-sm w-full bg-transparent"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="all">Tous les services</option>
          {TYPES_SERVICE.map((t) => (
            <option key={t.value} value={t.value}>
              {t.emoji} {t.label}
            </option>
          ))}
        </select>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="all">Tous les statuts</option>
          {STATUTS_DEBLOCAGE.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau déblocage
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">N°</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Client</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Appareil</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Service</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Prix</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Technicien</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Statut</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    {items.length === 0
                      ? 'Aucun déblocage. Cliquez sur "Nouveau déblocage".'
                      : 'Aucun résultat.'}
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#1e3c72]">
                      {item.numero}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {item.clients?.nom || <span className="text-slate-400 italic">Comptoir</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {item.marque} {item.modele}
                      </div>
                      {item.imei && (
                        <div className="text-xs text-slate-400 font-mono">
                          IMEI: {item.imei}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">{typeBadge(item.type_service)}</td>
                    <td className="px-6 py-4 font-bold text-[#1e3c72]">
                      {Number(item.prix).toLocaleString('fr-FR')} F
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {item.profiles?.nom || <span className="text-slate-400 italic">—</span>}
                    </td>
                    <td className="px-6 py-4">{statutBadge(item.statut)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(item)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
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
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center">
                  <Unlock className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#1e3c72]">
                  {editing ? `Modifier ${editing.numero}` : 'Nouveau déblocage'}
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
              {/* Choix service */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Type de service *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TYPES_SERVICE.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, type_service: t.value, prix: t.prix.toString() })
                      }
                      className={`p-3 rounded-xl border-2 transition-all text-left ${
                        form.type_service === t.value
                          ? 'border-[#2a5298] bg-blue-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{t.emoji}</div>
                      <div className="text-xs font-bold text-slate-800">{t.label}</div>
                      <div className="text-[10px] text-slate-500">{t.duree}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Client</label>
                  <select
                    value={form.client_id}
                    onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="">— Comptoir (sans client) —</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Technicien
                  </label>
                  <select
                    value={form.technicien_id}
                    onChange={(e) => setForm({ ...form, technicien_id: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white"
                  >
                    <option value="">— Non assigné —</option>
                    {techniciens.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Marque *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.marque}
                    onChange={(e) => setForm({ ...form, marque: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm"
                    placeholder="Samsung, Apple, Xiaomi..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Modèle *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.modele}
                    onChange={(e) => setForm({ ...form, modele: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm"
                    placeholder="Galaxy S21, iPhone 12..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    IMEI / N° série
                  </label>
                  <input
                    type="text"
                    value={form.imei}
                    onChange={(e) => setForm({ ...form, imei: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-mono"
                    placeholder="35XXXXXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Prix (F) *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.prix}
                    onChange={(e) => setForm({ ...form, prix: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Statut</label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white"
                >
                  {STATUTS_DEBLOCAGE.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Notes / Diagnostic
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm resize-none"
                  placeholder="Informations complémentaires..."
                />
              </div>

              <div className="flex gap-3 pt-2">
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
        title="Supprimer ce déblocage ?"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.numero}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
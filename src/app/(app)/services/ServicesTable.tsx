'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2, Wrench,
  Upload, Image as ImageIcon, Power, Eye, EyeOff, Star,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Service {
  id: number
  titre: string
  description: string | null
  categorie: string
  emoji: string
  prix: string | null
  duree: string | null
  image_url: string | null
  actif: boolean
  ordre: number
  created_at: string
}

interface Props {
  initialServices: Service[]
}

const CATEGORIES = [
  { value: 'deblocage', label: '🔓 Déblocage' },
  { value: 'informatique', label: '💻 Informatique' },
  { value: 'accessoire', label: '🖱️ Accessoires' },
  { value: 'reseau', label: '📶 Réseau' },
  { value: 'autre', label: '📦 Autre' },
]

const emptyForm = {
  titre: '',
  description: '',
  categorie: 'deblocage',
  emoji: '🔧',
  prix: '',
  duree: '',
  image_url: '',
  actif: true,
  ordre: '0',
}

export default function ServicesTable({ initialServices }: Props) {
  const supabase = createClient()
  const [items, setItems] = useState<Service[]>(initialServices)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [filterActif, setFilterActif] = useState<'all' | 'actif' | 'inactif'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)

  const filtered = items.filter((s) => {
    const matchSearch =
      s.titre.toLowerCase().includes(search.toLowerCase()) ||
      (s.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchCat = filterCat === 'all' || s.categorie === filterCat
    const matchActif =
      filterActif === 'all' ||
      (filterActif === 'actif' && s.actif) ||
      (filterActif === 'inactif' && !s.actif)
    return matchSearch && matchCat && matchActif
  })

  const total = items.length
  const actifs = items.filter((s) => s.actif).length
  const inactifs = items.filter((s) => !s.actif).length

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(s: Service) {
    setEditing(s)
    setForm({
      titre: s.titre,
      description: s.description || '',
      categorie: s.categorie,
      emoji: s.emoji,
      prix: s.prix || '',
      duree: s.duree || '',
      image_url: s.image_url || '',
      actif: s.actif,
      ordre: s.ordre.toString(),
    })
    setModalOpen(true)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo)')
      return
    }

    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('services')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (error) {
      setUploading(false)
      toast.error('Erreur upload : ' + error.message)
      return
    }

    const { data: urlData } = supabase.storage.from('services').getPublicUrl(data.path)
    setForm((f) => ({ ...f, image_url: urlData.publicUrl }))
    setUploading(false)
    toast.success('✅ Image uploadée')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      titre: form.titre,
      description: form.description || null,
      categorie: form.categorie,
      emoji: form.emoji || '🔧',
      prix: form.prix || null,
      duree: form.duree || null,
      image_url: form.image_url || null,
      actif: form.actif,
      ordre: parseInt(form.ordre) || 0,
    }

    if (editing) {
      const { data, error } = await supabase
        .from('services')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single()

      setSaving(false)
      if (error) { toast.error('Erreur : ' + error.message); return }

      setItems((prev) => prev.map((s) => (s.id === editing.id ? data : s)))
      toast.success('✅ Service modifié')
      setModalOpen(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('services')
        .insert({ ...payload, created_by: user?.id })
        .select()
        .single()

      setSaving(false)
      if (error) { toast.error('Erreur : ' + error.message); return }

      setItems((prev) => [data, ...prev])
      toast.success('✅ Service ajouté')
      setModalOpen(false)
    }
  }

  async function toggleActif(s: Service) {
    const { data, error } = await supabase
      .from('services')
      .update({ actif: !s.actif })
      .eq('id', s.id)
      .select()
      .single()

    if (error) { toast.error('Erreur : ' + error.message); return }

    setItems((prev) => prev.map((x) => (x.id === s.id ? data : x)))
    toast.success(data.actif ? '✅ Service activé' : '⚠️ Service désactivé')
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('services').delete().eq('id', deleteTarget.id)
    if (error) { toast.error('Erreur : ' + error.message); return }
    setItems((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    toast.success('🗑️ Service supprimé')
    setDeleteTarget(null)
  }

  function catLabel(cat: string) {
    return CATEGORIES.find((c) => c.value === cat)?.label || cat
  }

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Total</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">{total}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Actifs</div>
          <div className="text-2xl font-extrabold text-green-600">{actifs}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Inactifs</div>
          <div className="text-2xl font-extrabold text-slate-400">{inactifs}</div>
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
            placeholder="Rechercher un service..."
            className="border-none outline-none text-sm w-full bg-transparent"
          />
        </div>

        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
        >
          <option value="all">Toutes catégories</option>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={filterActif}
          onChange={(e) => setFilterActif(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
        >
          <option value="all">Tous</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
        </select>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau service
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Service</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Catégorie</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Prix</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Durée</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Statut</th>
                <th className="text-right px-4 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    {items.length === 0 ? 'Aucun service pour l\'instant.' : 'Aucun résultat.'}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.image_url ? (
                          <img
                            src={s.image_url}
                            alt={s.titre}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center text-xl">
                            {s.emoji}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-800">{s.titre}</div>
                          {s.description && (
                            <div className="text-xs text-slate-400 line-clamp-1 max-w-xs">
                              {s.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {catLabel(s.categorie)}
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1e3c72]">
                      {s.prix || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {s.duree || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {s.actif ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                          <Eye className="w-3 h-3" /> Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          <EyeOff className="w-3 h-3" /> Masqué
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleActif(s)}
                          className={`w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center transition-all ${
                            s.actif
                              ? 'hover:bg-amber-500 hover:text-white text-slate-600'
                              : 'hover:bg-green-500 hover:text-white text-slate-600'
                          }`}
                          title={s.actif ? 'Masquer' : 'Afficher'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white text-slate-600 flex items-center justify-center"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
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
                  {editing ? 'Modifier le service' : 'Nouveau service'}
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
              {/* Image */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Image (optionnel)</label>
                <div className="flex items-center gap-4">
                  {form.image_url ? (
                    <div className="relative">
                      <img src={form.image_url} alt="Aperçu" className="w-24 h-24 rounded-xl object-cover border-2 border-slate-200" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: '' })}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#2a5298] hover:bg-blue-50">
                      {uploading ? (
                        <Loader2 className="w-6 h-6 text-[#2a5298] animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-[10px] text-slate-500 font-semibold">Ajouter</span>
                        </>
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                    </label>
                  )}
                  <div className="text-xs text-slate-400">JPG, PNG · Max 5 Mo</div>
                </div>
              </div>

              {/* Emoji + Titre */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Emoji</label>
                  <input
                    type="text"
                    value={form.emoji}
                    onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-2xl text-center outline-none focus:border-[#2a5298]"
                    placeholder="🔧"
                    maxLength={4}
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Titre *</label>
                  <input
                    type="text"
                    required
                    value={form.titre}
                    onChange={(e) => setForm({ ...form, titre: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="FRP Android"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] resize-none"
                  placeholder="Déblocage compte Google pour Samsung, Xiaomi, Huawei..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Catégorie *</label>
                  <select
                    value={form.categorie}
                    onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-[#2a5298]"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ordre d&apos;affichage</label>
                  <input
                    type="number"
                    value={form.ordre}
                    onChange={(e) => setForm({ ...form, ordre: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix affiché</label>
                  <input
                    type="text"
                    value={form.prix}
                    onChange={(e) => setForm({ ...form, prix: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="Dès 5 000 F ou Sur devis"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Durée</label>
                  <input
                    type="text"
                    value={form.duree}
                    onChange={(e) => setForm({ ...form, duree: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="30 min, 2 h..."
                  />
                </div>
              </div>

              {/* Actif */}
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  id="actif"
                  checked={form.actif}
                  onChange={(e) => setForm({ ...form, actif: e.target.checked })}
                  className="w-5 h-5 rounded accent-[#2a5298]"
                />
                <label htmlFor="actif" className="text-sm font-semibold text-slate-700 cursor-pointer">
                  Visible sur la vitrine publique
                </label>
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
                  disabled={saving || uploading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer ce service ?"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.titre}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
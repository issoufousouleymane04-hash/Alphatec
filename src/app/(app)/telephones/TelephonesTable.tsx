'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2, Smartphone,
  PackageX, PackageCheck, AlertTriangle, Upload, Image as ImageIcon,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Telephone {
  id: number
  marque: string
  modele: string
  type: 'android' | 'iphone'
  stockage: string | null
  ram: string | null
  couleur: string | null
  etat: 'neuf' | 'reconditionne' | 'occasion'
  imei: string | null
  prix: number
  prix_achat: number
  quantite: number
  seuil_alerte: number
  image_url: string | null
  description: string | null
  created_at: string
}

interface Props {
  initialTelephones: Telephone[]
}

const emptyForm = {
  marque: '',
  modele: '',
  type: 'android' as 'android' | 'iphone',
  stockage: '',
  ram: '',
  couleur: '',
  etat: 'neuf' as 'neuf' | 'reconditionne' | 'occasion',
  imei: '',
  prix: '',
  prix_achat: '',
  quantite: '0',
  seuil_alerte: '2',
  image_url: '',
  description: '',
}

export default function TelephonesTable({ initialTelephones }: Props) {
  const supabase = createClient()
  const [items, setItems] = useState<Telephone[]>(initialTelephones)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'android' | 'iphone'>('all')
  const [filterEtat, setFilterEtat] = useState<'all' | 'neuf' | 'reconditionne' | 'occasion'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Telephone | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Telephone | null>(null)

  const filtered = items.filter((t) => {
    const matchSearch =
      t.marque.toLowerCase().includes(search.toLowerCase()) ||
      t.modele.toLowerCase().includes(search.toLowerCase()) ||
      (t.couleur?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchType = filterType === 'all' || t.type === filterType
    const matchEtat = filterEtat === 'all' || t.etat === filterEtat
    return matchSearch && matchType && matchEtat
  })

  const stats = {
    total: items.length,
    android: items.filter((t) => t.type === 'android').length,
    iphone: items.filter((t) => t.type === 'iphone').length,
    stock: items.reduce((s, t) => s + t.quantite, 0),
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(t: Telephone) {
    setEditing(t)
    setForm({
      marque: t.marque,
      modele: t.modele,
      type: t.type,
      stockage: t.stockage || '',
      ram: t.ram || '',
      couleur: t.couleur || '',
      etat: t.etat,
      imei: t.imei || '',
      prix: t.prix.toString(),
      prix_achat: t.prix_achat.toString(),
      quantite: t.quantite.toString(),
      seuil_alerte: t.seuil_alerte.toString(),
      image_url: t.image_url || '',
      description: t.description || '',
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
      .from('telephones')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (error) {
      setUploading(false)
      toast.error('Erreur upload : ' + error.message)
      return
    }

    const { data: urlData } = supabase.storage.from('telephones').getPublicUrl(data.path)
    setForm((f) => ({ ...f, image_url: urlData.publicUrl }))
    setUploading(false)
    toast.success('✅ Image uploadée')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      marque: form.marque,
      modele: form.modele,
      type: form.type,
      stockage: form.stockage || null,
      ram: form.ram || null,
      couleur: form.couleur || null,
      etat: form.etat,
      imei: form.imei || null,
      prix: parseFloat(form.prix) || 0,
      prix_achat: parseFloat(form.prix_achat) || 0,
      quantite: parseInt(form.quantite) || 0,
      seuil_alerte: parseInt(form.seuil_alerte) || 2,
      image_url: form.image_url || null,
      description: form.description || null,
    }

    if (editing) {
      const { data, error } = await supabase
        .from('telephones')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single()

      setSaving(false)
      if (error) { toast.error('Erreur : ' + error.message); return }

      setItems((prev) => prev.map((t) => (t.id === editing.id ? data : t)))
      toast.success('✅ Téléphone modifié')
      setModalOpen(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('telephones')
        .insert({ ...payload, created_by: user?.id })
        .select()
        .single()

      setSaving(false)
      if (error) { toast.error('Erreur : ' + error.message); return }

      setItems((prev) => [data, ...prev])
      toast.success('✅ Téléphone ajouté')
      setModalOpen(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('telephones').delete().eq('id', deleteTarget.id)
    if (error) { toast.error('Erreur : ' + error.message); return }
    setItems((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    toast.success('🗑️ Téléphone supprimé')
    setDeleteTarget(null)
  }

  function etatBadge(etat: string) {
    if (etat === 'neuf')
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
          ✨ Neuf
        </span>
      )
    if (etat === 'reconditionne')
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
          🔄 Reconditionné
        </span>
      )
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
        📱 Occasion
      </span>
    )
  }

  function stockBadge(q: number, seuil: number) {
    if (q === 0)
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
          <PackageX className="w-3 h-3" /> Rupture
        </span>
      )
    if (q < seuil)
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
          <AlertTriangle className="w-3 h-3" /> Faible
        </span>
      )
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
        <PackageCheck className="w-3 h-3" /> OK
      </span>
    )
  }

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Total</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">{stats.total}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Android</div>
          <div className="text-2xl font-extrabold text-green-600">{stats.android}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">iPhone</div>
          <div className="text-2xl font-extrabold text-slate-700">{stats.iphone}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">En stock</div>
          <div className="text-2xl font-extrabold text-[#2a5298]">{stats.stock}</div>
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
            placeholder="Rechercher un téléphone..."
            className="border-none outline-none text-sm w-full bg-transparent"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
        >
          <option value="all">Tous les types</option>
          <option value="android">Android</option>
          <option value="iphone">iPhone</option>
        </select>

        <select
          value={filterEtat}
          onChange={(e) => setFilterEtat(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
        >
          <option value="all">Tous les états</option>
          <option value="neuf">Neuf</option>
          <option value="reconditionne">Reconditionné</option>
          <option value="occasion">Occasion</option>
        </select>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau téléphone
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Image</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Appareil</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Caractéristiques</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">État</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Prix</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Stock</th>
                <th className="text-right px-4 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    {items.length === 0 ? 'Aucun téléphone pour l\'instant.' : 'Aucun résultat.'}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 group">
                    <td className="px-4 py-3">
                      {t.image_url ? (
                        <img
                          src={t.image_url}
                          alt={`${t.marque} ${t.modele}`}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{t.marque} {t.modele}</div>
                      <div className="text-xs text-slate-400">
                        {t.type === 'iphone' ? '🍎 iPhone' : '🤖 Android'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {t.stockage && <div>💾 {t.stockage}</div>}
                      {t.ram && <div>🧠 {t.ram} RAM</div>}
                      {t.couleur && <div>🎨 {t.couleur}</div>}
                    </td>
                    <td className="px-4 py-3">{etatBadge(t.etat)}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#1e3c72]">
                        {Number(t.prix).toLocaleString('fr-FR')} F
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-lg text-slate-800">{t.quantite}</div>
                      <div className="mt-1">{stockBadge(t.quantite, t.seuil_alerte)}</div>
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
                  <Smartphone className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#1e3c72]">
                  {editing ? 'Modifier le téléphone' : 'Nouveau téléphone'}
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Image du téléphone</label>
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

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Type *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'android' })}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                      form.type === 'android'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    🤖 Android
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'iphone' })}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                      form.type === 'iphone'
                        ? 'bg-slate-800 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    🍎 iPhone
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Marque *</label>
                  <input
                    type="text"
                    required
                    value={form.marque}
                    onChange={(e) => setForm({ ...form, marque: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="Samsung, Apple, Xiaomi..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Modèle *</label>
                  <input
                    type="text"
                    required
                    value={form.modele}
                    onChange={(e) => setForm({ ...form, modele: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="Galaxy S23, iPhone 13..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Stockage</label>
                  <input
                    type="text"
                    value={form.stockage}
                    onChange={(e) => setForm({ ...form, stockage: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="128 Go"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">RAM</label>
                  <input
                    type="text"
                    value={form.ram}
                    onChange={(e) => setForm({ ...form, ram: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="8 Go"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Couleur</label>
                  <input
                    type="text"
                    value={form.couleur}
                    onChange={(e) => setForm({ ...form, couleur: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="Noir"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">État *</label>
                  <select
                    value={form.etat}
                    onChange={(e) => setForm({ ...form, etat: e.target.value as any })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-[#2a5298]"
                  >
                    <option value="neuf">✨ Neuf</option>
                    <option value="reconditionne">🔄 Reconditionné</option>
                    <option value="occasion">📱 Occasion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">IMEI (optionnel)</label>
                  <input
                    type="text"
                    value={form.imei}
                    onChange={(e) => setForm({ ...form, imei: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-[#2a5298]"
                    placeholder="35XXXXXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix achat (F)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.prix_achat}
                    onChange={(e) => setForm({ ...form, prix_achat: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix vente (F) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.prix}
                    onChange={(e) => setForm({ ...form, prix: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Quantité</label>
                  <input
                    type="number"
                    value={form.quantite}
                    onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Seuil alerte</label>
                  <input
                    type="number"
                    value={form.seuil_alerte}
                    onChange={(e) => setForm({ ...form, seuil_alerte: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
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
                  placeholder="Caractéristiques, garantie, accessoires inclus..."
                />
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
        title="Supprimer ce téléphone ?"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.marque} ${deleteTarget?.modele}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2,
  PackageX, PackageCheck, AlertTriangle, Upload, Image as ImageIcon,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Article {
  id: number
  nom: string
  reference: string | null
  description: string | null
  categorie: string
  marque: string | null
  prix_achat: number
  prix_vente: number
  quantite: number
  seuil_alerte: number
  image_url: string | null
  created_at: string
}

interface Props {
  initialArticles: Article[]
}

const CATEGORIES = [
  { value: 'ordinateur', label: '💻 Ordinateur' },
  { value: 'ecran', label: '🖥️ Écran' },
  { value: 'accessoire', label: '🖱️ Accessoire' },
  { value: 'imprimante', label: '🖨️ Imprimante' },
  { value: 'reseau', label: '📡 Réseau' },
  { value: 'autre', label: '📦 Autre' },
]

const emptyForm = {
  nom: '',
  reference: '',
  description: '',
  categorie: 'accessoire',
  marque: '',
  prix_achat: '',
  prix_vente: '',
  quantite: '0',
  seuil_alerte: '3',
  image_url: '',
}

export default function ArticlesTable({ initialArticles }: Props) {
  const supabase = createClient()
  const [items, setItems] = useState<Article[]>(initialArticles)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Article | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null)

  const filtered = items.filter((a) => {
    const matchSearch =
      a.nom.toLowerCase().includes(search.toLowerCase()) ||
      (a.reference?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (a.marque?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchCat = filterCat === 'all' || a.categorie === filterCat
    return matchSearch && matchCat
  })

  const total = items.length
  const stock = items.reduce((s, a) => s + a.quantite, 0)
  const valeurStock = items.reduce((s, a) => s + a.quantite * a.prix_vente, 0)
  const alertes = items.filter((a) => a.quantite < a.seuil_alerte).length

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(a: Article) {
    setEditing(a)
    setForm({
      nom: a.nom,
      reference: a.reference || '',
      description: a.description || '',
      categorie: a.categorie,
      marque: a.marque || '',
      prix_achat: a.prix_achat.toString(),
      prix_vente: a.prix_vente.toString(),
      quantite: a.quantite.toString(),
      seuil_alerte: a.seuil_alerte.toString(),
      image_url: a.image_url || '',
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
      .from('articles')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (error) {
      setUploading(false)
      toast.error('Erreur upload : ' + error.message)
      return
    }

    const { data: urlData } = supabase.storage.from('articles').getPublicUrl(data.path)
    setForm((f) => ({ ...f, image_url: urlData.publicUrl }))
    setUploading(false)
    toast.success('✅ Image uploadée')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      nom: form.nom,
      reference: form.reference || null,
      description: form.description || null,
      categorie: form.categorie,
      marque: form.marque || null,
      prix_achat: parseFloat(form.prix_achat) || 0,
      prix_vente: parseFloat(form.prix_vente) || 0,
      quantite: parseInt(form.quantite) || 0,
      seuil_alerte: parseInt(form.seuil_alerte) || 3,
      image_url: form.image_url || null,
    }

    if (editing) {
      const { data, error } = await supabase
        .from('articles')
        .update(payload)
        .eq('id', editing.id)
        .select()
        .single()

      setSaving(false)
      if (error) { toast.error('Erreur : ' + error.message); return }

      setItems((prev) => prev.map((a) => (a.id === editing.id ? data : a)))
      toast.success('✅ Article modifié')
      setModalOpen(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('articles')
        .insert({ ...payload, created_by: user?.id })
        .select()
        .single()

      setSaving(false)
      if (error) { toast.error('Erreur : ' + error.message); return }

      setItems((prev) => [data, ...prev])
      toast.success('✅ Article ajouté')
      setModalOpen(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('articles').delete().eq('id', deleteTarget.id)
    if (error) { toast.error('Erreur : ' + error.message); return }
    setItems((prev) => prev.filter((a) => a.id !== deleteTarget.id))
    toast.success('🗑️ Article supprimé')
    setDeleteTarget(null)
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
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Articles</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">{total}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Unités</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">{stock}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Valeur</div>
          <div className="text-2xl font-extrabold text-green-600">
            {valeurStock.toLocaleString('fr-FR')} F
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Alertes</div>
          <div className="text-2xl font-extrabold text-amber-500">{alertes}</div>
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
            placeholder="Rechercher un article..."
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

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvel article
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Image</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Article</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Catégorie</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Prix</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Stock</th>
                <th className="text-right px-4 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    {items.length === 0 ? 'Aucun article pour l\'instant.' : 'Aucun résultat.'}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50 group">
                    <td className="px-4 py-3">
                      {a.image_url ? (
                        <img
                          src={a.image_url}
                          alt={a.nom}
                          className="w-14 h-14 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{a.nom}</div>
                      <div className="text-xs text-slate-400">{a.reference || '—'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">
                      {CATEGORIES.find((c) => c.value === a.categorie)?.label || a.categorie}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#1e3c72]">
                        {Number(a.prix_vente).toLocaleString('fr-FR')} F
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-lg text-slate-800">{a.quantite}</div>
                      <div className="mt-1">{stockBadge(a.quantite, a.seuil_alerte)}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(a)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white text-slate-600 flex items-center justify-center"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(a)}
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
              <h2 className="text-lg font-bold text-[#1e3c72]">
                {editing ? 'Modifier l\'article' : 'Nouvel article'}
              </h2>
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Image</label>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom *</label>
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="PC Dell XPS 15"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Référence</label>
                  <input
                    type="text"
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-[#2a5298]"
                    placeholder="PC-DX-001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] resize-none"
                  placeholder="i7, 16Go RAM, 512 SSD..."
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Marque</label>
                  <input
                    type="text"
                    value={form.marque}
                    onChange={(e) => setForm({ ...form, marque: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="Dell, HP, Logitech..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix achat</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.prix_achat}
                    onChange={(e) => setForm({ ...form, prix_achat: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Prix vente *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.prix_vente}
                    onChange={(e) => setForm({ ...form, prix_vente: e.target.value })}
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
        title="Supprimer cet article ?"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.nom}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
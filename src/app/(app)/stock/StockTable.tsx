'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2, AlertTriangle,
  PackageX, PackageCheck, Upload, Image as ImageIcon,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Produit {
  id: number
  reference: string
  nom: string
  description: string | null
  categorie_id: number | null
  fournisseur_id: number | null
  prix_achat: number
  prix_vente: number
  quantite: number
  seuil_alerte: number
  image_url: string | null
  created_at: string
  categories?: { nom: string } | null
  fournisseurs?: { nom: string } | null
}

interface Categorie { id: number; nom: string }
interface Fournisseur { id: number; nom: string }

interface Props {
  initialProduits: Produit[]
  categories: Categorie[]
  fournisseurs: Fournisseur[]
}

const emptyForm = {
  reference: '',
  nom: '',
  description: '',
  categorie_id: '',
  fournisseur_id: '',
  prix_achat: '',
  prix_vente: '',
  quantite: '0',
  seuil_alerte: '5',
  image_url: '',
}

export default function StockTable({ initialProduits, categories, fournisseurs }: Props) {
  const supabase = createClient()
  const [produits, setProduits] = useState<Produit[]>(initialProduits)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState<'all' | 'ok' | 'faible' | 'rupture'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Produit | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Produit | null>(null)

  function getStatut(p: Produit): 'ok' | 'faible' | 'rupture' {
    if (p.quantite === 0) return 'rupture'
    if (p.quantite < p.seuil_alerte) return 'faible'
    return 'ok'
  }

  const filtered = produits.filter((p) => {
    const matchSearch =
      p.nom.toLowerCase().includes(search.toLowerCase()) ||
      p.reference.toLowerCase().includes(search.toLowerCase()) ||
      (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatut = filterStatut === 'all' || getStatut(p) === filterStatut
    return matchSearch && matchStatut
  })

  const totalProduits = produits.length
  const totalQuantite = produits.reduce((s, p) => s + p.quantite, 0)
  const valeurStock = produits.reduce((s, p) => s + p.quantite * p.prix_vente, 0)
  const alertes = produits.filter((p) => getStatut(p) !== 'ok').length

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(p: Produit) {
    setEditing(p)
    setForm({
      reference: p.reference,
      nom: p.nom,
      description: p.description || '',
      categorie_id: p.categorie_id?.toString() || '',
      fournisseur_id: p.fournisseur_id?.toString() || '',
      prix_achat: p.prix_achat.toString(),
      prix_vente: p.prix_vente.toString(),
      quantite: p.quantite.toString(),
      seuil_alerte: p.seuil_alerte.toString(),
      image_url: p.image_url || '',
    })
    setModalOpen(true)
  }

  // Upload d'image
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifie taille (max 5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo)')
      return
    }

    setUploading(true)

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { data, error } = await supabase.storage
      .from('produits')
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (error) {
      setUploading(false)
      toast.error('Erreur upload : ' + error.message)
      return
    }

    const { data: urlData } = supabase.storage.from('produits').getPublicUrl(data.path)

    setForm((f) => ({ ...f, image_url: urlData.publicUrl }))
    setUploading(false)
    toast.success('✅ Image uploadée')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      reference: form.reference,
      nom: form.nom,
      description: form.description || null,
      categorie_id: form.categorie_id ? parseInt(form.categorie_id) : null,
      fournisseur_id: form.fournisseur_id ? parseInt(form.fournisseur_id) : null,
      prix_achat: parseFloat(form.prix_achat) || 0,
      prix_vente: parseFloat(form.prix_vente) || 0,
      quantite: parseInt(form.quantite) || 0,
      seuil_alerte: parseInt(form.seuil_alerte) || 5,
      image_url: form.image_url || null,
    }

    if (editing) {
      const { data, error } = await supabase
        .from('produits')
        .update(payload)
        .eq('id', editing.id)
        .select('*, categories(nom), fournisseurs(nom)')
        .single()

      setSaving(false)

      if (error) {
        toast.error('Erreur : ' + error.message)
        return
      }

      setProduits((prev) => prev.map((p) => (p.id === editing.id ? data : p)))
      toast.success('✅ Produit modifié')
      setModalOpen(false)
    } else {
      const { data, error } = await supabase
        .from('produits')
        .insert(payload)
        .select('*, categories(nom), fournisseurs(nom)')
        .single()

      setSaving(false)

      if (error) {
        toast.error('Erreur : ' + error.message)
        return
      }

      setProduits((prev) => [data, ...prev])
      toast.success('✅ Produit ajouté')
      setModalOpen(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('produits').delete().eq('id', deleteTarget.id)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setProduits((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    toast.success('🗑️ Produit supprimé')
    setDeleteTarget(null)
  }

  function statutBadge(statut: 'ok' | 'faible' | 'rupture') {
    if (statut === 'ok')
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
          <PackageCheck className="w-3 h-3" /> Disponible
        </span>
      )
    if (statut === 'faible')
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
          <AlertTriangle className="w-3 h-3" /> Stock faible
        </span>
      )
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
        <PackageX className="w-3 h-3" /> Rupture
      </span>
    )
  }

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Produits</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">{totalProduits}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Unités</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">{totalQuantite}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Valeur stock</div>
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
            placeholder="Rechercher un produit..."
            className="border-none outline-none text-sm w-full bg-transparent"
          />
        </div>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="ok">Disponibles</option>
          <option value="faible">Stock faible</option>
          <option value="rupture">En rupture</option>
        </select>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau produit
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Image</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Réf.</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Produit</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Catégorie</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Prix vente</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Stock</th>
                <th className="text-left px-4 py-4 text-xs font-bold text-slate-500 uppercase">Statut</th>
                <th className="text-right px-4 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    {produits.length === 0
                      ? 'Aucun produit pour l\'instant.'
                      : 'Aucun résultat pour cette recherche.'}
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const statut = getStatut(p)
                  const marge = p.prix_vente - p.prix_achat
                  return (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 group">
                      <td className="px-4 py-3">
                        {p.image_url ? (
                          <img
                            src={p.image_url}
                            alt={p.nom}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.reference}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{p.nom}</div>
                        {p.fournisseurs?.nom && (
                          <div className="text-xs text-slate-400">Fourn. : {p.fournisseurs.nom}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {p.categories?.nom || <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#1e3c72]">
                          {Number(p.prix_vente).toLocaleString('fr-FR')} F
                        </div>
                        {marge > 0 && (
                          <div className="text-xs text-green-600 font-semibold">
                            +{marge.toLocaleString('fr-FR')} F
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-lg text-slate-800">{p.quantite}</span>
                        <span className="text-xs text-slate-400 ml-1">(min {p.seuil_alerte})</span>
                      </td>
                      <td className="px-4 py-3">{statutBadge(statut)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(p)}
                            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white text-slate-600 flex items-center justify-center"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
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
                {editing ? 'Modifier le produit' : 'Nouveau produit'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Image du produit
                </label>
                <div className="flex items-center gap-4">
                  {form.image_url ? (
                    <div className="relative">
                      <img
                        src={form.image_url}
                        alt="Aperçu"
                        className="w-24 h-24 rounded-xl object-cover border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image_url: '' })}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#2a5298] hover:bg-blue-50 transition-all">
                      {uploading ? (
                        <Loader2 className="w-6 h-6 text-[#2a5298] animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-slate-400 mb-1" />
                          <span className="text-[10px] text-slate-500 font-semibold">Ajouter</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  )}
                  <div className="text-xs text-slate-400">
                    JPG, PNG, WEBP
                    <br />
                    Max 5 Mo
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Référence *</label>
                  <input
                    type="text"
                    required
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-[#2a5298]"
                    placeholder="PC-DX-001"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom du produit *</label>
                  <input
                    type="text"
                    required
                    value={form.nom}
                    onChange={(e) => setForm({ ...form, nom: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="PC Dell XPS 15"
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
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Catégorie</label>
                  <select
                    value={form.categorie_id}
                    onChange={(e) => setForm({ ...form, categorie_id: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-[#2a5298]"
                  >
                    <option value="">— Aucune —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Fournisseur</label>
                  <select
                    value={form.fournisseur_id}
                    onChange={(e) => setForm({ ...form, fournisseur_id: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-[#2a5298]"
                  >
                    <option value="">— Aucun —</option>
                    {fournisseurs.map((f) => (
                      <option key={f.id} value={f.id}>{f.nom}</option>
                    ))}
                  </select>
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
        title="Supprimer ce produit ?"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.nom}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
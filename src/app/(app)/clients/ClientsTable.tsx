'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2, Building2, User as UserIcon,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Client {
  id: number
  nom: string
  email: string | null
  telephone: string | null
  adresse: string | null
  ville: string | null
  type: 'particulier' | 'entreprise'
  notes: string | null
  created_at: string
}

interface Props {
  initialClients: Client[]
}

const emptyForm = {
  nom: '',
  email: '',
  telephone: '',
  adresse: '',
  ville: '',
  type: 'particulier' as 'particulier' | 'entreprise',
  notes: '',
}

export default function ClientsTable({ initialClients }: Props) {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'particulier' | 'entreprise'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.nom.toLowerCase().includes(search.toLowerCase()) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (c.telephone?.includes(search) ?? false) ||
      (c.ville?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchType = filterType === 'all' || c.type === filterType
    return matchSearch && matchType
  })

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(client: Client) {
    setEditing(client)
    setForm({
      nom: client.nom,
      email: client.email || '',
      telephone: client.telephone || '',
      adresse: client.adresse || '',
      ville: client.ville || '',
      type: client.type,
      notes: client.notes || '',
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    if (editing) {
      const { data, error } = await supabase
        .from('clients')
        .update({
          nom: form.nom,
          email: form.email || null,
          telephone: form.telephone || null,
          adresse: form.adresse || null,
          ville: form.ville || null,
          type: form.type,
          notes: form.notes || null,
        })
        .eq('id', editing.id)
        .select()
        .single()

      setSaving(false)
      if (error) { toast.error('Erreur : ' + error.message); return }

      setClients((prev) => prev.map((c) => (c.id === editing.id ? data : c)))
      toast.success('✅ Client modifié')
      setModalOpen(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('clients')
        .insert({
          nom: form.nom,
          email: form.email || null,
          telephone: form.telephone || null,
          adresse: form.adresse || null,
          ville: form.ville || null,
          type: form.type,
          notes: form.notes || null,
          created_by: user?.id,
        })
        .select()
        .single()

      setSaving(false)
      if (error) { toast.error('Erreur : ' + error.message); return }

      setClients((prev) => [data, ...prev])
      toast.success('✅ Client ajouté')
      setModalOpen(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('clients').delete().eq('id', deleteTarget.id)
    if (error) { toast.error('Erreur : ' + error.message); return }
    setClients((prev) => prev.filter((c) => c.id !== deleteTarget.id))
    toast.success('🗑️ Client supprimé')
    setDeleteTarget(null)
  }

  return (
    <>
      {/* Barre d'actions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] flex items-center bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200 focus-within:border-[#2a5298]">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            className="border-none outline-none text-sm w-full bg-transparent"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white"
        >
          <option value="all">Tous les types</option>
          <option value="particulier">Particuliers</option>
          <option value="entreprise">Entreprises</option>
        </select>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau client
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="md:overflow-x-auto overflow-visible">
          <table className="w-full text-sm table-mobile-cards">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nom</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Email</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Téléphone</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ville</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    {clients.length === 0 ? 'Aucun client pour l\'instant.' : 'Aucun résultat.'}
                  </td>
                </tr>
              ) : (
                filtered.map((client) => (
                  <tr key={client.id} className="border-b border-slate-50 hover:bg-slate-50 group">
                    <td data-label="Nom" className="px-6 py-4 font-semibold text-slate-800">
                      {client.nom}
                    </td>
                    <td data-label="Email" className="px-6 py-4 text-slate-600">
                      {client.email || <span className="text-slate-300">—</span>}
                    </td>
                    <td data-label="Téléphone" className="px-6 py-4 text-slate-600">
                      {client.telephone || <span className="text-slate-300">—</span>}
                    </td>
                    <td data-label="Ville" className="px-6 py-4 text-slate-600">
                      {client.ville || <span className="text-slate-300">—</span>}
                    </td>
                    <td data-label="Type" className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          client.type === 'entreprise'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {client.type === 'entreprise' ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <UserIcon className="w-3 h-3" />
                        )}
                        {client.type === 'entreprise' ? 'Entreprise' : 'Particulier'}
                      </span>
                    </td>
                    <td data-label="Actions" className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(client)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white text-slate-600 flex items-center justify-center"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(client)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 flex items-center justify-center"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-[#1e3c72]">
                {editing ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                  placeholder="Ex : Société Alpha"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="contact@exemple.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Téléphone</label>
                  <input
                    type="text"
                    value={form.telephone}
                    onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="+227 90 00 00 00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ville</label>
                  <input
                    type="text"
                    value={form.ville}
                    onChange={(e) => setForm({ ...form, ville: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                    placeholder="Niamey"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-white outline-none focus:border-[#2a5298]"
                  >
                    <option value="particulier">Particulier</option>
                    <option value="entreprise">Entreprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Adresse</label>
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                  placeholder="Rue, quartier..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] resize-none"
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
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer ce client ?"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.nom}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
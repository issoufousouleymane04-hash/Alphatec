'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2, FileText, Printer,
  CheckCircle2, Clock, AlertCircle, Download,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Facture {
  id: number
  numero: string
  vente_id: number | null
  client_id: number | null
  montant: number
  statut: 'impayee' | 'payee' | 'partielle'
  date_echeance: string | null
  pdf_url: string | null
  created_at: string
  clients?: { nom: string; email: string | null; telephone: string | null; ville: string | null } | null
  ventes?: { numero: string } | null
}

interface Props {
  initialFactures: Facture[]
}

const emptyForm = {
  client_id: '',
  montant: '',
  statut: 'impayee' as Facture['statut'],
  date_echeance: '',
}

export default function FacturesTable({ initialFactures }: Props) {
  const supabase = createClient()
  const [factures, setFactures] = useState<Facture[]>(initialFactures)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState<'all' | 'payee' | 'impayee' | 'partielle'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Facture | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Facture | null>(null)

  // Stats
  const total = factures.length
  const totalPaye = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + Number(f.montant), 0)
  const totalImpaye = factures.filter(f => f.statut === 'impayee').reduce((s, f) => s + Number(f.montant), 0)
  const nbImpayees = factures.filter(f => f.statut === 'impayee').length

  const filtered = factures.filter((f) => {
    const matchSearch =
      f.numero.toLowerCase().includes(search.toLowerCase()) ||
      (f.clients?.nom.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (f.ventes?.numero.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatut = filterStatut === 'all' || f.statut === filterStatut
    return matchSearch && matchStatut
  })

  function openEdit(f: Facture) {
    setEditing(f)
    setForm({
      client_id: f.client_id?.toString() || '',
      montant: f.montant.toString(),
      statut: f.statut,
      date_echeance: f.date_echeance || '',
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return

    setSaving(true)
    const { data, error } = await supabase
      .from('factures')
      .update({
        montant: parseFloat(form.montant) || 0,
        statut: form.statut,
        date_echeance: form.date_echeance || null,
      })
      .eq('id', editing.id)
      .select('*, clients(nom, email, telephone, ville), ventes(numero)')
      .single()

    setSaving(false)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setFactures((prev) => prev.map((f) => (f.id === editing.id ? data : f)))
    toast.success('✅ Facture modifiée')
    setModalOpen(false)
  }

  async function toggleStatut(f: Facture, statut: 'payee' | 'impayee' | 'partielle') {
    const { data, error } = await supabase
      .from('factures')
      .update({ statut })
      .eq('id', f.id)
      .select('*, clients(nom, email, telephone, ville), ventes(numero)')
      .single()

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setFactures((prev) => prev.map((x) => (x.id === f.id ? data : x)))
    toast.success('Statut mis à jour')
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('factures').delete().eq('id', deleteTarget.id)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setFactures((prev) => prev.filter((f) => f.id !== deleteTarget.id))
    toast.success('🗑️ Facture supprimée')
    setDeleteTarget(null)
  }

  function statutBadge(statut: string) {
    if (statut === 'payee')
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
          <CheckCircle2 className="w-3 h-3" /> Payée
        </span>
      )
    if (statut === 'partielle')
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
          <Clock className="w-3 h-3" /> Partielle
        </span>
      )
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
        <AlertCircle className="w-3 h-3" /> Impayée
      </span>
    )
  }

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Total factures</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">{total}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Encaissé</div>
          <div className="text-2xl font-extrabold text-green-600">
            {totalPaye.toLocaleString('fr-FR')} F
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">
            Impayé ({nbImpayees})
          </div>
          <div className="text-2xl font-extrabold text-red-500">
            {totalImpaye.toLocaleString('fr-FR')} F
          </div>
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
            placeholder="Rechercher une facture..."
            className="border-none outline-none text-sm w-full bg-transparent"
          />
        </div>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-[#2a5298] bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="payee">Payées</option>
          <option value="impayee">Impayées</option>
          <option value="partielle">Partielles</option>
        </select>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">N°</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vente liée</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    {factures.length === 0
                      ? 'Aucune facture. Créez une vente pour en générer une automatiquement.'
                      : 'Aucun résultat pour cette recherche.'}
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr
                    key={f.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#1e3c72]">
                      {f.numero}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800">
                        {f.clients?.nom || <span className="text-slate-400 italic">—</span>}
                      </div>
                      {f.clients?.ville && (
                        <div className="text-xs text-slate-400">{f.clients.ville}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {f.ventes?.numero || '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#1e3c72]">
                      {Number(f.montant).toLocaleString('fr-FR')} F
                    </td>
                    <td className="px-6 py-4">{statutBadge(f.statut)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(f.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/factures/${f.id}`}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                          title="Imprimer / Voir"
                        >
                          <Printer className="w-4 h-4" />
                        </Link>
                        {f.statut === 'impayee' && (
                          <button
                            onClick={() => toggleStatut(f, 'payee')}
                            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-green-500 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                            title="Marquer payée"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(f)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(f)}
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
      {modalOpen && editing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[slideUp_0.3s_ease]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#1e3c72]">
                  Modifier {editing.numero}
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Montant (F) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.montant}
                  onChange={(e) => setForm({ ...form, montant: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Statut
                </label>
                <select
                  value={form.statut}
                  onChange={(e) => setForm({ ...form, statut: e.target.value as Facture['statut'] })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] bg-white"
                >
                  <option value="impayee">Impayée</option>
                  <option value="partielle">Partielle</option>
                  <option value="payee">Payée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Date d&apos;échéance
                </label>
                <input
                  type="date"
                  value={form.date_echeance}
                  onChange={(e) => setForm({ ...form, date_echeance: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
                />
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
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer cette facture ?"
        message={`Êtes-vous sûr de vouloir supprimer la facture "${deleteTarget?.numero}" ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
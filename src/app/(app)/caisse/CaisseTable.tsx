'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2, TrendingUp, TrendingDown,
  Wallet, Coins, ArrowDownCircle, ArrowUpCircle, ShoppingBag, Home,
  Zap, Car, Users, MoreHorizontal, Calendar,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'

interface Transaction {
  id: number
  type: 'recette' | 'depense'
  montant: number
  motif: string
  categorie: string | null
  reference_id: number | null
  created_by: string | null
  created_at: string
  profiles?: { nom: string } | null
}

interface Props {
  initialTransactions: Transaction[]
}

const CATEGORIES = [
  { val: 'vente', label: 'Vente', icon: ShoppingBag, color: 'bg-blue-100 text-blue-700' },
  { val: 'achat', label: 'Achat fournisseur', icon: ShoppingBag, color: 'bg-purple-100 text-purple-700' },
  { val: 'salaire', label: 'Salaire', icon: Users, color: 'bg-green-100 text-green-700' },
  { val: 'loyer', label: 'Loyer', icon: Home, color: 'bg-amber-100 text-amber-700' },
  { val: 'electricite', label: 'Électricité', icon: Zap, color: 'bg-yellow-100 text-yellow-700' },
  { val: 'transport', label: 'Transport', icon: Car, color: 'bg-cyan-100 text-cyan-700' },
  { val: 'autre', label: 'Autre', icon: MoreHorizontal, color: 'bg-slate-100 text-slate-700' },
]

const emptyForm = {
  type: 'recette' as 'recette' | 'depense',
  montant: '',
  motif: '',
  categorie: 'vente',
}

export default function CaisseTable({ initialTransactions }: Props) {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'recette' | 'depense'>('all')
  const [filterPeriode, setFilterPeriode] = useState<'all' | 'jour' | 'semaine' | 'mois'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)

  // Calculs KPI
  const stats = useMemo(() => {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const dayTx = transactions.filter((t) => new Date(t.created_at) >= startOfDay)
    const weekTx = transactions.filter((t) => new Date(t.created_at) >= startOfWeek)
    const monthTx = transactions.filter((t) => new Date(t.created_at) >= startOfMonth)

    const sum = (arr: Transaction[], type: 'recette' | 'depense') =>
      arr.filter((t) => t.type === type).reduce((s, t) => s + Number(t.montant), 0)

    return {
      soldeJour: sum(dayTx, 'recette') - sum(dayTx, 'depense'),
      recettesJour: sum(dayTx, 'recette'),
      depensesJour: sum(dayTx, 'depense'),
      recettesSemaine: sum(weekTx, 'recette'),
      depensesSemaine: sum(weekTx, 'depense'),
      recettesMois: sum(monthTx, 'recette'),
      depensesMois: sum(monthTx, 'depense'),
    }
  }, [transactions])

  // Données graphique (7 derniers jours)
  const chartData = useMemo(() => {
    const days: { date: string; recettes: number; depenses: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const next = new Date(d)
      next.setDate(next.getDate() + 1)
      const dayTx = transactions.filter((t) => {
        const tDate = new Date(t.created_at)
        return tDate >= d && tDate < next
      })
      days.push({
        date: d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
        recettes: dayTx.filter((t) => t.type === 'recette').reduce((s, t) => s + Number(t.montant), 0),
        depenses: dayTx.filter((t) => t.type === 'depense').reduce((s, t) => s + Number(t.montant), 0),
      })
    }
    return days
  }, [transactions])

  // Filtrage
  const filtered = transactions.filter((t) => {
    const matchSearch = t.motif.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || t.type === filterType

    let matchPeriode = true
    if (filterPeriode !== 'all') {
      const now = new Date()
      const tDate = new Date(t.created_at)
      if (filterPeriode === 'jour') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        matchPeriode = tDate >= startOfDay
      } else if (filterPeriode === 'semaine') {
        matchPeriode = tDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (filterPeriode === 'mois') {
        matchPeriode = tDate >= new Date(now.getFullYear(), now.getMonth(), 1)
      }
    }

    return matchSearch && matchType && matchPeriode
  })

  function openCreate(type: 'recette' | 'depense') {
    setEditing(null)
    setForm({ ...emptyForm, type, categorie: type === 'recette' ? 'vente' : 'achat' })
    setModalOpen(true)
  }

  function openEdit(t: Transaction) {
    setEditing(t)
    setForm({
      type: t.type,
      montant: t.montant.toString(),
      motif: t.motif,
      categorie: t.categorie || 'autre',
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      type: form.type,
      montant: parseFloat(form.montant) || 0,
      motif: form.motif,
      categorie: form.categorie || null,
    }

    if (editing) {
      const { data, error } = await supabase
        .from('caisse')
        .update(payload)
        .eq('id', editing.id)
        .select('*, profiles(nom)')
        .single()

      setSaving(false)

      if (error) {
        toast.error('Erreur : ' + error.message)
        return
      }

      setTransactions((prev) => prev.map((t) => (t.id === editing.id ? data : t)))
      toast.success('✅ Transaction modifiée')
      setModalOpen(false)
    } else {
      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('caisse')
        .insert({ ...payload, created_by: user?.id })
        .select('*, profiles(nom)')
        .single()

      setSaving(false)

      if (error) {
        toast.error('Erreur : ' + error.message)
        return
      }

      setTransactions((prev) => [data, ...prev])
      toast.success(`✅ ${form.type === 'recette' ? 'Recette' : 'Dépense'} enregistrée`)
      setModalOpen(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('caisse').delete().eq('id', deleteTarget.id)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setTransactions((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    toast.success('🗑️ Transaction supprimée')
    setDeleteTarget(null)
  }

  function getCategorieConfig(cat: string | null) {
    return CATEGORIES.find((c) => c.val === cat) || CATEGORIES[CATEGORIES.length - 1]
  }

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1e3c72] to-[#00c2ff]" />
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase text-slate-500 font-semibold">Solde du jour</div>
            <Wallet className="w-4 h-4 text-[#2a5298]" />
          </div>
          <div className={`text-3xl font-extrabold ${stats.soldeJour >= 0 ? 'text-[#1e3c72]' : 'text-red-500'}`}>
            {stats.soldeJour.toLocaleString('fr-FR')} F
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Recettes : {stats.recettesJour.toLocaleString('fr-FR')} F | Dépenses : {stats.depensesJour.toLocaleString('fr-FR')} F
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase text-slate-500 font-semibold">Recettes du mois</div>
            <ArrowUpCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-3xl font-extrabold text-green-600">
            {stats.recettesMois.toLocaleString('fr-FR')} F
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Semaine : {stats.recettesSemaine.toLocaleString('fr-FR')} F
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase text-slate-500 font-semibold">Dépenses du mois</div>
            <ArrowDownCircle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-extrabold text-red-500">
            {stats.depensesMois.toLocaleString('fr-FR')} F
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Semaine : {stats.depensesSemaine.toLocaleString('fr-FR')} F
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1e3c72]">Flux des 7 derniers jours</h2>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500" /> Recettes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500" /> Dépenses
            </span>
          </div>
        </div>
        <div style={{ width: '100%', height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="recettesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="depensesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip
                contentStyle={{ background: '#1e3c72', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13 }}
                formatter={(value) => `${Number(value).toLocaleString('fr-FR')} F`}
              />
              <Area type="monotone" dataKey="recettes" stroke="#22c55e" strokeWidth={2.5} fill="url(#recettesGrad)" />
              <Area type="monotone" dataKey="depenses" stroke="#ef4444" strokeWidth={2.5} fill="url(#depensesGrad)" />
            </AreaChart>
          </ResponsiveContainer>
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
            placeholder="Rechercher une transaction..."
            className="border-none outline-none text-sm w-full bg-transparent"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-[#2a5298] bg-white"
        >
          <option value="all">Tous</option>
          <option value="recette">Recettes</option>
          <option value="depense">Dépenses</option>
        </select>

        <select
          value={filterPeriode}
          onChange={(e) => setFilterPeriode(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-[#2a5298] bg-white"
        >
          <option value="all">Tout le temps</option>
          <option value="jour">Aujourd'hui</option>
          <option value="semaine">7 derniers jours</option>
          <option value="mois">Ce mois</option>
        </select>

        <button
          onClick={() => openCreate('recette')}
          className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <TrendingUp className="w-4 h-4" />
          Recette
        </button>

        <button
          onClick={() => openCreate('depense')}
          className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <TrendingDown className="w-4 h-4" />
          Dépense
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Motif</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Par</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    {transactions.length === 0
                      ? 'Aucune transaction pour l\'instant.'
                      : 'Aucun résultat pour cette recherche.'}
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const catConf = getCategorieConfig(t.categorie)
                  const CatIcon = catConf.icon
                  const isRecette = t.type === 'recette'
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        {isRecette ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            <ArrowUpCircle className="w-3 h-3" /> Recette
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                            <ArrowDownCircle className="w-3 h-3" /> Dépense
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {t.motif}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${catConf.color}`}>
                          <CatIcon className="w-3 h-3" />
                          {catConf.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-lg font-extrabold ${isRecette ? 'text-green-600' : 'text-red-500'}`}>
                          {isRecette ? '+' : '−'}
                          {Number(t.montant).toLocaleString('fr-FR')} F
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-xs">
                        {t.profiles?.nom || '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(t.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[slideUp_0.3s_ease]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center ${form.type === 'recette' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {form.type === 'recette' ? (
                    <ArrowUpCircle className="w-5 h-5" />
                  ) : (
                    <ArrowDownCircle className="w-5 h-5" />
                  )}
                </div>
                <h2 className="text-lg font-bold text-[#1e3c72]">
                  {editing
                    ? 'Modifier la transaction'
                    : form.type === 'recette'
                    ? 'Nouvelle recette'
                    : 'Nouvelle dépense'}
                </h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {!editing && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'recette' })}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                      form.type === 'recette'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ↑ Recette
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, type: 'depense' })}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                      form.type === 'depense'
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    ↓ Dépense
                  </button>
                </div>
              )}

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
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-lg font-bold outline-none focus:border-[#2a5298] transition-all"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Motif *
                </label>
                <input
                  type="text"
                  required
                  value={form.motif}
                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] transition-all"
                  placeholder="Ex : Achat fournitures bureau"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Catégorie
                </label>
                <select
                  value={form.categorie}
                  onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] bg-white transition-all"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.val} value={c.val}>
                      {c.label}
                    </option>
                  ))}
                </select>
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
                  className={`flex-1 py-3 rounded-xl text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 ${
                    form.type === 'recette'
                      ? 'bg-gradient-to-br from-green-500 to-green-600'
                      : 'bg-gradient-to-br from-red-500 to-red-600'
                  }`}
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer cette transaction ?"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.motif}" (${deleteTarget?.montant} F) ?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
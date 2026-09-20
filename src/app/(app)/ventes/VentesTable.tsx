'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Trash2, X, Loader2, ShoppingCart, Banknote,
  CreditCard, Smartphone, Building2, CheckCircle2, Clock, XCircle,
  Minus, Receipt, User as UserIcon,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Vente {
  id: number
  numero: string
  client_id: number | null
  total: number
  remise: number
  statut: 'en_cours' | 'payee' | 'annulee'
  mode_paiement: string | null
  vendeur_id: string | null
  created_at: string
  clients?: { nom: string } | null
  profiles?: { nom: string } | null
}

interface Client { id: number; nom: string }
interface Produit {
  id: number
  nom: string
  reference: string
  prix_vente: number
  quantite: number
}

interface CartLine {
  produit_id: number
  nom: string
  prix_unitaire: number
  quantite: number
}

interface Props {
  initialVentes: Vente[]
  clients: Client[]
  produits: Produit[]
}

export default function VentesTable({ initialVentes, clients, produits }: Props) {
  const supabase = createClient()
  const [ventes, setVentes] = useState<Vente[]>(initialVentes)
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState<'all' | 'en_cours' | 'payee' | 'annulee'>('all')
  const [posOpen, setPosOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Vente | null>(null)

  // État de la caisse
  const [selectedClient, setSelectedClient] = useState<string>('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [remise, setRemise] = useState<string>('0')
  const [modePaiement, setModePaiement] = useState<string>('espece')
  const [saving, setSaving] = useState(false)

  // Totaux
  const total = useMemo(() => cart.reduce((s, l) => s + l.prix_unitaire * l.quantite, 0), [cart])
  const remiseNum = parseFloat(remise) || 0
  const totalFinal = Math.max(0, total - remiseNum)

  const filtered = ventes.filter((v) => {
    const matchSearch =
      v.numero.toLowerCase().includes(search.toLowerCase()) ||
      (v.clients?.nom.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatut = filterStatut === 'all' || v.statut === filterStatut
    return matchSearch && matchStatut
  })

  function openPOS() {
    setSelectedClient('')
    setCart([])
    setRemise('0')
    setModePaiement('espece')
    setPosOpen(true)
  }

  function addToCart(produit: Produit) {
    if (produit.quantite <= 0) {
      toast.error('Produit en rupture de stock')
      return
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.produit_id === produit.id)
      if (existing) {
        if (existing.quantite >= produit.quantite) {
          toast.error('Stock insuffisant')
          return prev
        }
        return prev.map((l) =>
          l.produit_id === produit.id ? { ...l, quantite: l.quantite + 1 } : l
        )
      }
      return [
        ...prev,
        {
          produit_id: produit.id,
          nom: produit.nom,
          prix_unitaire: Number(produit.prix_vente),
          quantite: 1,
        },
      ]
    })
  }

  function removeFromCart(produitId: number) {
    setCart((prev) => prev.filter((l) => l.produit_id !== produitId))
  }

  function updateQty(produitId: number, qty: number) {
    if (qty <= 0) {
      removeFromCart(produitId)
      return
    }
    const produit = produits.find((p) => p.id === produitId)
    if (produit && qty > produit.quantite) {
      toast.error('Stock insuffisant')
      return
    }
    setCart((prev) =>
      prev.map((l) => (l.produit_id === produitId ? { ...l, quantite: qty } : l))
    )
  }

  async function handleSaveVente() {
    if (cart.length === 0) {
      toast.error('Ajoutez au moins un produit')
      return
    }

    setSaving(true)

    // Génère un numéro unique
    const numero = `V-${Date.now().toString().slice(-8)}`

    const { data: { user } } = await supabase.auth.getUser()

    // 1. Crée la vente
    const { data: vente, error: venteError } = await supabase
      .from('ventes')
      .insert({
        numero,
        client_id: selectedClient ? parseInt(selectedClient) : null,
        total: totalFinal,
        remise: remiseNum,
        statut: 'payee',
        mode_paiement: modePaiement,
        vendeur_id: user?.id,
      })
      .select('*, clients(nom), profiles(nom)')
      .single()

    if (venteError) {
      setSaving(false)
      toast.error('Erreur vente : ' + venteError.message)
      return
    }

    // 2. Crée les lignes de vente
    const lignes = cart.map((l) => ({
      vente_id: vente.id,
      produit_id: l.produit_id,
      quantite: l.quantite,
      prix_unitaire: l.prix_unitaire,
      sous_total: l.prix_unitaire * l.quantite,
    }))

    const { error: lignesError } = await supabase.from('lignes_vente').insert(lignes)

    if (lignesError) {
      setSaving(false)
      toast.error('Erreur lignes : ' + lignesError.message)
      return
    }

    // 3. Décrémente le stock de chaque produit
    for (const l of cart) {
      const p = produits.find((x) => x.id === l.produit_id)
      if (p) {
        await supabase
          .from('produits')
          .update({ quantite: p.quantite - l.quantite })
          .eq('id', l.produit_id)
      }
    }

    // 4. Ajoute l'entrée en caisse
    await supabase.from('caisse').insert({
      type: 'recette',
      montant: totalFinal,
      motif: `Vente ${numero}`,
      categorie: 'vente',
      reference_id: vente.id,
      created_by: user?.id,
    })

    setSaving(false)
    setVentes((prev) => [vente, ...prev])
    toast.success(`✅ Vente ${numero} enregistrée`)
    setPosOpen(false)
  }

  async function updateStatut(vente: Vente, statut: 'en_cours' | 'payee' | 'annulee') {
    const { data, error } = await supabase
      .from('ventes')
      .update({ statut })
      .eq('id', vente.id)
      .select('*, clients(nom), profiles(nom)')
      .single()

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setVentes((prev) => prev.map((v) => (v.id === vente.id ? data : v)))
    toast.success('Statut mis à jour')
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const { error } = await supabase.from('ventes').delete().eq('id', deleteTarget.id)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setVentes((prev) => prev.filter((v) => v.id !== deleteTarget.id))
    toast.success('🗑️ Vente supprimée')
    setDeleteTarget(null)
  }

  function statutBadge(statut: string) {
    if (statut === 'payee')
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
          <CheckCircle2 className="w-3 h-3" /> Payée
        </span>
      )
    if (statut === 'en_cours')
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
          <Clock className="w-3 h-3" /> En cours
        </span>
      )
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" /> Annulée
      </span>
    )
  }

  // KPIs
  const totalVentes = ventes.length
  const ca = ventes.filter((v) => v.statut === 'payee').reduce((s, v) => s + Number(v.total), 0)
  const enCours = ventes.filter((v) => v.statut === 'en_cours').length

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Total ventes</div>
          <div className="text-2xl font-extrabold text-[#1e3c72]">{totalVentes}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Chiffre d'affaires</div>
          <div className="text-2xl font-extrabold text-green-600">
            {ca.toLocaleString('fr-FR')} F
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">En cours</div>
          <div className="text-2xl font-extrabold text-amber-500">{enCours}</div>
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
            placeholder="Rechercher une vente..."
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
          <option value="en_cours">En cours</option>
          <option value="annulee">Annulées</option>
        </select>

        <button
          onClick={openPOS}
          className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouvelle vente
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
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Vendeur</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Montant</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Paiement</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    {ventes.length === 0
                      ? 'Aucune vente pour l\'instant.'
                      : 'Aucun résultat pour cette recherche.'}
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#1e3c72]">
                      {v.numero}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {v.clients?.nom || <span className="text-slate-400 italic">Comptoir</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {v.profiles?.nom || '—'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#1e3c72]">
                      {Number(v.total).toLocaleString('fr-FR')} F
                      {v.remise > 0 && (
                        <div className="text-xs text-red-500 font-normal">
                          -{Number(v.remise).toLocaleString('fr-FR')} F
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs capitalize">
                      {v.mode_paiement || '—'}
                    </td>
                    <td className="px-6 py-4">{statutBadge(v.statut)}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(v.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {v.statut === 'en_cours' && (
                          <button
                            onClick={() => updateStatut(v, 'payee')}
                            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-green-500 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                            title="Marquer payée"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {v.statut !== 'annulee' && (
                          <button
                            onClick={() => updateStatut(v, 'annulee')}
                            className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                            title="Annuler"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(v)}
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

      {/* MODAL CAISSE (POS) */}
      {posOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl animate-[slideUp_0.3s_ease] max-h-[92vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1e3c72]">Nouvelle vente</h2>
                  <p className="text-xs text-slate-500">Sélectionnez les produits et validez</p>
                </div>
              </div>
              <button
                onClick={() => setPosOpen(false)}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenu 2 colonnes */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
              {/* Catalogue produits (gauche) */}
              <div className="lg:col-span-2 p-6 overflow-y-auto border-r border-slate-100">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
                  Catalogue produits
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {produits.map((p) => {
                    const disabled = p.quantite <= 0
                    return (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p)}
                        disabled={disabled}
                        className={`text-left p-4 rounded-xl border-2 transition-all ${
                          disabled
                            ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                            : 'border-slate-200 hover:border-[#2a5298] hover:shadow-md hover:-translate-y-0.5 active:scale-95'
                        }`}
                      >
                        <div className="font-semibold text-sm text-slate-800 mb-1">
                          {p.nom}
                        </div>
                        <div className="text-xs text-slate-400 font-mono mb-2">
                          {p.reference}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1e3c72] text-sm">
                            {Number(p.prix_vente).toLocaleString('fr-FR')} F
                          </span>
                          <span
                            className={`text-xs font-bold ${
                              disabled
                                ? 'text-red-500'
                                : p.quantite < 5
                                ? 'text-amber-500'
                                : 'text-green-600'
                            }`}
                          >
                            Stock: {p.quantite}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Panier (droite) */}
              <div className="flex flex-col bg-slate-50">
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                  {/* Client */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      <UserIcon className="w-4 h-4 inline mr-1" />
                      Client
                    </label>
                    <select
                      value={selectedClient}
                      onChange={(e) => setSelectedClient(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] bg-white"
                    >
                      <option value="">— Vente comptoir —</option>
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Panier */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" />
                      Panier ({cart.length})
                    </h3>

                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm bg-white rounded-xl border-2 border-dashed border-slate-200">
                        Cliquez sur les produits à gauche
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {cart.map((l) => (
                          <li
                            key={l.produit_id}
                            className="bg-white rounded-xl p-3 shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="text-sm font-semibold text-slate-800 flex-1 pr-2">
                                {l.nom}
                              </div>
                              <button
                                onClick={() => removeFromCart(l.produit_id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQty(l.produit_id, l.quantite - 1)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white flex items-center justify-center transition-all active:scale-90"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-sm font-bold w-6 text-center">
                                  {l.quantite}
                                </span>
                                <button
                                  onClick={() => updateQty(l.produit_id, l.quantite + 1)}
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white flex items-center justify-center transition-all active:scale-90"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <div className="text-sm font-bold text-[#1e3c72]">
                                {(l.prix_unitaire * l.quantite).toLocaleString('fr-FR')} F
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Mode paiement */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Mode de paiement
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { val: 'espece', label: 'Espèce', icon: Banknote },
                        { val: 'carte', label: 'Carte', icon: CreditCard },
                        { val: 'mobile', label: 'Mobile', icon: Smartphone },
                        { val: 'virement', label: 'Virement', icon: Building2 },
                      ].map(({ val, label, icon: Icon }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setModePaiement(val)}
                          className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                            modePaiement === val
                              ? 'bg-[#2a5298] text-white shadow-md'
                              : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-[#2a5298]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Remise */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Remise (F)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={remise}
                      onChange={(e) => setRemise(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] bg-white"
                    />
                  </div>
                </div>

                {/* Résumé (bas) */}
                <div className="p-6 bg-white border-t border-slate-100 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Sous-total</span>
                    <span className="font-semibold">{total.toLocaleString('fr-FR')} F</span>
                  </div>
                  {remiseNum > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Remise</span>
                      <span className="font-semibold text-red-500">
                        -{remiseNum.toLocaleString('fr-FR')} F
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                    <span className="text-sm font-bold text-slate-700">TOTAL</span>
                    <span className="text-2xl font-extrabold text-[#1e3c72]">
                      {totalFinal.toLocaleString('fr-FR')} F
                    </span>
                  </div>

                  <button
                    onClick={handleSaveVente}
                    disabled={saving || cart.length === 0}
                    className="w-full py-3 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Valider la vente
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer cette vente ?"
        message={`Êtes-vous sûr de vouloir supprimer la vente "${deleteTarget?.numero}" ? Les lignes associées seront aussi supprimées.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
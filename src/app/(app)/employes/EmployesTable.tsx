'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Search, Plus, Pencil, Trash2, X, Loader2, Shield, User as UserIcon,
  Wrench, UserPlus, Mail, Phone, CheckCircle2, XCircle,
} from 'lucide-react'
import ConfirmDialog from '@/components/ConfirmDialog'

interface Employe {
  id: string
  nom: string
  email: string
  role: 'admin' | 'employe' | 'technicien'
  telephone: string | null
  actif: boolean
  created_at: string
}

interface Props {
  initialEmployes: Employe[]
  currentUserId: string
}

const emptyForm = {
  nom: '',
  email: '',
  telephone: '',
  role: 'employe' as Employe['role'],
  password: '',
}

export default function EmployesTable({ initialEmployes, currentUserId }: Props) {
  const supabase = createClient()
  const [employes, setEmployes] = useState<Employe[]>(initialEmployes)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'employe' | 'technicien'>('all')
  const [filterStatut, setFilterStatut] = useState<'all' | 'actif' | 'inactif'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employe | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Employe | null>(null)

  const filtered = employes.filter((e) => {
    const matchSearch =
      e.nom.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      (e.telephone?.includes(search) ?? false)
    const matchRole = filterRole === 'all' || e.role === filterRole
    const matchStatut =
      filterStatut === 'all' ||
      (filterStatut === 'actif' && e.actif) ||
      (filterStatut === 'inactif' && !e.actif)
    return matchSearch && matchRole && matchStatut
  })

  const stats = {
    total: employes.length,
    admins: employes.filter((e) => e.role === 'admin').length,
    employes: employes.filter((e) => e.role === 'employe').length,
    techniciens: employes.filter((e) => e.role === 'technicien').length,
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(e: Employe) {
    setEditing(e)
    setForm({
      nom: e.nom,
      email: e.email,
      telephone: e.telephone || '',
      role: e.role,
      password: '',
    })
    setModalOpen(true)
  }

  async function handleSave(formEvent: React.FormEvent) {
    formEvent.preventDefault()
    setSaving(true)

    if (editing) {
      // Modification
      const { data, error } = await supabase
        .from('profiles')
        .update({
          nom: form.nom,
          telephone: form.telephone || null,
          role: form.role,
        })
        .eq('id', editing.id)
        .select()
        .single()

      setSaving(false)

      if (error) {
        toast.error('Erreur : ' + error.message)
        return
      }

      setEmployes((prev) => prev.map((e) => (e.id === editing.id ? data : e)))
      toast.success('✅ Employé modifié')
      setModalOpen(false)
    } else {
      // Création : on utilise signUp pour créer un vrai compte
      if (!form.password || form.password.length < 6) {
        setSaving(false)
        toast.error('Le mot de passe doit faire au moins 6 caractères')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { nom: form.nom } },
      })

      if (error) {
        setSaving(false)
        toast.error('Erreur : ' + error.message)
        return
      }

      if (!data.user) {
        setSaving(false)
        toast.error('Impossible de créer le compte')
        return
      }

      // Met à jour le rôle et le téléphone dans profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .update({
          role: form.role,
          telephone: form.telephone || null,
        })
        .eq('id', data.user.id)
        .select()
        .single()

      setSaving(false)

      if (profileError) {
        toast.error('Compte créé mais erreur profil : ' + profileError.message)
        return
      }

      setEmployes((prev) => [profileData, ...prev])
      toast.success('✅ Employé invité (email envoyé)')
      setModalOpen(false)
    }
  }

  async function toggleActif(e: Employe) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ actif: !e.actif })
      .eq('id', e.id)
      .select()
      .single()

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setEmployes((prev) => prev.map((x) => (x.id === e.id ? data : x)))
    toast.success(data.actif ? '✅ Compte activé' : '⚠️ Compte désactivé')
  }

  async function handleDelete() {
    if (!deleteTarget) return

    if (deleteTarget.id === currentUserId) {
      toast.error('Vous ne pouvez pas vous supprimer vous-même')
      setDeleteTarget(null)
      return
    }

    // On ne peut pas supprimer auth.users via le client normal, on supprime juste le profil
    // (le compte auth reste orphelin, à nettoyer côté Supabase dashboard si besoin)
    const { error } = await supabase.from('profiles').delete().eq('id', deleteTarget.id)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setEmployes((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    toast.success('🗑️ Profil supprimé')
    setDeleteTarget(null)
  }

  function roleBadge(role: string) {
    const conf: Record<string, { color: string; label: string; icon: any }> = {
      admin: { color: 'bg-red-100 text-red-700', label: 'Admin', icon: Shield },
      employe: { color: 'bg-blue-100 text-blue-700', label: 'Employé', icon: UserIcon },
      technicien: { color: 'bg-purple-100 text-purple-700', label: 'Technicien', icon: Wrench },
    }
    const c = conf[role] || conf.employe
    const Icon = c.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.color}`}>
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
          <div className="text-2xl font-extrabold text-[#1e3c72]">{stats.total}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Admins</div>
          <div className="text-2xl font-extrabold text-red-500">{stats.admins}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Employés</div>
          <div className="text-2xl font-extrabold text-blue-500">{stats.employes}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="text-xs uppercase text-slate-500 font-semibold mb-1">Techniciens</div>
          <div className="text-2xl font-extrabold text-purple-500">{stats.techniciens}</div>
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
            placeholder="Rechercher un employé..."
            className="border-none outline-none text-sm w-full bg-transparent"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-[#2a5298] bg-white"
        >
          <option value="all">Tous les rôles</option>
          <option value="admin">Admins</option>
          <option value="employe">Employés</option>
          <option value="technicien">Techniciens</option>
        </select>

        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value as any)}
          className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:border-[#2a5298] bg-white"
        >
          <option value="all">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
        </select>

        <button
          onClick={openCreate}
          className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Inviter un employé
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nom</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Téléphone</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Inscrit le</th>
                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    {employes.length === 0
                      ? 'Aucun employé pour l\'instant.'
                      : 'Aucun résultat pour cette recherche.'}
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1e3c72] to-[#00c2ff] text-white flex items-center justify-center font-bold text-sm">
                          {e.nom.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-semibold text-slate-800">
                          {e.nom}
                          {e.id === currentUserId && (
                            <span className="ml-2 text-xs text-[#2a5298] font-bold">
                              (vous)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {e.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {e.telephone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {e.telephone}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">{roleBadge(e.role)}</td>
                    <td className="px-6 py-4">
                      {e.actif ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <CheckCircle2 className="w-3 h-3" /> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          <XCircle className="w-3 h-3" /> Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(e.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleActif(e)}
                          className={`w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center transition-all active:scale-90 ${
                            e.actif
                              ? 'hover:bg-amber-500 hover:text-white'
                              : 'hover:bg-green-500 hover:text-white'
                          }`}
                          title={e.actif ? 'Désactiver' : 'Activer'}
                        >
                          {e.actif ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openEdit(e)}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-[#2a5298] hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(e)}
                          disabled={e.id === currentUserId}
                          className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-red-500 hover:text-white text-slate-600 flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-5 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[slideUp_0.3s_ease]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-[#1e3c72]">
                  {editing ? 'Modifier l\'employé' : 'Inviter un employé'}
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] transition-all"
                  placeholder="Ahmed Diallo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editing}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] transition-all disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="employe@alpha-tec.com"
                />
                {editing && (
                  <p className="text-xs text-slate-400 mt-1">
                    L&apos;email ne peut pas être modifié.
                  </p>
                )}
              </div>

              {!editing && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Mot de passe temporaire *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] transition-all"
                    placeholder="•••••••• (min 6)"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    L&apos;employé pourra le changer plus tard.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Téléphone
                </label>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] transition-all"
                  placeholder="+227 90 00 00 00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Rôle *
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as Employe['role'] })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] bg-white transition-all"
                >
                  <option value="employe">Employé</option>
                  <option value="technicien">Technicien SAV</option>
                  <option value="admin">Administrateur</option>
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
                  className="flex-1 py-3 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Inviter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Supprimer cet employé ?"
        message={`Êtes-vous sûr de vouloir supprimer "${deleteTarget?.nom}" ? Le profil sera retiré, mais le compte d'authentification devra être supprimé manuellement dans Supabase.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  )
}
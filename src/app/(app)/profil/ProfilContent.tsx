'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  User, Mail, Phone, Shield, CheckCircle2, XCircle,
  Camera, Loader2, Lock, Eye, EyeOff, Calendar,
  Save, LogOut, BadgeCheck, Briefcase,
} from 'lucide-react'
import { ROLES, Role } from '@/lib/roles'

interface Profile {
  id: string
  nom: string
  email: string
  telephone: string | null
  role: string
  actif: boolean
  avatar_url: string | null
  bio: string | null
  created_at: string
}

interface Props {
  profile: Profile | null
  email: string
}

export default function ProfilContent({ profile, email }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Champs du formulaire
  const [nom, setNom] = useState(profile?.nom || '')
  const [telephone, setTelephone] = useState(profile?.telephone || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')

  // Changement de mot de passe
  const [showPwd, setShowPwd] = useState(false)
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [changingPwd, setChangingPwd] = useState(false)

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-slate-500">
        Impossible de charger votre profil.
      </div>
    )
  }

  const roleConfig = ROLES[profile.role as Role]
  const roleLabel = roleConfig?.label || profile.role
  const roleColor = roleConfig?.color || 'bg-slate-100 text-slate-700'
  const initiale = nom?.charAt(0).toUpperCase() || 'A'

  // 📸 Upload avatar
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo)')
      return
    }

    setUploading(true)
    const ext = file.name.split('.').pop()
    const fileName = `${profile!.id}-${Date.now()}.${ext}`

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { cacheControl: '3600', upsert: true })

    if (error) {
      setUploading(false)
      toast.error('Erreur upload : ' + error.message)
      return
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(data.path)

    // Mise à jour du profil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', profile!.id)

    setUploading(false)

    if (updateError) {
      toast.error('Erreur : ' + updateError.message)
      return
    }

    setAvatarUrl(urlData.publicUrl)
    toast.success('✅ Photo mise à jour')
    router.refresh()
  }

  // 💾 Enregistrer les infos
  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        nom,
        telephone: telephone || null,
        bio: bio || null,
      })
      .eq('id', profile!.id)

    setLoading(false)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    toast.success('✅ Profil mis à jour')
    router.refresh()
  }

  // 🔐 Changer le mot de passe
  async function handleChangePwd(e: React.FormEvent) {
    e.preventDefault()

    if (newPwd.length < 6) {
      toast.error('Le mot de passe doit faire au moins 6 caractères')
      return
    }
    if (newPwd !== confirmPwd) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setChangingPwd(true)

    const { error } = await supabase.auth.updateUser({ password: newPwd })

    setChangingPwd(false)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    toast.success('✅ Mot de passe modifié')
    setCurrentPwd('')
    setNewPwd('')
    setConfirmPwd('')
  }

  // 🚪 Déconnexion
  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success('Déconnecté')
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ══════════════════════════════════════════
          COLONNE GAUCHE — CARTE PROFIL
          ══════════════════════════════════════════ */}
      <div className="lg:col-span-1 space-y-6">

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Bannière colorée */}
          <div className="h-28 bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#00c2ff] relative">
            <div className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          </div>

          {/* Avatar */}
          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex flex-col items-center">
              <div className="relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={nom}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1e3c72] to-[#00c2ff] text-white flex items-center justify-center font-bold text-3xl border-4 border-white shadow-lg">
                    {initiale}
                  </div>
                )}

                {/* Bouton upload */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#2a5298] hover:bg-[#1e3c72] text-white flex items-center justify-center shadow-lg transition-all active:scale-90 disabled:opacity-70"
                  title="Changer la photo"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>

              {/* Nom + Email */}
              <h2 className="text-xl font-bold text-[#1e3c72] mt-4 text-center">
                {nom || 'Utilisateur'}
              </h2>
              <p className="text-sm text-slate-500 mt-1 text-center break-all">
                {email}
              </p>

              {/* Badge rôle */}
              <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${roleColor}`}>
                  <Shield className="w-3.5 h-3.5" />
                  {roleLabel.toUpperCase()}
                </span>

                {profile.actif ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    ACTIF
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                    <XCircle className="w-3.5 h-3.5" />
                    INACTIF
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Infos rapides */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
            Informations
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#2a5298] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Email</div>
                <div className="text-slate-700 truncate">{email}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Téléphone</div>
                <div className="text-slate-700 truncate">
                  {telephone || 'Non renseigné'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Rôle</div>
                <div className="text-slate-700">{roleLabel}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Membre depuis</div>
                <div className="text-slate-700">
                  {new Date(profile.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bouton déconnexion */}
          <button
            onClick={handleLogout}
            className="w-full mt-5 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold text-sm transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          COLONNE DROITE — FORMULAIRES
          ══════════════════════════════════════════ */}
      <div className="lg:col-span-2 space-y-6">

        {/* ✏️ Modifier les informations */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#1e3c72]">Modifier mes informations</h2>
              <p className="text-xs text-slate-500">
                Mettez à jour vos informations personnelles
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nom complet *
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
                  placeholder="Ahmed Diallo"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
                  placeholder="+227 90 00 00 00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-400 outline-none cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-1">
                L&apos;email ne peut pas être modifié.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Bio / Description
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all resize-none"
                placeholder="Quelques mots sur vous..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>

        {/* 🔐 Changer le mot de passe */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#1e3c72]">Sécurité</h2>
              <p className="text-xs text-slate-500">
                Changez votre mot de passe
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePwd} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nouveau mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="w-full px-4 py-2.5 pr-12 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirmer le mot de passe *
              </label>
              <input
                type={showPwd ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={changingPwd}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all disabled:opacity-70"
            >
              {changingPwd ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {changingPwd ? 'Modification...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
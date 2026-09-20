'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Zap } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Vérifie que l'utilisateur a bien une session (issue du lien email)
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        toast.error('Lien invalide ou expiré')
        setTimeout(() => router.push('/login'), 2000)
      } else {
        setReady(true)
      }
    })
  }, [router, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('Le mot de passe doit faire au moins 6 caractères')
      return
    }
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    toast.success('Mot de passe mis à jour !')
    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 1000)
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#00c2ff]">
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#00c2ff]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-7 h-7 text-[#1e3c72]" />
          <span className="text-2xl font-extrabold text-[#1e3c72]">Alpha-Tec</span>
        </div>

        <h1 className="text-2xl font-bold text-center text-[#1e3c72] mb-2">
          Nouveau mot de passe
        </h1>
        <p className="text-center text-slate-500 text-sm mb-8">
          Choisissez un nouveau mot de passe sécurisé
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
              placeholder="•••••••• (min 6)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Mise à jour...' : 'Mettre à jour'}
          </button>
        </form>

        <Link
          href="/login"
          className="block text-center text-sm text-[#2a5298] font-semibold hover:underline mt-6"
        >
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
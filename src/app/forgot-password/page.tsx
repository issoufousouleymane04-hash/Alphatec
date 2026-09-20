'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Zap, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)

    if (error) {
      toast.error('Erreur : ' + error.message)
      return
    }

    setSent(true)
    toast.success('Email envoyé !')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#00c2ff]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-7 h-7 text-[#1e3c72]" />
          <span className="text-2xl font-extrabold text-[#1e3c72]">Alpha-Tec</span>
        </div>

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold text-center text-[#1e3c72] mb-2">
              Mot de passe oublié ?
            </h1>
            <p className="text-center text-slate-500 text-sm mb-8">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
                  placeholder="vous@alpha-tec.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📬</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1e3c72] mb-2">
              Email envoyé !
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              Vérifiez votre boîte mail <strong>{email}</strong> et cliquez sur le lien pour réinitialiser votre mot de passe.
            </p>
            <p className="text-xs text-slate-400">
              ⚠️ Pensez à vérifier vos spams
            </p>
          </div>
        )}

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-[#2a5298] font-semibold hover:underline mt-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
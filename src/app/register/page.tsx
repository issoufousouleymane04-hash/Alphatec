'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Zap } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nom } },
    })

    if (error) {
      toast.error('Erreur : ' + error.message)
      setLoading(false)
      return
    }
    toast.success('Compte créé !')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#00c2ff]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-7 h-7 text-[#1e3c72]" />
          <span className="text-2xl font-extrabold text-[#1e3c72]">Alpha-Tec</span>
        </div>
        <h1 className="text-2xl font-bold text-center text-[#1e3c72] mb-2">Créer un compte</h1>
        <p className="text-center text-slate-500 text-sm mb-8">Rejoignez Alpha-Tec</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nom complet</label>
            <input
              type="text"
              required
              value={nom}
              onChange={e => setNom(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
              placeholder="Ahmed Diallo"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
              placeholder="vous@alpha-tec.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298]"
              placeholder="•••••••• (min 6)"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-slate-500">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#2a5298] font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Zap, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      toast.error('Erreur : ' + error.message)
      setLoading(false)
      return
    }

    toast.success('Connexion réussie !')
    router.refresh()
    window.location.href = '/dashboard'
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#00c2ff]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-7 h-7 text-[#1e3c72]" />
          <span className="text-2xl font-extrabold text-[#1e3c72]">Alpha-Tec</span>
        </div>

        <h1 className="text-2xl font-bold text-center text-[#1e3c72] mb-2">
          Bienvenue !
        </h1>
        <p className="text-center text-slate-500 text-sm mb-8">
          Connectez-vous et commencez l&apos;aventure
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
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

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-[#2a5298] transition-all"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-[#2a5298] font-semibold hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Connexion...' : "S'identifier"}
          </button>
        </form>

                <p className="text-center mt-6 text-sm text-slate-500">
          Nouveau ?{' '}
          <Link href="/register" className="text-[#2a5298] font-semibold hover:underline">
            Créer un compte
          </Link>
        </p>

        <p className="text-center mt-4 text-xs text-slate-400">
          En continuant, vous acceptez notre{' '}
          <Link href="/confidentialite" className="text-[#2a5298] hover:underline">
            politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  )
}
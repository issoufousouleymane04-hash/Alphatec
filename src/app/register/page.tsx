'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Zap, Eye, EyeOff, Phone } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [nom, setNom] = useState('')
  const [telephone, setTelephone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const phoneRegex = /^\+?[0-9]{8,15}$/
    if (!phoneRegex.test(telephone.replace(/\s/g, ''))) {
      toast.error('Numéro de téléphone invalide (ex : +227 90 00 00 00)')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      toast.error('Le mot de passe doit faire au moins 6 caractères')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nom,
          telephone,
        },
      },
    })

    if (error) {
      toast.error('Erreur : ' + error.message)
      setLoading(false)
      return
    }

    toast.success('Compte créé ! Vérifiez votre email.')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#00c2ff]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-7 h-7 text-[#1e3c72]" />
          <span className="text-2xl font-extrabold text-[#1e3c72]">Alpha-Tec</span>
        </div>

        <h1 className="text-2xl font-bold text-center text-[#1e3c72] mb-2">
          Créer un compte
        </h1>
        <p className="text-center text-slate-500 text-sm mb-8">Rejoignez Alpha-Tec</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nom complet *
            </label>
            <input
              type="text"
              required
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
              placeholder="Ahmed Diallo"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Téléphone *
            </label>
            <div className="relative">
              <input
                type="tel"
                required
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
                placeholder="+227 90 00 00 00"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Format international recommandé (ex : +227 90 00 00 00)
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email *
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
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-[#2a5298] focus:ring-4 focus:ring-[#2a5298]/10 transition-all"
                placeholder="•••••••• (min 6)"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
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

        <p className="text-center mt-4 text-xs text-slate-400">
          En créant un compte, vous acceptez notre{' '}
          <Link href="/confidentialite" className="text-[#2a5298] hover:underline">
            politique de confidentialité
          </Link>
        </p>
      </div>
    </div>
  )
}
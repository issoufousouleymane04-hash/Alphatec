import Link from 'next/link'
import { Phone, LogIn } from 'lucide-react'
import { VITRINE_CONFIG } from '@/config/vitrine'

export default function VitrineHeader() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/vitrine" className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-extrabold text-[#1e3c72]">
            {VITRINE_CONFIG.nom}
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={`tel:${VITRINE_CONFIG.telephone}`}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#f4f6fa] text-[#1e3c72] font-semibold text-sm hover:bg-[#e5e9f2] transition-colors"
          >
            <Phone className="w-4 h-4" />
            {VITRINE_CONFIG.telephoneAffichage}
          </a>

          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold text-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Se connecter</span>
            <span className="sm:hidden">Connexion</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
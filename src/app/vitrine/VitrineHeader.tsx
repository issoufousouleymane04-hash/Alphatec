import Link from 'next/link'
import { Phone, LogIn } from 'lucide-react'
import { VITRINE_CONFIG } from '@/config/vitrine'

export default function VitrineHeader() {
  return (
    <header
      className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-40"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
        {/* Logo */}
                <Link href="/vitrine" className="flex items-center gap-2 shrink-0">
          <img
            src="/logo/alpha-tec-icon.png"
            alt="Alpha-Tec"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover"
          />
          <span className="text-lg sm:text-xl font-extrabold text-[#1e3c72]">
            {VITRINE_CONFIG.nom}
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <a
            href={`tel:${VITRINE_CONFIG.telephone}`}
            className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-[#f4f6fa] text-[#1e3c72] font-semibold text-xs sm:text-sm hover:bg-[#e5e9f2] transition-colors shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{VITRINE_CONFIG.telephoneAffichage}</span>
            <span className="md:hidden">Appeler</span>
          </a>

          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white font-semibold text-xs sm:text-sm hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all shrink-0"
          >
            <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Se connecter</span>
            <span className="sm:hidden">Connexion</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
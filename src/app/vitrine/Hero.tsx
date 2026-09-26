import { Phone, MessageCircle, MapPin } from 'lucide-react'
import { VITRINE_CONFIG, WHATSAPP_MESSAGE } from '@/config/vitrine'

export default function Hero() {
  const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <section className="relative bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#00c2ff] text-white overflow-hidden">
      {/* Décor */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-[#00c2ff] blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-16 sm:py-24 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="text-5xl sm:text-6xl">⚡</span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            {VITRINE_CONFIG.nom}
          </h1>
        </div>

        {/* Slogan */}
        <p className="text-xl sm:text-2xl font-semibold text-white/90 mb-3">
          {VITRINE_CONFIG.slogan}
        </p>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-white/80 mb-8 text-sm sm:text-base leading-relaxed">
          {VITRINE_CONFIG.description}
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            Nous contacter sur WhatsApp
          </a>

          <a
            href={`tel:${VITRINE_CONFIG.telephone}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/15 backdrop-blur border border-white/30 hover:bg-white/25 text-white font-bold rounded-full transition-all"
          >
            <Phone className="w-5 h-5" />
            Appeler maintenant
          </a>
        </div>

        {/* Adresse */}
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-white/70">
          <MapPin className="w-4 h-4" />
          {VITRINE_CONFIG.adresse}, {VITRINE_CONFIG.ville}
        </div>
      </div>
    </section>
  )
}
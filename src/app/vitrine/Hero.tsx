'use client'

import { Phone, MessageCircle, MapPin, Wrench, Smartphone, Wifi, Star, Users, Award } from 'lucide-react'
import { VITRINE_CONFIG, WHATSAPP_MESSAGE } from '@/config/vitrine'

export default function Hero() {
  const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      const offsetTop = el.offsetTop - 80
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    }
  }

  return (
    <section className="relative bg-gradient-to-br from-[#0f172a] via-[#1e3c72] to-[#2a5298] text-white overflow-hidden">
      {/* Décors lumineux */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-20 w-96 h-96 rounded-full bg-[#00c2ff] opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 rounded-full bg-purple-500 opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-500 opacity-10 blur-3xl" />
      </div>

      {/* Grille décorative */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-20 sm:py-28 text-center">
        {/* Badge confiance */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-6">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold text-white/90">
            Service de confiance à Niamey
          </span>
        </div>

        {/* Logo principal */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <span className="text-4xl">⚡</span>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            {VITRINE_CONFIG.nom}
          </h1>
        </div>

        {/* Slogan */}
        <p className="text-2xl sm:text-3xl font-bold text-white/95 mb-4">
          {VITRINE_CONFIG.slogan}
        </p>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-white/70 mb-10 text-base sm:text-lg leading-relaxed">
          {VITRINE_CONFIG.description}
        </p>

        {/* Compteurs */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-2xl font-black text-white">500+</span>
            </div>
            <div className="text-xs text-white/60 font-semibold">Clients servis</div>
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-2xl font-black text-white">5+</span>
            </div>
            <div className="text-xs text-white/60 font-semibold">Années d&apos;expérience</div>
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <Star className="w-4 h-4 text-green-400" />
              <span className="text-2xl font-black text-white">4.9</span>
            </div>
            <div className="text-xs text-white/60 font-semibold">Note clients</div>
          </div>
        </div>

                {/* Navigation rapide */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            onClick={() => scrollTo('services')}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 hover:border-white/40 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            <Wrench className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Services
          </button>
          <button
            onClick={() => scrollTo('telephones')}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 hover:border-white/40 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            <Smartphone className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Téléphones
          </button>
          <button
            onClick={() => scrollTo('reseau')}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 hover:border-white/40 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5"
          >
            <Wifi className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Réseau
          </button>
        </div>

        {/* CTA principaux */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-full shadow-2xl shadow-green-500/30 hover:-translate-y-1 active:scale-95 transition-all"
          >
            <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Nous contacter sur WhatsApp
          </a>

          <a
            href={`tel:${VITRINE_CONFIG.telephone}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur border-2 border-white/30 hover:bg-white/20 text-white font-bold rounded-full transition-all hover:-translate-y-1"
          >
            <Phone className="w-5 h-5" />
            Appeler maintenant
          </a>
        </div>

        {/* Adresse */}
        <div className="flex items-center justify-center gap-2 text-sm text-white/60">
          <MapPin className="w-4 h-4" />
          {VITRINE_CONFIG.adresse}, {VITRINE_CONFIG.ville}
        </div>
      </div>

      {/* Vague en bas */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" className="w-full h-12 fill-[#f4f6fa]">
          <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1350,50 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>
    </section>
  )
}
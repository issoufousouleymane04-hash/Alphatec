'use client'

import { useEffect, useState } from 'react'
import {
  Phone, MessageCircle, MapPin, Wrench, Smartphone, Wifi,
  Star, Users, Award, Shield, Zap, TrendingUp,
} from 'lucide-react'
import { VITRINE_CONFIG, WHATSAPP_MESSAGE } from '@/config/vitrine'

export default function Hero() {
  const [counters, setCounters] = useState({ clients: 0, years: 0, note: 0 })

  const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  // Animation des compteurs
  useEffect(() => {
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      setCounters({
        clients: Math.floor(500 * progress),
        years: Math.floor(5 * progress),
        note: Math.round(4.9 * progress * 10) / 10,
      })
      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      const offsetTop = el.offsetTop - 80
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#0a0f1e]">
      {/* Dégradé animé */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1e3c72] to-[#2a5298] animate-[gradientShift_15s_ease_infinite] bg-[length:200%_200%]" />

      {/* Bulles lumineuses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-52 h-52 rounded-full bg-[#00c2ff] opacity-20 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-purple-500 opacity-20 blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Grille décorative */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '50px 50px',
        }}
      />

      {/* Contenu */}
      <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] sm:text-xs font-semibold text-white/90">
            Ouvert • Lundi-Samedi 8h-20h
          </span>
        </div>

                {/* Logo */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-[#00c2ff] rounded-2xl blur-2xl opacity-50 animate-pulse" />
            <img
              src="/logo/alpha-tec-icon.png"
              alt="Alpha-Tec"
              className="relative w-14 h-14 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-2xl"
            />
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
            {VITRINE_CONFIG.nom}
          </h1>
        </div>

        {/* Slogan */}
        <div className="mb-3">
          <p className="text-base sm:text-2xl lg:text-3xl font-bold text-white/95">
            <span className="bg-gradient-to-r from-[#00c2ff] to-white bg-clip-text text-transparent">
              Réparation
            </span>
            <span className="text-white/40 mx-1.5">•</span>
            <span className="bg-gradient-to-r from-[#00c2ff] to-white bg-clip-text text-transparent">
              Vente
            </span>
            <span className="text-white/40 mx-1.5">•</span>
            <span className="bg-gradient-to-r from-[#00c2ff] to-white bg-clip-text text-transparent">
              Déblocage
            </span>
          </p>
        </div>

        {/* Description */}
        <p className="max-w-xl mx-auto text-white/70 mb-5 text-xs sm:text-sm leading-relaxed px-2">
          Votre partenaire de confiance à Niamey pour la réparation, la vente de matériel
          informatique, les téléphones et le déblocage.
        </p>

        {/* Compteurs */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-lg mx-auto mb-6">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Users className="w-3 h-3 text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="text-base sm:text-2xl font-black text-white">
                {counters.clients}+
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/60 font-semibold">
              Clients
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Award className="w-3 h-3 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-base sm:text-2xl font-black text-white">
                {counters.years}+
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/60 font-semibold">
              Ans
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-2 sm:p-3 hover:bg-white/10 transition-all group">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Star className="w-3 h-3 text-green-400 fill-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-base sm:text-2xl font-black text-white">
                {counters.note}
              </span>
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/60 font-semibold">
              Note
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mb-6">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm rounded-full shadow-2xl shadow-green-500/40 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <MessageCircle className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">Contacter sur WhatsApp</span>
          </a>

          <a
            href={`tel:${VITRINE_CONFIG.telephone}`}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 hover:border-white/50 text-white font-bold text-sm rounded-full transition-all hover:-translate-y-1"
          >
            <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Appeler maintenant
          </a>
        </div>

        {/* Navigation rapide */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
          <button
            onClick={() => scrollTo('services')}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur border border-white/15 hover:bg-white/15 rounded-full text-[11px] sm:text-xs font-semibold text-white/90 hover:-translate-y-0.5 transition-all"
          >
            <Wrench className="w-3 h-3 group-hover:scale-110 transition-transform" />
            Services
          </button>

          <button
            onClick={() => scrollTo('telephones')}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur border border-white/15 hover:bg-white/15 rounded-full text-[11px] sm:text-xs font-semibold text-white/90 hover:-translate-y-0.5 transition-all"
          >
            <Smartphone className="w-3 h-3 group-hover:scale-110 transition-transform" />
            Téléphones
          </button>

          <button
            onClick={() => scrollTo('articles')}
            className="group flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur border border-white/15 hover:bg-white/15 rounded-full text-[11px] sm:text-xs font-semibold text-white/90 hover:-translate-y-0.5 transition-all"
          >
            <Wifi className="w-3 h-3 group-hover:scale-110 transition-transform" />
            Articles
          </button>
        </div>

        {/* Badges confiance */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-white/50">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-green-400" />
            <span>Garantie 1 an</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>Service rapide</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span>Techniciens certifiés</span>
          </div>
        </div>

        {/* Adresse */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-white/60">
          <MapPin className="w-3 h-3" />
          {VITRINE_CONFIG.adresse}, {VITRINE_CONFIG.ville}
        </div>
      </div>

      {/* Vague décorative */}
      <div className="absolute bottom-0 left-0 right-0 leading-none">
        <svg
          viewBox="0 0 1440 80"
          className="w-full h-8 sm:h-12 fill-[#f4f6fa]"
          preserveAspectRatio="none"
        >
          <path d="M0,40 C240,70 480,10 720,40 C960,70 1200,10 1440,40 L1440,80 L0,80 Z" />
        </svg>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  )
}
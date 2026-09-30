'use client'

import { useEffect, useState } from 'react'
import {
  Phone, MessageCircle, MapPin, Wrench, Smartphone, Package,
  Star, Users, Award, Shield, Zap, TrendingUp, Clock, Sparkles,
  Wifi, ArrowRight,
} from 'lucide-react'
import { VITRINE_CONFIG, WHATSAPP_MESSAGE } from '@/config/vitrine'

export default function Hero() {
  const [counters, setCounters] = useState({ clients: 0, years: 0, note: 0 })

  const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  useEffect(() => {
    const duration = 2200
    const steps = 70
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
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1e] via-[#1e3c72] to-[#2a5298] animate-[gradientShift_15s_ease_infinite] bg-[length:300%_300%]" />

      {/* Bulles lumineuses */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#00c2ff] opacity-25 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-purple-500 opacity-20 blur-3xl animate-pulse delay-1000" />
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

      {/* Particules flottantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-40 animate-[float_15s_ease-in-out_infinite]"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${10 + Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* ============================================================
          CONTENU
          ============================================================ */}
      <div className="relative max-w-4xl mx-auto px-4 py-10 sm:py-14 text-center">

        {/* ══════════════════════════════════════════
            1. BADGE "OUVERT"
            ══════════════════════════════════════════ */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-5 animate-[fadeInDown_0.8s_ease]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] sm:text-xs font-bold text-white/90">
            Ouvert maintenant • Lun-Sam 8h-20h
          </span>
        </div>

        {/* ══════════════════════════════════════════
            2. LOGO + 3. TITRE (une seule fois)
            ══════════════════════════════════════════ */}
        <div className="flex flex-col items-center gap-4 mb-5 animate-[fadeInUp_0.8s_ease_0.2s_backwards]">
          {/* Logo avec halo */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#00c2ff] via-purple-500 to-[#00c2ff] blur-2xl opacity-60 animate-pulse" />
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-[#00c2ff] to-purple-500 opacity-30 blur-xl animate-[spin_10s_linear_infinite]" />
            <div className="relative">
              <img
                src="/logo/alpha-tec-icon.png"
                alt="Alpha-Tec"
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-2xl"
              />
            </div>
          </div>

          {/* Titre unique */}
          <div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none">
              <span className="relative bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-2xl">
                Alpha-Tec
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="h-0.5 w-10 bg-gradient-to-r from-transparent to-[#00c2ff] rounded-full" />
              <Sparkles className="w-3.5 h-3.5 text-[#00c2ff] animate-pulse" />
              <span className="h-0.5 w-10 bg-gradient-to-l from-transparent to-[#00c2ff] rounded-full" />
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            4. SLOGAN en 3 badges
            ══════════════════════════════════════════ */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5 animate-[fadeInUp_0.8s_ease_0.3s_backwards]">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#00c2ff]/10 border border-[#00c2ff]/30 text-[#00c2ff] text-xs sm:text-sm font-bold">
            🔧 Réparation
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs sm:text-sm font-bold">
            🛒 Vente
          </span>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-300 text-xs sm:text-sm font-bold">
            🔓 Déblocage
          </span>
        </div>

        {/* ══════════════════════════════════════════
            5. DESCRIPTION COURTE
            ══════════════════════════════════════════ */}
        <p className="max-w-xl mx-auto text-white/70 mb-7 text-sm sm:text-base leading-relaxed animate-[fadeInUp_0.8s_ease_0.4s_backwards]">
          Votre partenaire de confiance à Niamey pour la réparation,
          la vente et le déblocage.
        </p>

        {/* ══════════════════════════════════════════
            6. COMPTEURS (plus gros)
            ══════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mb-8 animate-[fadeInUp_0.8s_ease_0.5s_backwards]">
          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-5 hover:bg-white/10 hover:border-[#00c2ff]/40 transition-all duration-300">
            <Users className="w-5 h-5 text-[#00c2ff] mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl sm:text-4xl font-black text-white mb-0.5">
              {counters.clients}+
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 font-bold uppercase tracking-wider">
              Clients servis
            </div>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-5 hover:bg-white/10 hover:border-yellow-400/40 transition-all duration-300">
            <Award className="w-5 h-5 text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl sm:text-4xl font-black text-white mb-0.5">
              {counters.years}+
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 font-bold uppercase tracking-wider">
              Ans d&apos;expérience
            </div>
          </div>

          <div className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:p-5 hover:bg-white/10 hover:border-green-400/40 transition-all duration-300">
            <Star className="w-5 h-5 text-green-400 fill-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-2xl sm:text-4xl font-black text-white mb-0.5">
              {counters.note}
            </div>
            <div className="text-[10px] sm:text-xs text-white/60 font-bold uppercase tracking-wider">
              Note clients
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            7. 2 GROS CTA
            ══════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-8 animate-[fadeInUp_0.8s_ease_0.6s_backwards]">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-7 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white font-bold text-base rounded-2xl shadow-2xl shadow-green-500/40 hover:-translate-y-1 active:scale-95 transition-all overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <MessageCircle className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">WhatsApp</span>
          </a>

          {/* Appeler */}
          <a
            href={`tel:${VITRINE_CONFIG.telephone}`}
            className="group flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 hover:border-[#00c2ff]/60 text-white font-bold text-base rounded-2xl transition-all hover:-translate-y-1"
          >
            <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Appeler
          </a>
        </div>

        {/* ══════════════════════════════════════════
            8. 3 RACCOURCIS (plus gros)
            ══════════════════════════════════════════ */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-2xl mx-auto mb-8 animate-[fadeInUp_0.8s_ease_0.7s_backwards]">
          <button
            onClick={() => scrollTo('services')}
            className="group bg-white/5 backdrop-blur border border-white/15 hover:bg-white/15 hover:border-[#00c2ff]/50 rounded-2xl p-3 sm:p-4 transition-all hover:-translate-y-1"
          >
            <Wrench className="w-5 h-5 text-[#00c2ff] mx-auto mb-1.5 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
            <div className="text-[11px] sm:text-sm font-bold text-white">Services</div>
            <div className="text-[9px] sm:text-[10px] text-white/50 mt-0.5">Voir tout</div>
          </button>

          <button
            onClick={() => scrollTo('telephones')}
            className="group bg-white/5 backdrop-blur border border-white/15 hover:bg-white/15 hover:border-purple-400/50 rounded-2xl p-3 sm:p-4 transition-all hover:-translate-y-1"
          >
            <Smartphone className="w-5 h-5 text-purple-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-[11px] sm:text-sm font-bold text-white">Téléphones</div>
            <div className="text-[9px] sm:text-[10px] text-white/50 mt-0.5">Android/iOS</div>
          </button>

          <button
            onClick={() => scrollTo('articles')}
            className="group bg-white/5 backdrop-blur border border-white/15 hover:bg-white/15 hover:border-green-400/50 rounded-2xl p-3 sm:p-4 transition-all hover:-translate-y-1"
          >
            <Package className="w-5 h-5 text-green-400 mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
            <div className="text-[11px] sm:text-sm font-bold text-white">Articles</div>
            <div className="text-[9px] sm:text-[10px] text-white/50 mt-0.5">Matériel</div>
          </button>
        </div>

        {/* ══════════════════════════════════════════
            9. BADGES DE CONFIANCE
            ══════════════════════════════════════════ */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 animate-[fadeInUp_0.8s_ease_0.8s_backwards]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30">
            <Shield className="w-3.5 h-3.5 text-green-400" />
            <span className="text-[10px] sm:text-xs font-bold text-green-300">Garantie 1 an</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30">
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[10px] sm:text-xs font-bold text-yellow-300">Service rapide</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] sm:text-xs font-bold text-blue-300">Techniciens certifiés</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            10. ADRESSE
            ══════════════════════════════════════════ */}
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(
            `${VITRINE_CONFIG.adresse}, ${VITRINE_CONFIG.ville}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center justify-center gap-2 text-[11px] sm:text-xs text-white/60 hover:text-white/90 transition-colors animate-[fadeInUp_0.8s_ease_0.9s_backwards]"
        >
          <MapPin className="w-3.5 h-3.5 group-hover:text-[#00c2ff] group-hover:scale-110 transition-all" />
          <span className="font-semibold border-b border-dashed border-white/20 group-hover:border-[#00c2ff] transition-colors">
            {VITRINE_CONFIG.adresse}, {VITRINE_CONFIG.ville}
          </span>
        </a>
      </div>

      {/* Vague décorative */}
      <div className="absolute bottom-0 left-0 right-0 leading-none">
        <svg
          viewBox="0 0 1440 80"
          className="w-full h-8 sm:h-12 fill-[#f4f6fa] dark:fill-[#121212]"
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
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-30px) translateX(20px); opacity: 0.6; }
          50% { transform: translateY(-15px) translateX(-20px); opacity: 0.4; }
          75% { transform: translateY(-40px) translateX(10px); opacity: 0.5; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  )
}
import {
  Unlock, Smartphone, Key, Radio, RefreshCw, Puzzle,
  Laptop, Wrench, Monitor, Headphones,
  Wifi, Lock, Globe, Network, Shield,
} from 'lucide-react'
import { VITRINE_CONFIG, WHATSAPP_MESSAGE } from '@/config/vitrine'

const SERVICES = [
  {
    emoji: '🔓',
    titre: 'FRP Android',
    description: 'Déblocage compte Google',
    prix: 'Dès 5 000 F',
    color: 'from-orange-400 to-red-400',
  },
  {
    emoji: '🍎',
    titre: 'iCloud',
    description: 'Déblocage iPhone / iPad',
    prix: 'Dès 15 000 F',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    emoji: '🔐',
    titre: 'Mot de passe',
    description: 'PIN, schéma, code écran',
    prix: 'Dès 3 000 F',
    color: 'from-purple-400 to-pink-400',
  },
  {
    emoji: '📡',
    titre: 'Déblocage SIM',
    description: 'Libération opérateur',
    prix: 'Dès 10 000 F',
    color: 'from-green-400 to-emerald-400',
  },
  {
    emoji: '🔄',
    titre: 'Flash',
    description: 'Firmware & mise à jour',
    prix: 'Dès 7 000 F',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    emoji: '🧩',
    titre: 'Root / Jailbreak',
    description: 'Root Android / iOS',
    prix: 'Dès 5 000 F',
    color: 'from-pink-400 to-rose-400',
  },
  {
    emoji: '💻',
    titre: 'Réparation PC',
    description: 'PC fixes et portables',
    prix: 'Sur devis',
    color: 'from-slate-400 to-slate-600',
  },
  {
    emoji: '🔧',
    titre: 'Maintenance',
    description: 'Nettoyage & optimisation',
    prix: 'Sur devis',
    color: 'from-indigo-400 to-blue-500',
  },
  {
    emoji: '⌨️',
    titre: 'Accessoires Info',
    description: 'Claviers, souris, écrans',
    prix: 'Dès 2 000 F',
    color: 'from-cyan-400 to-teal-500',
  },
  {
    emoji: '📱',
    titre: 'Accessoires Tél.',
    description: 'Chargeurs, coques, câbles',
    prix: 'Dès 1 000 F',
    color: 'from-fuchsia-400 to-purple-500',
  },
  {
    emoji: '📶',
    titre: 'WiFi Zone',
    description: 'Installation WiFi pro',
    prix: 'Sur devis',
    color: 'from-blue-500 to-indigo-500',
  },
  {
    emoji: '🔐',
    titre: 'Portail captif',
    description: 'Page de connexion WiFi',
    prix: 'Sur devis',
    color: 'from-teal-500 to-cyan-500',
  },
  {
    emoji: '🌐',
    titre: 'VPN',
    description: 'Configuration VPN sécurisé',
    prix: 'Sur devis',
    color: 'from-purple-500 to-violet-500',
  },
  {
    emoji: '🛡️',
    titre: 'Sécurité réseau',
    description: 'Pare-feu & surveillance',
    prix: 'Sur devis',
    color: 'from-red-500 to-rose-500',
  },
  {
    emoji: '🔌',
    titre: 'Câblage réseau',
    description: 'Switchs, routeurs, baies',
    prix: 'Sur devis',
    color: 'from-amber-500 to-yellow-500',
  },
]

export default function Services() {
  const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <section id="services" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-[#2a5298] text-xs font-bold uppercase tracking-widest mb-4">
          <span>🔧</span>
          Nos prestations
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-[#1e3c72] mb-4">
          Nos <span className="bg-gradient-to-r from-[#2a5298] to-[#00c2ff] bg-clip-text text-transparent">Services</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg">
          Interventions rapides et professionnelles, réalisées par nos techniciens certifiés.
        </p>
      </div>

      {/* 🎯 GRILLE : 2 col sur très petit, 3 col sur mobile, 4 col sur tablette, 5 col sur desktop */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {SERVICES.map((s) => (
          <div
            key={s.titre}
            className="group bg-white rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            {/* Bande colorée au hover */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.color} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500`}
            />

            {/* Icône ronde */}
            <div
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform mx-auto`}
            >
              <span className="text-2xl sm:text-3xl">{s.emoji}</span>
            </div>

            {/* Titre */}
            <h3 className="text-xs sm:text-sm font-bold text-[#1e3c72] mb-1 text-center leading-tight">
              {s.titre}
            </h3>

            {/* Description (cachée sur très petit) */}
            <p className="hidden xs:block text-[10px] sm:text-xs text-slate-500 text-center leading-tight mb-2">
              {s.description}
            </p>

            {/* Prix */}
            <div className="text-center pt-2 border-t border-slate-100">
              <span className="text-[10px] sm:text-xs font-bold text-[#2a5298]">
                {s.prix}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA en bas */}
      <div className="text-center mt-12">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-full shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all"
        >
          💬 Demander un devis
        </a>
      </div>
    </section>
  )
}
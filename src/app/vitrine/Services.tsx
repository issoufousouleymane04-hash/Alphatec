import {
  Unlock, Smartphone, Key, Radio, RefreshCw, Puzzle,
  Laptop, Wrench, Monitor, Headphones,
} from 'lucide-react'
import { VITRINE_CONFIG, WHATSAPP_MESSAGE } from '@/config/vitrine'

const SERVICES = [
  {
    emoji: '🔓',
    icon: Unlock,
    titre: 'FRP Android',
    description: 'Déblocage compte Google pour Samsung, Xiaomi, Huawei, Oppo…',
    prix: 'À partir de 5 000 F',
    color: 'from-orange-400 to-red-400',
  },
  {
    emoji: '🍎',
    icon: Smartphone,
    titre: 'iCloud Apple',
    description: 'Déblocage iCloud pour iPhone et iPad',
    prix: 'À partir de 15 000 F',
    color: 'from-blue-400 to-cyan-400',
  },
  {
    emoji: '🔐',
    icon: Key,
    titre: 'Mot de passe écran',
    description: 'Suppression du code PIN, schéma ou mot de passe',
    prix: 'À partir de 3 000 F',
    color: 'from-purple-400 to-pink-400',
  },
  {
    emoji: '📡',
    icon: Radio,
    titre: 'Déblocage SIM',
    description: 'Libération réseau opérateur et réparation IMEI',
    prix: 'À partir de 10 000 F',
    color: 'from-green-400 to-emerald-400',
  },
  {
    emoji: '🔄',
    icon: RefreshCw,
    titre: 'Flash / Firmware',
    description: 'Réinstallation complète et mise à jour système',
    prix: 'À partir de 7 000 F',
    color: 'from-yellow-400 to-orange-400',
  },
  {
    emoji: '🧩',
    icon: Puzzle,
    titre: 'Root / Jailbreak',
    description: 'Root Android ou Jailbreak iOS par technicien certifié',
    prix: 'À partir de 5 000 F',
    color: 'from-pink-400 to-rose-400',
  },
  {
    emoji: '💻',
    icon: Laptop,
    titre: 'Réparation ordinateurs',
    description: 'Réparation PC fixes et portables : écran, clavier, batterie, carte mère',
    prix: 'Sur devis',
    color: 'from-slate-400 to-slate-600',
  },
  {
    emoji: '🔧',
    icon: Wrench,
    titre: 'Maintenance informatique',
    description: 'Maintenance préventive, nettoyage, mise à jour, optimisation système',
    prix: 'Sur devis',
    color: 'from-indigo-400 to-blue-500',
  },
  {
    emoji: '⌨️',
    icon: Monitor,
    titre: 'Accessoires informatiques',
    description: 'Claviers, souris, écrans, câbles, imprimantes et plus',
    prix: 'Dès 2 000 F',
    color: 'from-cyan-400 to-teal-500',
  },
  {
    emoji: '📱',
    icon: Headphones,
    titre: 'Accessoires téléphoniques',
    description: 'Chargeurs, coques, écouteurs, câbles, batteries et plus',
    prix: 'Dès 1 000 F',
    color: 'from-fuchsia-400 to-purple-500',
  },
]

export default function Services() {
  const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="text-xs uppercase font-bold text-[#2a5298] tracking-widest mb-2">
          Nos prestations
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e3c72] mb-3">
          🔧 Nos Services
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Interventions rapides et professionnelles, réalisées par nos techniciens certifiés.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES.map((s) => (
          <div
            key={s.titre}
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.color} scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500`}
            />

            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} text-white flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}
            >
              <span className="text-3xl">{s.emoji}</span>
            </div>

            <h3 className="text-lg font-bold text-[#1e3c72] mb-2">{s.titre}</h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">{s.description}</p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-sm font-bold text-[#2a5298]">{s.prix}</span>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline"
              >
                Demander →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
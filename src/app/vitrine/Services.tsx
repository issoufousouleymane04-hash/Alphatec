'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, ChevronLeft, ChevronRight, Wrench } from 'lucide-react'
import { VITRINE_CONFIG, WHATSAPP_MESSAGE } from '@/config/vitrine'

interface Service {
  id: number
  titre: string
  description: string | null
  categorie: string
  emoji: string
  prix: string | null
  duree: string | null
  image_url: string | null
  actif: boolean
  ordre: number
}

interface Props {
  services: Service[]
}

const CATEGORIES = [
  { value: 'all', label: 'Tous', emoji: '✨' },
  { value: 'deblocage', label: 'Déblocage', emoji: '🔓' },
  { value: 'informatique', label: 'Informatique', emoji: '💻' },
  { value: 'accessoire', label: 'Accessoires', emoji: '🖱️' },
  { value: 'reseau', label: 'Réseau', emoji: '📶' },
  { value: 'autre', label: 'Autre', emoji: '📦' },
]

const CAT_LABEL: Record<string, string> = {
  deblocage: '🔓 Déblocage',
  informatique: '💻 Informatique',
  accessoire: '🖱️ Accessoire',
  reseau: '📶 Réseau',
  autre: '📦 Autre',
}

export default function Services({ services }: Props) {
  const [filter, setFilter] = useState('all')
  const [current, setCurrent] = useState(0)

  const active = services.filter((s) => s.actif)
  const filtered = active.filter((s) => filter === 'all' || s.categorie === filter)
  const withImages = filtered.filter((s) => s.image_url)

  useEffect(() => {
    if (withImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % withImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [withImages.length])

  function next() {
    setCurrent((c) => (c + 1) % withImages.length)
  }

  function prev() {
    setCurrent((c) => (c - 1 + withImages.length) % withImages.length)
  }

  if (active.length === 0) return null

  const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <section id="services" className="max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16 scroll-mt-20">
      {/* Titre */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-blue-50 text-[#2a5298] text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
          <span>🔧</span>
          Nos prestations
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-[#1e3c72] mb-3 sm:mb-4">
          Nos <span className="bg-gradient-to-r from-[#2a5298] to-[#00c2ff] bg-clip-text text-transparent">Services</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-lg px-2">
          Interventions rapides et professionnelles, réalisées par nos techniciens certifiés.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => { setFilter(c.value); setCurrent(0) }}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
              filter === c.value
                ? 'bg-gradient-to-br from-[#2a5298] to-[#00c2ff] text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Carrousel */}
      {withImages.length > 0 && (
        <div className="mb-10 sm:mb-14">
          <div className="relative bg-gradient-to-br from-[#1e3c72] to-[#2a5298] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <div className="aspect-[16/9] relative">
              {withImages.map((s, i) => (
                <div
                  key={s.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    i === current ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img src={s.image_url!} alt={s.titre} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-10 text-white">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-2.5 py-1 rounded-full mb-2">
                      {CAT_LABEL[s.categorie] || s.categorie}
                    </span>
                    <h3 className="text-lg sm:text-4xl font-extrabold mb-1 sm:mb-2">
                      {s.emoji} {s.titre}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                      {s.prix && <span className="font-bold">{s.prix}</span>}
                      {s.duree && <span className="text-white/70">⏱ {s.duree}</span>}
                    </div>
                  </div>
                </div>
              ))}

              {withImages.length > 1 && (
                <>
                  <button onClick={prev} className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button onClick={next} className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center">
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                    {withImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all ${
                          i === current ? 'w-6 sm:w-8 bg-white' : 'w-1.5 sm:w-2 bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grille */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-5">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="group bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden flex flex-col"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2a5298] to-[#00c2ff] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />

            {s.image_url ? (
              <div className="h-28 xs:h-32 sm:h-40 -mx-3 sm:-mx-5 -mt-3 sm:-mt-5 mb-3 bg-slate-100 overflow-hidden">
                <img src={s.image_url} alt={s.titre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform mx-auto">
                <span className="text-2xl sm:text-3xl">{s.emoji}</span>
              </div>
            )}

            <h3 className="text-xs sm:text-sm font-bold text-[#1e3c72] mb-1 text-center leading-tight">
              {s.titre}
            </h3>

            {s.description && (
              <p className="text-[10px] sm:text-xs text-slate-500 text-center leading-tight mb-2 line-clamp-2 hidden sm:block">
                {s.description}
              </p>
            )}

            {s.prix && (
              <div className="text-center pt-1.5 sm:pt-2 border-t border-slate-100 mb-1.5 sm:mb-2">
                <span className="text-[10px] sm:text-xs font-bold text-[#2a5298]">{s.prix}</span>
              </div>
            )}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-green-600 hover:text-white hover:bg-green-500 border border-green-500 rounded-lg py-1.5 transition-all"
            >
              Demander →
            </a>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          Aucun service dans cette catégorie.
        </div>
      )}
    </section>
  )
}
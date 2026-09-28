'use client'

import { useState } from 'react'
import { MessageCircle, Smartphone, ChevronLeft, ChevronRight } from 'lucide-react'
import { VITRINE_CONFIG } from '@/config/vitrine'

interface Telephone {
  id: number
  marque: string
  modele: string
  type: 'android' | 'iphone'
  stockage: string | null
  ram: string | null
  couleur: string | null
  etat: 'neuf' | 'reconditionne' | 'occasion'
  prix: number
  quantite: number
  image_url: string | null
  description: string | null
}

interface Props {
  telephones: Telephone[]
}

const ETATS: Record<string, { label: string; color: string; emoji: string }> = {
  neuf: { label: 'Neuf', color: 'bg-green-500', emoji: '✨' },
  reconditionne: { label: 'Reconditionné', color: 'bg-blue-500', emoji: '🔄' },
  occasion: { label: 'Occasion', color: 'bg-amber-500', emoji: '📱' },
}

export default function Telephones({ telephones }: Props) {
  const [filter, setFilter] = useState<'all' | 'android' | 'iphone'>('all')
  const [current, setCurrent] = useState(0)

  if (telephones.length === 0) {
    return null
  }

  const filtered = telephones.filter((t) => filter === 'all' || t.type === filter)
  const withImages = filtered.filter((t) => t.image_url)

  function next() {
    setCurrent((c) => (c + 1) % withImages.length)
  }

  function prev() {
    setCurrent((c) => (c - 1 + withImages.length) % withImages.length)
  }

  return (
    <section id="telephones" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-20">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-widest mb-4">
          <span>📱</span>
          Notre sélection
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-[#1e3c72] mb-4">
          Nos <span className="bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent">Téléphones</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-base sm:text-lg">
          Smartphones Android et iPhone neufs, reconditionnés ou d&apos;occasion.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
        <button
          onClick={() => setFilter('all')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Tous ({telephones.length})
        </button>
        <button
          onClick={() => setFilter('android')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            filter === 'android'
              ? 'bg-green-500 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          🤖 Android ({telephones.filter((t) => t.type === 'android').length})
        </button>
        <button
          onClick={() => setFilter('iphone')}
          className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
            filter === 'iphone'
              ? 'bg-slate-800 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          🍎 iPhone ({telephones.filter((t) => t.type === 'iphone').length})
        </button>
      </div>

      {/* Carrousel (si images) */}
      {withImages.length > 0 && (
        <div className="mb-14">
          <div className="relative bg-gradient-to-br from-[#1e3c72] to-[#2a5298] rounded-3xl overflow-hidden shadow-2xl">
            <div className="aspect-[16/9] relative">
              {withImages.map((t, i) => (
                <div
                  key={t.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    i === current ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img src={t.image_url!} alt={`${t.marque} ${t.modele}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${ETATS[t.etat].color}`}>
                        {ETATS[t.etat].emoji} {ETATS[t.etat].label}
                      </span>
                      <span className="text-xs text-white/70">
                        {t.type === 'iphone' ? '🍎 iPhone' : '🤖 Android'}
                      </span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl font-black mb-2">
                      {t.marque} {t.modele}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/80 mb-3">
                      {t.stockage && <span>💾 {t.stockage}</span>}
                      {t.ram && <span>🧠 {t.ram} RAM</span>}
                      {t.couleur && <span>🎨 {t.couleur}</span>}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-black">
                        {Number(t.prix).toLocaleString('fr-FR')} F
                      </div>
                      <a
                        href={`https://wa.me/${VITRINE_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Bonjour Alpha-Tec, je suis intéressé par : ${t.marque} ${t.modele}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 rounded-full text-sm font-bold transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Commander
                      </a>
                    </div>
                  </div>
                </div>
              ))}

              {withImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {withImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`h-2 rounded-full transition-all ${
                          i === current ? 'w-8 bg-white' : 'w-2 bg-white/50'
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

      {/* Grille téléphones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((t) => {
          const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
            `Bonjour Alpha-Tec, je suis intéressé par : ${t.marque} ${t.modele}`
          )}`

          return (
            <div
              key={t.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="h-56 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
                {t.image_url ? (
                  <img
                    src={t.image_url}
                    alt={`${t.marque} ${t.modele}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <Smartphone className="w-20 h-20 text-slate-300" />
                )}

                {/* Badge état */}
                <span
                  className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white ${ETATS[t.etat].color}`}
                >
                  {ETATS[t.etat].emoji} {ETATS[t.etat].label}
                </span>

                {/* Badge type */}
                <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-slate-700">
                  {t.type === 'iphone' ? '🍎 iPhone' : '🤖 Android'}
                </span>
              </div>

              {/* Contenu */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-black text-slate-800 text-lg mb-1">
                  {t.marque} {t.modele}
                </h3>

                {/* Caractéristiques */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {t.stockage && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-50 text-blue-700">
                      💾 {t.stockage}
                    </span>
                  )}
                  {t.ram && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-purple-50 text-purple-700">
                      🧠 {t.ram}
                    </span>
                  )}
                  {t.couleur && (
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-pink-50 text-pink-700">
                      🎨 {t.couleur}
                    </span>
                  )}
                </div>

                {t.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2 flex-1">
                    {t.description}
                  </p>
                )}

                {/* Prix + CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase">Prix</div>
                    <div className="text-xl font-black text-[#1e3c72]">
                      {Number(t.prix).toLocaleString('fr-FR')} F
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Commander
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          Aucun téléphone dans cette catégorie pour l&apos;instant.
        </div>
      )}
    </section>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Package, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { VITRINE_CONFIG } from '@/config/vitrine'

interface Article {
  id: number
  nom: string
  reference: string | null
  description: string | null
  categorie: string
  marque: string | null
  prix_vente: number
  quantite: number
  image_url: string | null
}

interface Props {
  articles: Article[]
}

const CATEGORIES = [
  { value: 'all', label: 'Tous', emoji: '📦' },
  { value: 'ordinateur', label: 'Ordinateurs', emoji: '💻' },
  { value: 'ecran', label: 'Écrans', emoji: '🖥️' },
  { value: 'accessoire', label: 'Accessoires', emoji: '🖱️' },
  { value: 'imprimante', label: 'Imprimantes', emoji: '🖨️' },
  { value: 'reseau', label: 'Réseau', emoji: '📡' },
]

const CATEGORIES_LABEL: Record<string, string> = {
  ordinateur: '💻 Ordinateur',
  ecran: '🖥️ Écran',
  accessoire: '🖱️ Accessoire',
  imprimante: '🖨️ Imprimante',
  reseau: '📡 Réseau',
  autre: '📦 Autre',
}

export default function Articles({ articles }: Props) {
  const [filter, setFilter] = useState('all')
  const [current, setCurrent] = useState(0)

  const filtered = articles.filter((a) => filter === 'all' || a.categorie === filter)
  const withImages = filtered.filter((a) => a.image_url)

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

  if (articles.length === 0) return null

  return (
    <section id="articles" className="max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16 scroll-mt-20">
      {/* Titre */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
          <span>💻</span>
          Notre matériel
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-[#1e3c72] mb-3 sm:mb-4">
          Nos <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Articles</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-lg px-2">
          Ordinateurs, écrans, imprimantes et accessoires informatiques disponibles en stock.
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
                ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md'
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
          <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <div className="aspect-[16/9] relative">
              {withImages.map((a, i) => (
                <div
                  key={a.id}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    i === current ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <img src={a.image_url!} alt={a.nom} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-10 text-white">
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-2.5 py-1 rounded-full mb-2">
                      {CATEGORIES_LABEL[a.categorie] || a.categorie}
                    </span>
                    <h3 className="text-lg sm:text-4xl font-extrabold mb-1 sm:mb-2 line-clamp-1">
                      {a.nom}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="text-xl sm:text-3xl font-extrabold">
                        {Number(a.prix_vente).toLocaleString('fr-FR')} F
                      </div>
                      <a
                        href={`https://wa.me/${VITRINE_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Bonjour Alpha-Tec, je suis intéressé par : ${a.nom}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500 hover:bg-green-600 rounded-full text-xs sm:text-sm font-bold transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Commander
                      </a>
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
        {filtered.map((a) => {
          const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
            `Bonjour Alpha-Tec, je suis intéressé par : ${a.nom}`
          )}`

          return (
            <div key={a.id} className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
              <div className="h-28 xs:h-32 sm:h-48 bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center relative overflow-hidden">
                {a.image_url ? (
                  <img src={a.image_url} alt={a.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Package className="w-10 h-10 sm:w-20 sm:h-20 text-purple-300" />
                )}
                <span className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-purple-500 text-white px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                  {CATEGORIES_LABEL[a.categorie] || a.categorie}
                </span>
                <span className={`absolute top-1.5 sm:top-3 right-1.5 sm:right-3 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
                  a.quantite < 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  {a.quantite < 5 ? `+ que ${a.quantite}` : 'En stock'}
                </span>
              </div>

              <div className="p-2.5 sm:p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 text-xs sm:text-base mb-0.5 sm:mb-1 line-clamp-2">
                  {a.nom}
                </h3>
                {a.reference && (
                  <div className="text-[9px] sm:text-xs text-slate-400 font-mono mb-1.5 sm:mb-3">
                    {a.reference}
                  </div>
                )}
                {a.description && (
                  <p className="text-[10px] sm:text-sm text-slate-500 mb-2 sm:mb-4 line-clamp-2 flex-1 hidden sm:block">
                    {a.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1.5 sm:pt-3 border-t border-slate-100 mt-auto">
                  <div>
                    <div className="text-[8px] sm:text-xs text-slate-400">Prix</div>
                    <div className="text-sm sm:text-xl font-extrabold text-[#1e3c72]">
                      {Number(a.prix_vente).toLocaleString('fr-FR')} F
                    </div>
                  </div>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden xs:inline">Commander</span>
                    <span className="xs:hidden">👉</span>
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          Aucun article dans cette catégorie.
        </div>
      )}
    </section>
  )
}
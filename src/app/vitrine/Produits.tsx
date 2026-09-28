'use client'

import { useState, useEffect } from 'react'
import { Package, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { VITRINE_CONFIG } from '@/config/vitrine'

interface Produit {
  id: number
  nom: string
  reference: string
  description: string | null
  prix_vente: number
  quantite: number
  image_url: string | null
  categories?: any  // 🎯 On accepte tout (objet OU tableau)
}

interface Props {
  produits: Produit[]
}

// 🎯 Helper pour extraire le nom de la catégorie
function getCategorieName(categories: any): string | null {
  if (!categories) return null
  if (Array.isArray(categories)) {
    return categories[0]?.nom || null
  }
  return categories.nom || null
}

export default function Produits({ produits }: Props) {
  const [current, setCurrent] = useState(0)

  const produitsAvecImages = produits.filter((p) => p.image_url)

  useEffect(() => {
    if (produitsAvecImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % produitsAvecImages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [produitsAvecImages.length])

  function next() {
    setCurrent((c) => (c + 1) % produitsAvecImages.length)
  }

  function prev() {
    setCurrent((c) => (c - 1 + produitsAvecImages.length) % produitsAvecImages.length)
  }

  return (
    <section id="articles" className="max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16 scroll-mt-20">
      {/* Titre */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
          <span>📱</span>
          Notre boutique
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-[#1e3c72] mb-3 sm:mb-4">
          Nos <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Articles</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-lg px-2">
          Découvrez notre sélection de matériel informatique et accessoires disponibles en stock.
        </p>
      </div>

      {/* 🎠 CARROUSEL */}
      {produitsAvecImages.length > 0 && (
        <div className="mb-10 sm:mb-14">
          <div className="relative bg-gradient-to-br from-[#1e3c72] to-[#2a5298] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <div className="aspect-[16/9] relative">
              {produitsAvecImages.map((p, i) => {
                const catName = getCategorieName(p.categories)
                return (
                  <div
                    key={p.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${
                      i === current ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <img
                      src={p.image_url!}
                      alt={p.nom}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-10 text-white">
                      {catName && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-2.5 py-1 rounded-full mb-2">
                          {catName}
                        </span>
                      )}
                      <h3 className="text-lg sm:text-4xl font-extrabold mb-1 sm:mb-2 line-clamp-1">
                        {p.nom}
                      </h3>
                      {p.description && (
                        <p className="text-white/80 text-xs sm:text-base mb-2 sm:mb-3 max-w-2xl line-clamp-2 hidden sm:block">
                          {p.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="text-xl sm:text-3xl font-extrabold">
                          {Number(p.prix_vente).toLocaleString('fr-FR')} F
                        </div>
                        <a
                          href={`https://wa.me/${VITRINE_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Bonjour Alpha-Tec, je suis intéressé par : ${p.nom}`
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
                )
              })}

              {produitsAvecImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                    {produitsAvecImages.map((_, i) => (
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

      {/* 🛍️ GRILLE PRODUITS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-5">
        {produits.map((p) => {
          const catName = getCategorieName(p.categories)
          const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
            /\D/g,
            ''
          )}?text=${encodeURIComponent(
            `Bonjour Alpha-Tec, je suis intéressé par : ${p.nom} (${p.reference})`
          )}`

          return (
            <div
              key={p.id}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="h-28 xs:h-32 sm:h-48 bg-gradient-to-br from-[#f4f6fa] to-[#e5e9f2] flex items-center justify-center relative overflow-hidden">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.nom}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <Package className="w-10 h-10 sm:w-20 sm:h-20 text-[#2a5298]/20 group-hover:scale-110 transition-transform duration-500" />
                )}

                {catName && (
                  <span className="absolute top-1.5 sm:top-3 left-1.5 sm:left-3 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#2a5298] text-white px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                    {catName}
                  </span>
                )}

                <span
                  className={`absolute top-1.5 sm:top-3 right-1.5 sm:right-3 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full ${
                    p.quantite < 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {p.quantite < 5 ? `+ que ${p.quantite}` : 'En stock'}
                </span>
              </div>

              <div className="p-2.5 sm:p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 text-xs sm:text-base mb-0.5 sm:mb-1 line-clamp-2">
                  {p.nom}
                </h3>
                <div className="text-[9px] sm:text-xs text-slate-400 font-mono mb-1.5 sm:mb-3">
                  {p.reference}
                </div>

                {p.description && (
                  <p className="text-[10px] sm:text-sm text-slate-500 mb-2 sm:mb-4 line-clamp-2 flex-1 hidden sm:block">
                    {p.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-1.5 sm:pt-3 border-t border-slate-100 mt-auto">
                  <div>
                    <div className="text-[8px] sm:text-xs text-slate-400">Prix</div>
                    <div className="text-sm sm:text-xl font-extrabold text-[#1e3c72]">
                      {Number(p.prix_vente).toLocaleString('fr-FR')} F
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

      {produits.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          Aucun article disponible pour l&apos;instant.
        </div>
      )}
    </section>
  )
}
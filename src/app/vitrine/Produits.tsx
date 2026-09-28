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
  categories?: { nom: string } | { nom: string }[] | null
}

interface Props {
  produits: Produit[]
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

  function getCategorie(p: Produit): string | null {
    if (!p.categories) return null
    if (Array.isArray(p.categories)) return p.categories[0]?.nom || null
    return p.categories.nom
  }

  return (
    <section id="articles" className="max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16 scroll-mt-20">
      <div className="text-center mb-8 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-purple-50 text-purple-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4">
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

      {/* Carrousel */}
      {produitsAvecImages.length > 0 && (
        <div className="mb-8 sm:mb-14">
          <div className="relative bg-gradient-to-br from-[#1e3c72] to-[#2a5298] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
            <div className="aspect-[16/9] relative">
              {produitsAvecImages.map((p, i) => (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-10 text-white">
                    {getCategorie(p) && (
                      <span className="inline-block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-2 py-0.5 sm:px-3 sm:py-1 rounded-full mb-1.5 sm:mb-2">
                        {getCategorie(p)}
                      </span>
                    )}
                    <h3 className="text-xl sm:text-4xl font-black mb-1 sm:mb-2">
                      {p.nom}
                    </h3>
                    <div className="text-2xl sm:text-3xl font-black mb-2 sm:mb-3">
                      {Number(p.prix_vente).toLocaleString('fr-FR')} F
                    </div>
                    <a
                      href={`https://wa.me/${VITRINE_CONFIG.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Bonjour Alpha-Tec, je suis intéressé par : ${p.nom}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 rounded-full text-xs sm:text-sm font-bold transition-all"
                    >
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Commander
                    </a>
                  </div>
                </div>
              ))}

              {produitsAvecImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
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

      {/* 🎯 GRILLE 2 → 3 → 4 COLONNES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {produits.map((p) => {
          const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
            /\D/g,
            ''
          )}?text=${encodeURIComponent(
            `Bonjour Alpha-Tec, je suis intéressé par : ${p.nom} (${p.reference})`
          )}`

          return (
            <div
              key={p.id}
              className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col relative"
            >
              {/* Bande animée */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 z-10" />

              {/* Image */}
              <div className="h-28 sm:h-40 bg-gradient-to-br from-[#f4f6fa] to-[#e5e9f2] flex items-center justify-center relative overflow-hidden">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.nom}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-[#2a5298]/20" />
                )}

                {getCategorie(p) && (
                  <span className="absolute top-1.5 sm:top-2.5 left-1.5 sm:left-2.5 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider bg-[#2a5298] text-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    {getCategorie(p)}
                  </span>
                )}

                <span
                  className={`absolute top-1.5 sm:top-2.5 right-1.5 sm:right-2.5 text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${
                    p.quantite < 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {p.quantite < 5 ? `${p.quantite}` : '✓'}
                </span>
              </div>

              {/* Contenu */}
              <div className="p-2.5 sm:p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 text-[11px] sm:text-sm mb-1 line-clamp-2 leading-tight">
                  {p.nom}
                </h3>

                <div className="text-[8px] sm:text-[10px] text-slate-400 font-mono mb-1.5 sm:mb-2">
                  {p.reference}
                </div>

                {/* Prix */}
                <div className="mt-auto pt-1.5 sm:pt-2 border-t border-slate-100">
                  <div className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase">Prix</div>
                  <div className="text-sm sm:text-lg font-black text-[#1e3c72] leading-tight">
                    {Number(p.prix_vente).toLocaleString('fr-FR')} F
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 sm:mt-2 flex items-center justify-center gap-1 text-[10px] sm:text-xs font-bold text-green-600 hover:text-white hover:bg-green-500 border border-green-500 rounded-lg py-1 sm:py-1.5 transition-all"
                  >
                    <MessageCircle className="w-3 h-3" />
                    Commander
                  </a>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
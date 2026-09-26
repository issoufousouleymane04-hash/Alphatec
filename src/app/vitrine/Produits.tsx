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
  categories?: { nom: string } | null
}

interface Props {
  produits: Produit[]
}

export default function Produits({ produits }: Props) {
  const [current, setCurrent] = useState(0)

  // Produits avec images pour le carrousel
  const produitsAvecImages = produits.filter((p) => p.image_url)

  // Auto-rotation toutes les 4 secondes
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
    <section className="max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <div className="text-xs uppercase font-bold text-[#2a5298] tracking-widest mb-2">
          Notre boutique
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e3c72] mb-3">
          📱 Nos Articles
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Découvrez notre sélection de matériel informatique et accessoires disponibles en stock.
        </p>
      </div>

      {/* 🎠 CARROUSEL D'IMAGES */}
      {produitsAvecImages.length > 0 && (
        <div className="mb-14">
          <div className="relative bg-gradient-to-br from-[#1e3c72] to-[#2a5298] rounded-3xl overflow-hidden shadow-2xl">
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
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Infos produit */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                    {p.categories?.nom && (
                      <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur px-3 py-1 rounded-full mb-2">
                        {p.categories.nom}
                      </span>
                    )}
                    <h3 className="text-2xl sm:text-4xl font-extrabold mb-2">
                      {p.nom}
                    </h3>
                    {p.description && (
                      <p className="text-white/80 text-sm sm:text-base mb-3 max-w-2xl line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="text-2xl sm:text-3xl font-extrabold">
                        {Number(p.prix_vente).toLocaleString('fr-FR')} F
                      </div>
                      <a
                        href={`https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
                          /\D/g,
                          ''
                        )}?text=${encodeURIComponent(
                          `Bonjour Alpha-Tec, je suis intéressé par : ${p.nom}`
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

              {/* Boutons précédent / suivant */}
              {produitsAvecImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center transition-all"
                    aria-label="Précédent"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur hover:bg-white/30 text-white flex items-center justify-center transition-all"
                    aria-label="Suivant"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Points indicateurs */}
              {produitsAvecImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {produitsAvecImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === current ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                      }`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 🛍️ GRILLE PRODUITS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Image du produit */}
              <div className="h-48 bg-gradient-to-br from-[#f4f6fa] to-[#e5e9f2] flex items-center justify-center relative overflow-hidden">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.nom}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <Package className="w-20 h-20 text-[#2a5298]/20 group-hover:scale-110 transition-transform duration-500" />
                )}

                {p.categories?.nom && (
                  <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-[#2a5298] text-white px-2.5 py-1 rounded-full">
                    {p.categories.nom}
                  </span>
                )}

                <span
                  className={`absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    p.quantite < 5 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {p.quantite < 5 ? `Plus que ${p.quantite}` : 'En stock'}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 text-base mb-1 line-clamp-2">{p.nom}</h3>
                <div className="text-xs text-slate-400 font-mono mb-3">{p.reference}</div>

                {p.description && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-1">
                    {p.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <div className="text-xs text-slate-400">Prix</div>
                    <div className="text-xl font-extrabold text-[#1e3c72]">
                      {Number(p.prix_vente).toLocaleString('fr-FR')} F
                    </div>
                  </div>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all"
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
    </section>
  )
}
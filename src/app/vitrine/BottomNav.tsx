'use client'

import { useState, useEffect } from 'react'
import {
  Home, Wrench, Smartphone, Package, Phone,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'top', label: 'Accueil', icon: Home },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'telephones', label: 'Téléphones', icon: Smartphone },
  { id: 'articles', label: 'Articles', icon: Package },
  { id: 'contact', label: 'Contact', icon: Phone },
]

export default function BottomNav() {
  const [active, setActive] = useState('top')
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 200

      for (const item of NAV_ITEMS) {
        if (item.id === 'top') {
          if (window.scrollY < 300) {
            setActive('top')
            break
          }
          continue
        }
        const el = document.getElementById(item.id)
        if (el) {
          const { offsetTop, offsetHeight } = el
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActive(item.id)
            break
          }
        }
      }

      const footer = document.querySelector('footer')
      if (footer) {
        const footerTop = footer.offsetTop
        setVisible(window.scrollY + window.innerHeight < footerTop + 100)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollTo(id: string) {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const el = document.getElementById(id)
    if (el) {
      const offsetTop = el.offsetTop - 80
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    }
  }

  return (
    <nav
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'
      }`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-full border border-slate-200 px-2 py-1.5 flex items-center gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = active === item.id

          return (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className={`relative flex flex-col items-center justify-center px-3 sm:px-4 py-2 rounded-full transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white shadow-lg scale-105'
                  : 'text-slate-500 hover:text-[#2a5298] hover:bg-slate-100'
              }`}
              aria-label={item.label}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span
                className={`text-[9px] sm:text-[10px] font-bold mt-0.5 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
'use client'

import { useState, useEffect } from 'react'
import {
  Wrench, Package, Wifi, Laptop, Phone, Smartphone,
} from 'lucide-react'

const TABS = [
  { id: 'services', label: 'Services', icon: Wrench, emoji: '🔧' },
  { id: 'telephones', label: 'Téléphones', icon: Smartphone, emoji: '📱' },
  { id: 'articles', label: 'Articles', icon: Package, emoji: '💻' },
  { id: 'reseau', label: 'Réseau & WiFi', icon: Wifi, emoji: '📶' },
  { id: 'informatique', label: 'Informatique', icon: Laptop, emoji: '🛠️' },
  { id: 'contact', label: 'Contact', icon: Phone, emoji: '📞' },
]

export default function VitrineTabs() {
  const [active, setActive] = useState<string>('services')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)

      const scrollPos = window.scrollY + 200
      for (const tab of TABS) {
        const el = document.getElementById(tab.id)
        if (el) {
          const { offsetTop, offsetHeight } = el
          if (scrollPos >= offsetTop && scrollPos < offsetTop + offsetHeight) {
            setActive(tab.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      const offsetTop = el.offsetTop - 80
      window.scrollTo({ top: offsetTop, behavior: 'smooth' })
    }
  }

  return (
    <div
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-slate-100'
          : 'bg-white/80 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1 py-3 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => scrollTo(tab.id)}
                className={`relative flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#1e3c72]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                {tab.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = active === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => scrollTo(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white shadow'
                    : 'text-slate-600 bg-slate-50'
                }`}
              >
                <span>{tab.emoji}</span>
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
'use client'

import { useEffect, useState, useRef } from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'

type Theme = 'light' | 'dark' | 'system'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('alpha-tec-theme') as Theme | null
    // 🎯 Par défaut : CLAIR si rien n'est sauvegardé
    setTheme(saved || 'light')
  }, [])

  function applyTheme(newTheme: Theme) {
    // Animation de rotation sur le bouton
    setSpinning(true)
    setTimeout(() => setSpinning(false), 600)

    // Animation de changement de thème global
    document.documentElement.classList.add('theme-changing')
    setTimeout(() => {
      document.documentElement.classList.remove('theme-changing')
    }, 500)

    setTheme(newTheme)
    localStorage.setItem('alpha-tec-theme', newTheme)

    const root = document.documentElement
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    if (newTheme === 'dark' || (newTheme === 'system' && prefersDark)) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    setOpen(false)
  }

  // Écoute les changements de préférence système
  useEffect(() => {
    if (theme !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  if (!mounted) {
    return (
      <button className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
        <Moon className="w-4 h-4 text-[#1e3c72]" />
      </button>
    )
  }

  const icons: Record<Theme, any> = {
    light: Sun,
    dark: Moon,
    system: Monitor,
  }
  const Icon = icons[theme]

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center text-[#1e3c72] hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all"
        aria-label="Changer de thème"
        title="Changer de thème"
      >
        <Icon className={`w-4 h-4 ${spinning ? 'theme-icon-spin' : ''}`} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-14 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5 w-48 animate-[fadeIn_0.15s_ease]">
            {/* Clair */}
            <button
              onClick={() => applyTheme('light')}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                theme === 'light'
                  ? 'bg-[#2a5298] text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Sun className="w-4 h-4" />
                <span>Clair</span>
              </div>
              {theme === 'light' && <Check className="w-4 h-4" />}
            </button>

            {/* Sombre */}
            <button
              onClick={() => applyTheme('dark')}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                theme === 'dark'
                  ? 'bg-[#2a5298] text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Moon className="w-4 h-4" />
                <span>Sombre</span>
              </div>
              {theme === 'dark' && <Check className="w-4 h-4" />}
            </button>

            {/* Système */}
            <button
              onClick={() => applyTheme('system')}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                theme === 'system'
                  ? 'bg-[#2a5298] text-white shadow-md'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4" />
                <span>Système</span>
              </div>
              {theme === 'system' && <Check className="w-4 h-4" />}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
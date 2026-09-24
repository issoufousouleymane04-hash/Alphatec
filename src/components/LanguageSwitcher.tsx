'use client'

import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

type Lang = 'fr' | 'en'

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<Lang>('fr')
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('alpha-tec-lang') as Lang | null
    if (saved) setLang(saved)
  }, [])

  function changeLang(newLang: Lang) {
    setLang(newLang)
    localStorage.setItem('alpha-tec-lang', newLang)
    setOpen(false)
  }

  if (!mounted) {
    return (
      <div className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center">
        🇫🇷
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="h-11 px-3 rounded-full bg-white shadow-sm flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all"
      >
        <span className="text-lg">{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</span>
        <span className="text-xs font-bold text-[#1e3c72] uppercase">
          {lang}
        </span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-14 z-50 bg-white rounded-xl shadow-2xl border border-slate-200 p-1 w-44 animate-[fadeIn_0.15s_ease]">
            <button
              onClick={() => changeLang('fr')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                lang === 'fr'
                  ? 'bg-[#2a5298] text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg">🇫🇷</span>
              <span>Français</span>
            </button>

            <button
              onClick={() => changeLang('en')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                lang === 'en'
                  ? 'bg-[#2a5298] text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="text-lg">🇬🇧</span>
              <span>English</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
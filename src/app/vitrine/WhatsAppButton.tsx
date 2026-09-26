'use client'

import { MessageCircle } from 'lucide-react'
import { VITRINE_CONFIG, WHATSAPP_MESSAGE } from '@/config/vitrine'

export default function WhatsAppButton() {
  const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
      aria-label="Contacter sur WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-3 bg-white text-slate-800 text-sm font-semibold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
        Discuter sur WhatsApp
      </span>
    </a>
  )
}
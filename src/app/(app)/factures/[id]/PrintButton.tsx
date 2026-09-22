'use client'

import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-5 py-2.5 bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white text-sm font-semibold rounded-xl flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 transition-all print:hidden"
    >
      <Printer className="w-4 h-4" />
      Imprimer / PDF
    </button>
  )
}
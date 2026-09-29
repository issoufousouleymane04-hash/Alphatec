import { Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react'
import { VITRINE_CONFIG, WHATSAPP_MESSAGE } from '@/config/vitrine'

export default function Contact() {
  const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <section id="contact" className="max-w-6xl mx-auto px-3 sm:px-4 py-12 sm:py-16 scroll-mt-20">
      {/* Titre */}
      <div className="text-center mb-10 sm:mb-14">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-green-50 text-green-700 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 sm:mb-4">
          <span>📞</span>
          Restons en contact
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-[#1e3c72] mb-3 sm:mb-4">
          Nous <span className="bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">Contacter</span>
        </h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-lg px-2">
          Une question ? Un devis ? Écrivez-nous ou passez directement en boutique.
        </p>
      </div>

      {/* 🎯 4 cartes sur une seule ligne (grid 2 mobile, 4 PC) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6">
        {/* Téléphone */}
        <a
          href={`tel:${VITRINE_CONFIG.telephone}`}
          className="flex flex-col items-center text-center p-3 sm:p-5 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
        >
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center group-hover:scale-110 transition-transform mb-2 sm:mb-3 shadow-md">
            <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            Téléphone
          </div>
          <div className="font-bold text-[#1e3c72] text-xs sm:text-sm leading-tight">
            {VITRINE_CONFIG.telephoneAffichage}
          </div>
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-center p-3 sm:p-5 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
        >
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform mb-2 sm:mb-3 shadow-md">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            WhatsApp
          </div>
          <div className="font-bold text-[#1e3c72] text-xs sm:text-sm leading-tight">
            {VITRINE_CONFIG.telephoneAffichage}
          </div>
        </a>

        {/* Email */}
        <a
          href={`mailto:${VITRINE_CONFIG.email}`}
          className="flex flex-col items-center text-center p-3 sm:p-5 bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
        >
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform mb-2 sm:mb-3 shadow-md">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            Email
          </div>
          <div className="font-bold text-[#1e3c72] text-[10px] sm:text-xs leading-tight break-all">
            {VITRINE_CONFIG.email}
          </div>
        </a>

        {/* Adresse */}
        <div className="flex flex-col items-center text-center p-3 sm:p-5 bg-white rounded-2xl shadow-sm">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center mb-2 sm:mb-3 shadow-md">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 tracking-wider mb-1">
            Adresse
          </div>
          <div className="font-bold text-[#1e3c72] text-xs sm:text-sm leading-tight">
            {VITRINE_CONFIG.adresse}
          </div>
          <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">
            {VITRINE_CONFIG.ville}
          </div>
        </div>
      </div>

      {/* 🎯 Horaires + CTA (2 colonnes sur PC) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Horaires */}
        <div className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[#1e3c72] text-sm sm:text-base">
              Horaires d&apos;ouverture
            </h3>
          </div>

          <div className="space-y-2.5">
            {VITRINE_CONFIG.horaires.map((h) => (
              <div
                key={h.jour}
                className="flex items-center justify-between text-xs sm:text-sm border-b border-slate-100 pb-2 last:border-0"
              >
                <span className="text-slate-500">{h.jour}</span>
                <span
                  className={`font-bold ${
                    h.heures === 'Fermé' ? 'text-red-500' : 'text-[#1e3c72]'
                  }`}
                >
                  {h.heures}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-5 sm:p-6 hover:-translate-y-1 hover:shadow-2xl transition-all relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <div className="text-lg sm:text-xl font-black">
                Discutons maintenant
              </div>
            </div>
            <p className="text-sm text-white/90 mb-4">
              Cliquez ici pour nous envoyer un message WhatsApp. Réponse en quelques minutes.
            </p>
            <div className="inline-flex items-center gap-2 text-sm font-bold bg-white/20 backdrop-blur px-4 py-2 rounded-full">
              Ouvrir WhatsApp →
            </div>
          </div>
        </a>
      </div>
    </section>
  )
}
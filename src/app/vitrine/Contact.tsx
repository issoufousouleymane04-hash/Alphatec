import { Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react'
import { VITRINE_CONFIG, WHATSAPP_MESSAGE } from '@/config/vitrine'

export default function Contact() {
  const whatsappUrl = `https://wa.me/${VITRINE_CONFIG.whatsapp.replace(
    /\D/g,
    ''
  )}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`

  return (
    <section className="max-w-6xl mx-auto px-4 py-16">
      {/* Titre */}
      <div className="text-center mb-12">
        <div className="text-xs uppercase font-bold text-[#2a5298] tracking-widest mb-2">
          Restons en contact
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1e3c72] mb-3">
          📞 Nous Contacter
        </h2>
        <p className="text-slate-500 max-w-xl mx-auto">
          Une question ? Un devis ? Écrivez-nous ou passez directement en boutique.
        </p>
      </div>

      {/* Grille contact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Colonne gauche : contacts */}
        <div className="space-y-4">
          {/* Téléphone */}
          <a
            href={`tel:${VITRINE_CONFIG.telephone}`}
            className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Téléphone
              </div>
              <div className="font-bold text-[#1e3c72]">
                {VITRINE_CONFIG.telephoneAffichage}
              </div>
            </div>
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                WhatsApp
              </div>
              <div className="font-bold text-[#1e3c72]">
                {VITRINE_CONFIG.telephoneAffichage}
              </div>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${VITRINE_CONFIG.email}`}
            className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Email
              </div>
              <div className="font-bold text-[#1e3c72] break-all">
                {VITRINE_CONFIG.email}
              </div>
            </div>
          </a>

          {/* Adresse */}
          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Adresse
              </div>
              <div className="font-bold text-[#1e3c72]">
                {VITRINE_CONFIG.adresse}
              </div>
              <div className="text-sm text-slate-500">{VITRINE_CONFIG.ville}</div>
            </div>
          </div>
        </div>

        {/* Colonne droite : horaires + CTA */}
        <div className="space-y-4">
          {/* Horaires */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#1e3c72]">Horaires d&apos;ouverture</h3>
            </div>

            <div className="space-y-3">
              {VITRINE_CONFIG.horaires.map((h) => (
                <div
                  key={h.jour}
                  className="flex items-center justify-between text-sm border-b border-slate-100 pb-2 last:border-0"
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
            className="block bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 hover:-translate-y-1 hover:shadow-xl transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <MessageCircle className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <div className="text-xl font-extrabold">Discutons maintenant</div>
            </div>
            <p className="text-sm text-white/90">
              Cliquez ici pour nous envoyer un message WhatsApp. Réponse en quelques minutes.
            </p>
          </a>
        </div>
      </div>
    </section>
  )
}
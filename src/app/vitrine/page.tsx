import { createClient } from '@/lib/supabase/server'
import VitrineHeader from './VitrineHeader'
import Hero from './Hero'
import VitrineTabs from './VitrineTabs'
import Services from './Services'
import Telephones from './Telephones'
import Articles from './Articles'
import Contact from './Contact'
import WhatsAppButton from './WhatsAppButton'
import BottomNav from './BottomNav'

export const dynamic = 'force-dynamic'

export default async function VitrinePage() {
  const supabase = await createClient()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('actif', true)
    .order('ordre', { ascending: true })

  const { data: telephones } = await supabase
    .from('telephones')
    .select('*')
    .gt('quantite', 0)
    .order('created_at', { ascending: false })
    .limit(20)

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .gt('quantite', 0)
    .order('created_at', { ascending: false })
    .limit(20)

  return (
        <div id="top" className="min-h-screen bg-[#f4f6fa]">
      <VitrineHeader />
      <Hero />
      <VitrineTabs />
      <Services services={services || []} />
      <Telephones telephones={telephones || []} />
      <Articles articles={articles || []} />
      <div id="reseau" className="scroll-mt-20" />
      <div id="informatique" className="scroll-mt-20" />
      <Contact />
      <WhatsAppButton />
      <BottomNav />

      <footer className="bg-gradient-to-br from-[#0f172a] to-[#1e3c72] text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">⚡</span>
                <span className="text-2xl font-black">Alpha-Tec</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Votre partenaire de confiance pour la réparation, la vente de matériel
                informatique et le déblocage de téléphones.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Nos services</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>🔓 Déblocage FRP / iCloud</li>
                <li>💻 Réparation ordinateurs</li>
                <li>📱 Vente Android & iPhone</li>
                <li>💻 Vente matériel informatique</li>
                <li>📶 Installation WiFi Zone</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Nous contacter</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>📞 +227 99 42 50 24</li>
                <li>📧 contact@alpha-tec.com</li>
                <li>📍 Quartier Talladje, vers la CNSS</li>
                <li>🕐 Lun-Sam : 08h - 20h</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Alpha-Tec — Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
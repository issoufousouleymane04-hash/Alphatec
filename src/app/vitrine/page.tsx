import { createClient } from '@/lib/supabase/server'
import VitrineHeader from './VitrineHeader'
import Hero from './Hero'
import Services from './Services'
import Produits from './Produits'
import Contact from './Contact'
import WhatsAppButton from './WhatsAppButton'

export const dynamic = 'force-dynamic'

export default async function VitrinePage() {
  const supabase = await createClient()

  // Récupère les produits en stock
  const { data: produits } = await supabase
  .from('produits')
  .select('id, nom, reference, description, prix_vente, quantite, image_url, categories(nom)')
  .gt('quantite', 0)
  .order('nom')
  .limit(12)

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      <VitrineHeader />
      <Hero />
      <Services />
      <Produits produits={produits || []} />
      <Contact />
      <WhatsAppButton />

      {/* Footer */}
      <footer className="bg-[#0f172a] text-white py-8 mt-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">⚡</span>
            <span className="text-xl font-extrabold">Alpha-Tec</span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Alpha-Tec — Tous droits réservés
          </p>
        </div>
      </footer>
    </div>
  )
}
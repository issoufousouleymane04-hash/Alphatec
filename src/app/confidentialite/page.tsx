import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-[#f4f6fa] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-[#2a5298] font-semibold hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3c72] to-[#2a5298] text-white flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1e3c72]">Politique de confidentialité</h1>
              <p className="text-sm text-slate-500">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-slate-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-[#1e3c72] mb-2">1. Collecte des données</h2>
              <p>
                Alpha-Tec collecte uniquement les données strictement nécessaires à la gestion
                de ses activités commerciales et techniques. Ces données incluent :
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Nom et prénom du client</li>
                <li>Adresse email et numéro de téléphone</li>
                <li>Adresse postale (facultatif)</li>
                <li>Historique des ventes, réparations et services</li>
                <li>Informations techniques des appareils (marque, modèle, IMEI)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1e3c72] mb-2">2. Utilisation des données</h2>
              <p>Vos données sont utilisées uniquement pour :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Gérer vos commandes, ventes et réparations</li>
                <li>Vous contacter en cas de besoin (suivi SAV, facturation)</li>
                <li>Établir vos factures et documents commerciaux</li>
                <li>Assurer le suivi de la garantie et du service après-vente</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1e3c72] mb-2">3. Conservation des données</h2>
              <p>
                Vos données sont conservées pendant la durée nécessaire à la gestion
                de la relation commerciale et pendant la période légale de conservation
                des documents comptables (10 ans au Niger).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1e3c72] mb-2">4. Partage des données</h2>
              <p>
                <strong>Alpha-Tec ne vend ni ne partage vos données personnelles</strong> avec
                des tiers, sauf :
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Obligation légale (réquisition judiciaire)</li>
                <li>Nécessité technique (fournisseurs d&apos;hébergement)</li>
              </ul>
              <p className="mt-2">
                Nos serveurs sont hébergés via <strong>Supabase</strong> et <strong>Vercel</strong>,
                qui respectent les standards internationaux de sécurité (chiffrement SSL, RGPD).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1e3c72] mb-2">5. Sécurité</h2>
              <p>
                Nous mettons en œuvre les mesures techniques appropriées pour protéger
                vos données contre tout accès non autorisé :
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Chiffrement HTTPS sur toutes les communications</li>
                <li>Mots de passe hashés (bcrypt)</li>
                <li>Sécurité par rôles (Row Level Security)</li>
                <li>Sauvegardes régulières</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1e3c72] mb-2">6. Vos droits</h2>
              <p>Conformément aux réglementations en vigueur, vous disposez des droits suivants :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Droit d&apos;accès</strong> : consulter vos données</li>
                <li><strong>Droit de rectification</strong> : corriger vos données</li>
                <li><strong>Droit à l&apos;effacement</strong> : demander la suppression</li>
                <li><strong>Droit d&apos;opposition</strong> : refuser certains traitements</li>
              </ul>
              <p className="mt-2">
                Pour exercer ces droits, contactez-nous par email ou téléphone (voir ci-dessous).
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1e3c72] mb-2">7. Cookies</h2>
              <p>
                Alpha-Tec utilise uniquement des <strong>cookies techniques</strong> nécessaires
                au fonctionnement (session de connexion, préférences d&apos;affichage).
                Aucun cookie publicitaire ou de tracking n&apos;est utilisé.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#1e3c72] mb-2">8. Contact</h2>
              <p>Pour toute question concernant cette politique :</p>
              <ul className="list-none space-y-1 mt-2">
                <li>📧 Email : <strong>contact@alpha-tec.com</strong></li>
                <li>📞 Téléphone : <strong>+227 90 00 00 00</strong></li>
                <li>📍 Adresse : <strong>Niamey, Niger</strong></li>
              </ul>
            </section>

            <section className="bg-blue-50 border-l-4 border-[#2a5298] p-4 rounded-lg mt-8">
              <p className="text-sm text-slate-700">
                <strong>Note :</strong> En utilisant notre plateforme, vous acceptez les
                termes de cette politique de confidentialité.
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} Alpha-Tec — Tous droits réservés
          </div>
        </div>
      </div>
    </div>
  )
}
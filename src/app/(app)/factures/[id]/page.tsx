import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Printer } from 'lucide-react'
import PrintButton from './PrintButton'

export default async function FactureDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Récupère la facture + client + vente + vendeur (profiles via vendeur_id)
  const { data: facture } = await supabase
    .from('factures')
    .select(`
      *,
      clients(nom, email, telephone, adresse, ville),
      ventes(
        numero,
        mode_paiement,
        created_at,
        remise,
        profiles!vendeur_id(nom, role)
      )
    `)
    .eq('id', id)
    .single()

  if (!facture) notFound()

  const { data: lignes } = await supabase
    .from('lignes_vente')
    .select('*, produits(nom, reference)')
    .eq('vente_id', facture.vente_id)

  // Récupère le vendeur (depuis la vente liée)
  const vendeur = facture.ventes?.profiles
  const vendeurNom = vendeur?.nom || 'Comptoir'
  const vendeurRole = vendeur?.role || 'vendeur'

  const labelsRole: Record<string, string> = {
    admin: 'Administrateur',
    caissier: 'Caissier',
    technicien: 'Technicien',
    employe: 'Employé',
  }
  const vendeurRoleLabel = labelsRole[vendeurRole] || vendeurRole

  const labelsPaiement: Record<string, string> = {
    espece: 'Espèces',
    carte: 'Carte bancaire',
    virement: 'Virement',
    mobile: 'Paiement mobile',
  }
  const modePaiement = facture.ventes?.mode_paiement
    ? labelsPaiement[facture.ventes.mode_paiement] || facture.ventes.mode_paiement
    : '—'

  return (
    <div className="min-h-screen bg-[#f4f6fa] p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Barre d'actions (cachée à l'impression) */}
        <div className="flex items-center justify-between mb-6 print:hidden">
          <Link
            href="/factures"
            className="flex items-center gap-2 text-[#2a5298] font-semibold hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux factures
          </Link>
          <PrintButton />
        </div>

        {/* LA FACTURE */}
        <div className="bg-white rounded-2xl shadow-lg p-10 print:shadow-none print:rounded-none">
          {/* Header — Logo + N° facture */}
          <div className="flex items-start justify-between mb-10 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">⚡</span>
                <span className="text-2xl font-extrabold text-[#1e3c72]">Alpha-Tec</span>
              </div>
              <div className="text-sm text-slate-500">
                <div>Niamey, Niger</div>
                <div>contact@alpha-tec.com</div>
                <div>+227 90 00 00 00</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-[#1e3c72] mb-1">FACTURE</div>
              <div className="text-sm font-mono font-bold text-slate-700">
                {facture.numero}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Date : {new Date(facture.created_at).toLocaleDateString('fr-FR')}
              </div>
              {facture.date_echeance && (
                <div className="text-xs text-slate-500">
                  Échéance : {new Date(facture.date_echeance).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>
          </div>

          {/* Client + Vendeur (2 colonnes) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Client */}
            <div>
              <div className="text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">
                Facturé à
              </div>
              <div className="text-lg font-bold text-[#1e3c72]">
                {facture.clients?.nom || 'Client non renseigné'}
              </div>
              {facture.clients?.adresse && (
                <div className="text-sm text-slate-600">{facture.clients.adresse}</div>
              )}
              {facture.clients?.ville && (
                <div className="text-sm text-slate-600">{facture.clients.ville}</div>
              )}
              {facture.clients?.email && (
                <div className="text-sm text-slate-600">{facture.clients.email}</div>
              )}
              {facture.clients?.telephone && (
                <div className="text-sm text-slate-600">{facture.clients.telephone}</div>
              )}
            </div>

            {/* Vendeur */}
            <div>
              <div className="text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">
                Vendu par
              </div>
              <div className="text-lg font-bold text-[#1e3c72]">
                {vendeurNom}
              </div>
              <div className="text-sm text-slate-600">{vendeurRoleLabel}</div>
              {facture.ventes?.created_at && (
                <div className="text-xs text-slate-400 mt-2">
                  Vente du {new Date(facture.ventes.created_at).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
              {facture.ventes?.numero && (
                <div className="text-xs text-slate-400 font-mono mt-1">
                  Vente liée : {facture.ventes.numero}
                </div>
              )}
            </div>
          </div>

          {/* Tableau des lignes */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-3 text-xs font-bold text-slate-500 uppercase">
                  Produit
                </th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">
                  Qté
                </th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">
                  P.U.
                </th>
                <th className="text-right py-3 text-xs font-bold text-slate-500 uppercase">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {(lignes || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-slate-400 text-sm">
                    Aucune ligne détaillée
                  </td>
                </tr>
              ) : (
                (lignes || []).map((l) => (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="py-3">
                      <div className="font-semibold text-slate-800">
                        {l.produits?.nom || 'Produit'}
                      </div>
                      {l.produits?.reference && (
                        <div className="text-xs text-slate-400 font-mono">
                          {l.produits.reference}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-right text-slate-700">{l.quantite}</td>
                    <td className="py-3 text-right text-slate-700">
                      {Number(l.prix_unitaire).toLocaleString('fr-FR')} F
                    </td>
                    <td className="py-3 text-right font-bold text-slate-800">
                      {Number(l.sous_total).toLocaleString('fr-FR')} F
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Totaux + Mode paiement */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
            {/* Mode paiement à gauche */}
            <div className="w-full sm:w-auto">
              <div className="text-xs uppercase font-bold text-slate-400 mb-1 tracking-wider">
                Mode de paiement
              </div>
              <div className="text-sm font-semibold text-slate-700">
                {modePaiement}
              </div>
            </div>

            {/* Totaux à droite */}
            <div className="w-full sm:max-w-xs space-y-2">
              {facture.ventes?.remise && Number(facture.ventes.remise) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Remise</span>
                  <span className="font-semibold text-red-500">
                    -{Number(facture.ventes.remise).toLocaleString('fr-FR')} F
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t-2 border-slate-200">
                <span className="font-bold text-slate-700">TOTAL</span>
                <span className="text-2xl font-extrabold text-[#1e3c72]">
                  {Number(facture.montant).toLocaleString('fr-FR')} F
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2">
                <span className="text-slate-500">Statut</span>
                <span
                  className={`font-bold uppercase ${
                    facture.statut === 'payee'
                      ? 'text-green-600'
                      : facture.statut === 'partielle'
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }`}
                >
                  {facture.statut === 'payee'
                    ? 'PAYÉE'
                    : facture.statut === 'partielle'
                    ? 'PARTIELLE'
                    : 'IMPAYÉE'}
                </span>
              </div>
            </div>
          </div>

          {/* Signature vendeur */}
          <div className="mt-10 pt-6 border-t border-slate-100 flex justify-between items-end text-xs text-slate-400">
            <div>
              <div className="mb-8">Signature client</div>
              <div className="border-t border-slate-300 w-40"></div>
            </div>
            <div className="text-right">
              <div className="mb-8">Signature vendeur</div>
              <div className="border-t border-slate-300 w-40 ml-auto"></div>
              <div className="mt-1 font-semibold text-slate-500">{vendeurNom}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
            Merci de votre confiance • Alpha-Tec © {new Date().getFullYear()}
          </div>
        </div>
      </div>
    </div>
  )
}
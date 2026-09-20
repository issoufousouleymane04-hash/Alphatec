'use client'

import { toast } from 'sonner'

const activites = [
  { client: 'Société Alpha', type: 'Facture', montant: '1 200 F', statut: 'ok', label: 'Payée' },
  { client: 'SARL Bêta', type: 'Devis', montant: '850 F', statut: 'wait', label: 'En attente' },
  { client: 'Entreprise Gamma', type: 'Facture', montant: '2 340 F', statut: 'ok', label: 'Payée' },
  { client: 'Martin Dupont', type: 'SAV', montant: '180 F', statut: 'danger', label: 'Urgent' },
]

const badge: Record<string, string> = {
  ok: 'bg-green-100 text-green-700',
  wait: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
}

export default function ActivitesTable() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-[#1e3c72]">Dernières activités</h2>
      </div>
      <ul className="space-y-3">
        {activites.map((a, i) => (
          <li
            key={i}
            onClick={() => toast.success(`${a.client} — ${a.montant}`)}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 hover:translate-x-1 active:scale-[0.98] cursor-pointer transition-all"
          >
            <div>
              <div className="text-sm font-semibold text-slate-800">{a.client}</div>
              <div className="text-xs text-slate-500">{a.type}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-[#1e3c72]">{a.montant}</div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge[a.statut]}`}>
                {a.label}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import KpiCard from '@/components/KpiCard'
import VentesChart from './VentesChart'
import ActivitesTable from './ActivitesTable'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  const { count: savCount } = await supabase
    .from('tickets_sav')
    .select('*', { count: 'exact', head: true })
    .in('statut', ['recu', 'en_cours'])

  const { data: produits } = await supabase
    .from('produits')
    .select('quantite')

  const totalStock = produits?.reduce((s, p) => s + (p.quantite || 0), 0) || 0

  const { data: ventesPayees } = await supabase
    .from('ventes')
    .select('total')
    .eq('statut', 'payee')

  const ca = ventesPayees?.reduce((s, v) => s + Number(v.total || 0), 0) || 0

  return (
    <>
      <Header
        title="Tableau de bord"
        subtitle="Vue d'ensemble d'Alpha-Tec"
        user={profile}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KpiCard
          title="Chiffre d'affaires"
          value={`${ca.toLocaleString('fr-FR')} F`}
          delta="▲ Ventes payées"
          iconName="Coins"
          color="blue"
        />
        <KpiCard
          title="Clients actifs"
          value={String(clientsCount || 0)}
          delta="▲ Base clientèle"
          iconName="Users"
          color="green"
        />
        <KpiCard
          title="SAV en cours"
          value={String(savCount || 0)}
          delta="⚠ Tickets ouverts"
          iconName="Wrench"
          color="orange"
          warn
        />
        <KpiCard
          title="Produits en stock"
          value={String(totalStock)}
          delta="▲ Stock total"
          iconName="Package"
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VentesChart />
        </div>
        <ActivitesTable />
      </div>
    </>
  )
}
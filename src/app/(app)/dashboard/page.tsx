import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import KpiCard from '@/components/KpiCard'
import { Coins, Users, Wrench, ShoppingCart } from 'lucide-react'
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

  // KPIs
  const { count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  const { count: reparationsCount } = await supabase
    .from('reparations')
    .select('*', { count: 'exact', head: true })
    .in('statut', ['recu', 'en_cours'])

  const { data: ventesPayees } = await supabase
    .from('ventes')
    .select('total')
    .eq('statut', 'payee')

  const ca = ventesPayees?.reduce((s, v) => s + Number(v.total || 0), 0) || 0

  const { count: ventesCount } = await supabase
    .from('ventes')
    .select('*', { count: 'exact', head: true })

  return (
    <>
      <Header
        title="Tableau de bord"
        subtitle="Vue d'ensemble d'Alpha-Tec"
        user={profile}
      />

      {/* KPIs */}
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
          title="Réparations en cours"
          value={String(reparationsCount || 0)}
          delta="⚠ Interventions ouvertes"
          iconName="Wrench"
          color="orange"
          warn
        />
        <KpiCard
          title="Total ventes"
          value={String(ventesCount || 0)}
          delta="▲ Toutes ventes"
          iconName="ShoppingCart"
          color="blue"
        />
      </div>

      {/* Graphique + Activités */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VentesChart />
        </div>
        <ActivitesTable />
      </div>
    </>
  )
}
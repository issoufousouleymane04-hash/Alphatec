import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import ReparationTable from './ReparationTable'

export default async function ReparationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: reparations } = await supabase
    .from('reparations')
    .select('*, clients(nom), produits(nom), profiles!technicien_id(nom)')
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('nom')

  const { data: produits } = await supabase
    .from('produits')
    .select('*')
    .order('nom')

  const { data: techniciens } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['technicien', 'admin'])
    .order('nom')

  return (
    <>
      <Header
        title="Réparation"
        subtitle="Gestion des réparations et interventions Alpha-Tec"
        user={profile}
      />
      <ReparationTable
        initialReparations={reparations || []}
        clients={clients || []}
        produits={produits || []}
        techniciens={techniciens || []}
      />
    </>
  )
}
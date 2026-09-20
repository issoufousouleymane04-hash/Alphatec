import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import SavTable from './SavTable'

export default async function SavPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: tickets } = await supabase
    .from('tickets_sav')
    .select('*, clients(nom), produits(nom), profiles!tickets_sav_technicien_id_fkey(nom)')
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase.from('clients').select('id, nom').order('nom')
  const { data: produits } = await supabase.from('produits').select('id, nom, reference').order('nom')
  const { data: techniciens } = await supabase
    .from('profiles')
    .select('id, nom, role')
    .in('role', ['admin', 'technicien'])

  return (
    <>
      <Header
        title="SAV"
        subtitle="Réparations et interventions Alpha-Tec"
        user={profile}
      />
      <SavTable
        initialTickets={tickets || []}
        clients={clients || []}
        produits={produits || []}
        techniciens={techniciens || []}
      />
    </>
  )
}
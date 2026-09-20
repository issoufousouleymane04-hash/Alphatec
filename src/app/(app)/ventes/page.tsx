import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import VentesTable from './VentesTable'

export default async function VentesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: ventes } = await supabase
    .from('ventes')
    .select('*, clients(nom), profiles(nom)')
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('nom')

  const { data: produits } = await supabase
    .from('produits')
    .select('*')
    .order('nom')

  return (
    <>
      <Header
        title="Ventes"
        subtitle="Suivi des ventes et commandes"
        user={profile}
      />
      <VentesTable
        initialVentes={ventes || []}
        clients={clients || []}
        produits={produits || []}
      />
    </>
  )
}
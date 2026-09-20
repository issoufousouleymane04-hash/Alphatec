import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import ClientsTable from './ClientsTable'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: clients } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Header
        title="Clients"
        subtitle="Gestion de la clientèle Alpha-Tec"
        user={profile}
      />
      <ClientsTable initialClients={clients || []} />
    </>
  )
}
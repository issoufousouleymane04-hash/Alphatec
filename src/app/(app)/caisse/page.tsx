import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import CaisseTable from './CaisseTable'

export default async function CaissePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: transactions } = await supabase
    .from('caisse')
    .select('*, profiles!created_by(nom)')
    .order('created_at', { ascending: false })

  return (
    <>
      <Header
        title="Caisse"
        subtitle="Recettes et dépenses Alpha-Tec"
        user={profile}
      />
      <CaisseTable initialTransactions={transactions || []} />
    </>
  )
}
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import FacturesTable from './FacturesTable'

export default async function FacturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: factures } = await supabase
    .from('factures')
    .select('*, clients(nom, email, telephone, ville), ventes(numero)')
    .order('created_at', { ascending: false })

  return (
    <>
      <Header
        title="Factures"
        subtitle="Suivi des factures clients"
        user={profile}
      />
      <FacturesTable initialFactures={factures || []} />
    </>
  )
}
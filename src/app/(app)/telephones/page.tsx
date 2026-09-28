import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import TelephonesTable from './TelephonesTable'

export default async function TelephonesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user?.id).single()

  const { data: telephones } = await supabase
    .from('telephones')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Header
        title="Téléphones"
        subtitle="Gestion des téléphones Android et iPhone"
        user={profile}
      />
      <TelephonesTable initialTelephones={telephones || []} />
    </>
  )
}
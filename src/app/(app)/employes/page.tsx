import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import EmployesTable from './EmployesTable'

export default async function EmployesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: employes } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Header
        title="Employés"
        subtitle="Équipe Alpha-Tec"
        user={profile}
      />
      <EmployesTable
        initialEmployes={employes || []}
        currentUserId={user?.id || ''}
      />
    </>
  )
}
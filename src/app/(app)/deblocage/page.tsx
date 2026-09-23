import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import DeblocageTable from './DeblocageTable'

export default async function DeblocagePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: deblocages } = await supabase
    .from('deblocages')
    .select('*, clients(nom, telephone), profiles!technicien_id(nom)')
    .order('created_at', { ascending: false })

  const { data: clients } = await supabase
    .from('clients')
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
        title="Déblocage"
        subtitle="FRP • iCloud • Mise à jour • Services"
        user={profile}
      />
      <DeblocageTable
        initialDeblocages={deblocages || []}
        clients={clients || []}
        techniciens={techniciens || []}
      />
    </>
  )
}
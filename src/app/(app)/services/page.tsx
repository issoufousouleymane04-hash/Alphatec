import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import ServicesTable from './ServicesTable'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user?.id).single()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('ordre', { ascending: true })

  return (
    <>
      <Header
        title="Services"
        subtitle="Gestion des prestations Alpha-Tec"
        user={profile}
      />
      <ServicesTable initialServices={services || []} />
    </>
  )
}
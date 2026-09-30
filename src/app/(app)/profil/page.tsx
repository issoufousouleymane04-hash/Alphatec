import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import ProfilContent from './ProfilContent'

export default async function ProfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <>
      <Header
        title="Mon Profil"
        subtitle="Gérez vos informations personnelles"
        user={profile}
      />
      <ProfilContent profile={profile} email={user?.email || ''} />
    </>
  )
}
import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'

export default async function FacturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  return (
    <>
      <Header title="Factures" subtitle="Suivi des factures clients" user={profile} />
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center text-slate-500">
        Module Factures — à venir 🚧
      </div>
    </>
  )
}
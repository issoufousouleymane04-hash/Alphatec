import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import ArticlesTable from './ArticlesTable'

export default async function ArticlesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user?.id).single()

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <>
      <Header
        title="Articles"
        subtitle="Gestion du matériel informatique et accessoires"
        user={profile}
      />
      <ArticlesTable initialArticles={articles || []} />
    </>
  )
}
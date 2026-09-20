import { createClient } from '@/lib/supabase/server'
import Header from '@/components/Header'
import StockTable from './StockTable'

export default async function StockPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const { data: produits } = await supabase
    .from('produits')
    .select('*, categories(nom), fournisseurs(nom)')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase.from('categories').select('*')
  const { data: fournisseurs } = await supabase.from('fournisseurs').select('*')

  return (
    <>
      <Header
        title="Stock"
        subtitle="Inventaire des produits Alpha-Tec"
        user={profile}
      />
      <StockTable
        initialProduits={produits || []}
        categories={categories || []}
        fournisseurs={fournisseurs || []}
      />
    </>
  )
}
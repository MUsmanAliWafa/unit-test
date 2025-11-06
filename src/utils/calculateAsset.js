import { supabase } from '../services/supabase'

export async function getTotalAsset() {
  const { data, error } = await supabase
    .from('total_assets')
    .select('total_asset')

  if (error) throw error
  return (data || []).reduce((sum, r) => sum + Number(r.total_asset || 0), 0)
}

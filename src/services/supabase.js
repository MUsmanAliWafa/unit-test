import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or ANON KEY not set. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getAvailableYears() {
  const { data, error } = await supabase
    .from('transactions')
    .select('year', { count: 'exact' })
    .not('year', 'is', null)
    .order('year', { ascending: false })
  if (error) throw error
  return Array.from(new Set((data||[]).map(r => r.year))).sort((a,b)=>b-a)
}

export async function getMonthsForYear(year) {
  const { data, error } = await supabase
    .from('transactions')
    .select('month')
    .eq('year', year)
    .not('month', 'is', null)
    .order('month', { ascending: true })
  if (error) throw error
  return Array.from(new Set((data||[]).map(r => r.month))).sort((a,b)=>a-b)
}

export async function addOrUpdateTransaction({ year, month, amount }) {
  const { data: existing, error: selErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('year', year)
    .eq('month', month)
    .limit(1)
  if (selErr) throw selErr
  if (existing && existing.length) {
    return { exists: true, record: existing[0] }
  }
  const { data, error } = await supabase
    .from('transactions')
    .insert([{ year, month, amount }])
    .select()
  if (error) throw error
  return { exists: false, record: data[0] }
}

export async function updateTransaction(id, patch) {
  const { data, error } = await supabase
    .from('transactions')
    .update(patch)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}

export async function fetchTransactions({ page = 1, perPage = 10, year = null, month = null } = {}) {
  let query = supabase.from('transactions').select('*', { count: 'exact' }).order('created_at', { ascending: false })
  if (year) query = query.eq('year', year)
  if (month) query = query.eq('month', month)
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, error, count } = await query.range(from, to)
  if (error) throw error
  return { data: data || [], count: count || 0 }
}

export async function downloadYearData(year) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('year', year)
    .order('month', { ascending: true })
  if (error) throw error
  return data || []
}

export async function restoreTransactions(records = []) {
  const results = { inserted: 0, updated: 0, errors: [] }
  for (const r of records) {
    try {
      const year = Number(r.year)
      const month = Number(r.month)
      const amount = Number(r.amount)
      if (!year || !month || isNaN(amount)) {
        results.errors.push({ rec: r, reason: 'invalid fields' })
        continue
      }
      const { data: existing, error: selErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('year', year)
        .eq('month', month)
        .limit(1)
      if (selErr) {
        results.errors.push({ rec: r, reason: selErr.message || selErr })
        continue
      }
      if (existing && existing.length) {
        const id = existing[0].id
        const { error: upErr } = await supabase.from('transactions').update({ amount }).eq('id', id)
        if (upErr) {
          results.errors.push({ rec: r, reason: upErr.message || upErr })
        } else {
          results.updated++
        }
      } else {
        const { error: insErr } = await supabase.from('transactions').insert([{ year, month, amount }])
        if (insErr) {
          results.errors.push({ rec: r, reason: insErr.message || insErr })
        } else {
          results.inserted++
        }
      }
    } catch (e) {
      results.errors.push({ rec: r, reason: e.message || e })
    }
  }
  return results
}

// src/stores/transactionsStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  supabase,
  fetchTransactions,
  getAvailableYears,
  getMonthsForYear,
  addOrUpdateTransaction,
  updateTransaction,
} from '../services/supabase'
import { getTotalAsset } from '../utils/calculateAsset'

export const useTransactionsStore = defineStore('transactions', () => {
  // Transactions = monthly saved/income entries (table 'transactions')
  const transactions = ref([])
  // total spending & saved (computed dari daily_expenses)
  const totalSpending = ref(0)
  const totalSaved = ref(0)

  const totalCount = ref(0)

  // Daily expenses
  const dailyExpenses = ref([])
  const dailyTotalCount = ref(0)

  // selections
  const selectedYear = ref(null)
  const selectedMonth = ref(null)

  // meta
  const years = ref([])
  const months = ref([])

  // pagination for daily expenses
  const perPage = ref(10)
  const currentPage = ref(1)

  // total asset
  const totalAsset = ref(0)

  // time display format: '12' or '24'
  const timeFormat = ref('12')

  // helper computed
  const totalPages = computed(() => Math.max(1, Math.ceil((dailyTotalCount.value || 0) / perPage.value)))

  // --- fetchers ---
  async function loadTransactions(page = 1, per = 10) {
    const { data, count } = await fetchTransactions({ page, perPage: per, year: selectedYear.value, month: selectedMonth.value })
    transactions.value = data || []
    totalCount.value = count || 0
  }

  async function fetchYears() {
    years.value = await getAvailableYears()
  }

  async function fetchMonths(year) {
    if (!year) {
      months.value = []
      return
    }
    months.value = await getMonthsForYear(year)
  }

  async function fetchTotalAsset() {
    totalAsset.value = await getTotalAsset()
  }

  // --- daily expenses operations ---
  // async function loadDailyExpenses(page = 1, per = perPage.value) {
  //   if (!selectedYear.value || !selectedMonth.value) {
  //     dailyExpenses.value = []
  //     dailyTotalCount.value = 0
  //     return
  //   }
  //   // reuse supabase client directly for daily_expenses
  //   const from = (page - 1) * per
  //   const to = from + per - 1
  //   const { data, error, count } = await supabase
  //     .from('daily_expenses')
  //     .select('*', { count: 'exact' })
  //     .eq('year', Number(selectedYear.value))
  //     .eq('month', Number(selectedMonth.value))
  //     .order('date', { ascending: false })
  //     .range(from, to)

  //   if (error) throw error
  //   dailyExpenses.value = data || []
  //   dailyTotalCount.value = count || 0
  // }

    async function loadDailyExpenses(page = 1, per = perPage.value) {
    if (!selectedYear.value || !selectedMonth.value) {
      dailyExpenses.value = []
      dailyTotalCount.value = 0
      totalSpending.value = 0
      totalSaved.value = 0
      return
    }

    const from = (page - 1) * per
    const to = from + per - 1
    const { data, error, count } = await supabase
      .from('daily_expenses')
      .select('*', { count: 'exact' })
      .eq('year', Number(selectedYear.value))
      .eq('month', Number(selectedMonth.value))
      .order('date', { ascending: false })
      .range(from, to)

    if (error) throw error
    dailyExpenses.value = data || []
    dailyTotalCount.value = count || 0

    // hitung total spending bulan ini
    const total = (data || []).reduce((sum, d) => sum + Number(d.amount || 0), 0)
    totalSpending.value = total

    // hitung saved (income - spending)
    const incomeTx = transactions.value.find(
      (t) => t.year === Number(selectedYear.value) && t.month === Number(selectedMonth.value)
    )
    const incomeAmount = incomeTx ? Number(incomeTx.amount) : 0
    totalSaved.value = incomeAmount - total
  }


  // add an income (monthly). uses existing service
  async function addIncome({ year, month, amount }) {
    return await addOrUpdateTransaction({ year, month, amount })
  }

  // add expense: insert into daily_expenses, and deduct from transactions.amount of that month
  async function addExpense({ year, month, day, time, description, amount }) {
    // 1) insert into daily_expenses
    const dateStr = `${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const { data: ins, error: insErr } = await supabase
      .from('daily_expenses')
      .insert([{
        year: Number(year),
        month: Number(month),
        day: Number(day),
        date: dateStr,
        time,
        description,
        amount: Number(amount),
      }])
      .select()
    if (insErr) throw insErr

    // 2) find transaction for year/month
    const { data: tdata, error: tErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('year', Number(year))
      .eq('month', Number(month))
      .limit(1)

    if (tErr) throw tErr

    if (tdata && tdata.length) {
      const tx = tdata[0]
      const newAmount = Number(tx.amount || 0) - Number(amount)
      const { data: upd, error: updErr } = await supabase
        .from('transactions')
        .update({ amount: newAmount })
        .eq('id', tx.id)
        .select()
      if (updErr) throw updErr
    } else {
      // if there's no monthly transaction, create one with negative amount (expense reduces)
      const { data: insTx, error: insTxErr } = await supabase
        .from('transactions')
        .insert([{ year: Number(year), month: Number(month), amount: Number(0) - Number(amount) }])
        .select()
      if (insTxErr) throw insTxErr
    }

    // refresh data and totals
    await fetchTotalAsset()
    await loadDailyExpenses(currentPage.value, perPage.value)
    await loadTransactions(1, 10)

    return ins[0]
  }

  // edit expense: adjust daily_expenses row and update transactions.amount by difference
  async function editExpense(expenseId, { year, month, day, time, description, amount, oldAmount }) {
    const dateStr = `${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const { data: upd, error: updErr } = await supabase
      .from('daily_expenses')
      .update({
        year: Number(year),
        month: Number(month),
        day: Number(day),
        date: dateStr,
        time,
        description,
        amount: Number(amount),
      })
      .eq('id', expenseId)
      .select()

    if (updErr) throw updErr

    const diff = Number(amount) - Number(oldAmount) // positive means more expense => subtract more from transaction
    // fetch transaction
    const { data: tdata, error: tErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('year', Number(year))
      .eq('month', Number(month))
      .limit(1)

    if (tErr) throw tErr

    if (tdata && tdata.length) {
      const tx = tdata[0]
      const newAmount = Number(tx.amount || 0) - diff
      const { error: up2 } = await supabase
        .from('transactions')
        .update({ amount: newAmount })
        .eq('id', tx.id)
      if (up2) throw up2
    } else {
      // no tx exists, create with negative sum
      const { error: insErr } = await supabase
        .from('transactions')
        .insert([{ year: Number(year), month: Number(month), amount: 0 - Number(amount) }])
      if (insErr) throw insErr
    }

    await fetchTotalAsset()
    await loadDailyExpenses(currentPage.value, perPage.value)
    await loadTransactions(1, 10)

    return upd[0]
  }

  // delete expense: remove row and add back amount to transactions.amount
  async function deleteExpense(expenseId) {
    // get expense row
    const { data: row, error: rowErr } = await supabase
      .from('daily_expenses')
      .select('*')
      .eq('id', expenseId)
      .limit(1)
    if (rowErr) throw rowErr
    if (!row || !row.length) throw new Error('Expense not found')

    const rec = row[0]
    const { error: delErr } = await supabase
      .from('daily_expenses')
      .delete()
      .eq('id', expenseId)
    if (delErr) throw delErr

    // restore amount into transactions
    const { data: tdata, error: tErr } = await supabase
      .from('transactions')
      .select('*')
      .eq('year', Number(rec.year))
      .eq('month', Number(rec.month))
      .limit(1)
    if (tErr) throw tErr

    if (tdata && tdata.length) {
      const tx = tdata[0]
      const newAmount = Number(tx.amount || 0) + Number(rec.amount) // add back
      const { error: upErr } = await supabase
        .from('transactions')
        .update({ amount: newAmount })
        .eq('id', tx.id)
      if (upErr) throw upErr
    }

    await fetchTotalAsset()
    await loadDailyExpenses(currentPage.value, perPage.value)
    await loadTransactions(1, 10)
    return true
  }

  return {
    // state
    transactions, totalCount,
    dailyExpenses, dailyTotalCount,
    selectedYear, selectedMonth,
    years, months,
    perPage, currentPage, totalPages,
    totalAsset, timeFormat, totalSpending,
    totalSaved,


    // methods
    loadTransactions, fetchYears, fetchMonths, fetchTotalAsset,
    loadDailyExpenses, addIncome, addExpense, editExpense, deleteExpense,
    // pagination helpers
    setPerPage(n) { perPage.value = n; currentPage.value = 1; loadDailyExpenses(1, n) },
    gotoPage(p) { currentPage.value = p; loadDailyExpenses(p, perPage.value) }
  }
})

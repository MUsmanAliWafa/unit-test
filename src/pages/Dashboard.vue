<!-- src/pages/Dashboard.vue -->
<template>
  <div class="p-6">
    <Navbar />

    <div class="mt-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="flex flex-wrap items-center gap-3">
    <select v-model="selectedYearLocal" @change="onYearChange" class="p-2 rounded border border-border bg-bg w-[calc(50%-6px)] md:w-auto">
        <option value="">Pilih Tahun</option>
        <option v-for="y in store.years" :key="y" :value="y">{{ y }}</option>
    </select>

    <select v-model="selectedMonthLocal" class="p-2 rounded border border-border bg-bg w-[calc(50%-6px)] md:w-auto">
        <option value="">Pilih Bulan</option>
        <option v-for="m in monthsOptions" :key="m" :value="String(m).padStart(2,'0')">{{ String(m).padStart(2,'0') }}</option>
    </select>

    <button @click="applyFilter" class="px-3 py-2 rounded bg-primary text-bg w-[calc(50%-6px)] md:w-auto">Tampilkan</button>

    <button @click="resetFilter" class="px-3 py-2 rounded bg-bg border border-border w-[calc(50%-6px)] md:w-auto">Reset</button>
</div>

        <div class="flex items-center gap-3">
          <div class="tes-successdal">
            <SuccessModal :show="showTest" :detail="testDetail" @close="showTest=false" />
            <button @click="testModal" class="btn bg-success text-white">Test Modal</button>
          </div>
          <button @click="openAddIncome" class="px-3 py-2 rounded bg-success text-bg">Add Income</button>
          <button @click="openAddExpense" class="px-3 py-2 rounded bg-danger text-bg">Add Expense</button>
        </div>
      </div>

      <DashboardStats />

      <DailyExpenses />

      <!-- modals -->
      <AddIncome v-if="showAddIncome" :show="showAddIncome" @close="showAddIncome=false" @saved="onSaved" />
      <AddExpense v-if="showAddExpense" :show="showAddExpense" @close="showAddExpense=false" @saved="onSaved" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from '../components/Navbar.vue'
import DashboardStats from '../components/DashboardStats.vue'
import AddIncome from '../components/AddIncome.vue'
import AddExpense from '../components/AddExpense.vue'
import DailyExpenses from '../components/DailyExpenses.vue'
import { useTransactionsStore } from '../stores/transactionsStore'

// tes SuccessModal
import SuccessModal from '../components/SuccessModal.vue'
const showTest = ref(false)
const testDetail = ref({ year: 2025, month: 10, day: 29, time: '12:00', description: 'Tes Modal', amount: 150000 })

function testModal() {
  showTest.value = true
}
// end tes SuccessModal

const store = useTransactionsStore()

const showAddIncome = ref(false)
const showAddExpense = ref(false)

const selectedYearLocal = ref('')
const selectedMonthLocal = ref('')

onMounted(async () => {
  await store.fetchYears()
  await store.fetchTotalAsset()
  // no pre-selection: show placeholders
})

function onYearChange() {
  if (selectedYearLocal.value) {
    store.fetchMonths(selectedYearLocal.value)
  } else {
    store.months = []
  }
}

function applyFilter() {
  // set store selection
  store.selectedYear = selectedYearLocal.value ? Number(selectedYearLocal.value) : null
  store.selectedMonth = selectedMonthLocal.value ? Number(selectedMonthLocal.value) : null

  // load transactions and daily expenses for selected month/year
  store.loadTransactions(1, 10)
  store.currentPage = 1
  store.loadDailyExpenses(1, store.perPage)
}


function resetFilter() {
  selectedYearLocal.value = ''
  selectedMonthLocal.value = ''
  store.selectedYear = null
  store.selectedMonth = null
  // clear displayed lists
  store.transactions = []
  store.dailyExpenses = []
}
const monthsOptions = computed(() => {
  if (!store.selectedYear && !selectedYearLocal.value) return []
  return store.months
})

function openAddIncome() { showAddIncome.value = true }
function openAddExpense() { showAddExpense.value = true }
function onSaved() {
  store.fetchTotalAsset()
  store.loadTransactions(1, 10)
  store.loadDailyExpenses(store.currentPage, store.perPage)
}
</script>

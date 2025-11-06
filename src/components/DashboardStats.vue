<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
    <div class="bg-elev p-4 rounded-2xl shadow text-center">
      <h2 class="text-xl font-bold text-primary">Total Asset</h2>
      <p class="text-2xl font-semibold mt-2 text-success">{{ formatRupiah(totalAsset) }}</p>
    </div>

    <div v-for="item in stats" :key="item.label" class="bg-elev p-4 rounded-2xl shadow text-center">
      <h2 class="text-lg font-bold text-primary">{{ item.label }}</h2>
      <p class="text-xl font-semibold mt-2">{{ formatRupiah(item.value) }}</p>
    </div>
  </div>
</template>

<script setup>
import { formatRupiah } from '../utils/formatRupiah'
import { computed } from 'vue'
import { useTransactionsStore } from '../stores/transactionsStore'

const store = useTransactionsStore()

const totalAsset = computed(() => store.totalAsset)
// Gabungkan semua nilai ke satu array stats
const stats = computed(() => [
  {
    label: 'Income',
    value: store.transactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    ),
  },
  {
    label: 'Spending',
    value: store.totalSpending || 0,
  },
  {
    label: 'Saved',
    value: store.totalSaved || 0,
  },
])
</script>
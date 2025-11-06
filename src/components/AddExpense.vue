<script setup>
import { ref } from 'vue'
import { useTransactionsStore } from '../stores/transactionsStore'
import SuccessModal from '../components/SuccessModal.vue'

const emit = defineEmits(['close', 'saved'])
const store = useTransactionsStore()

// Input fields
const year = ref('')
const month = ref('')
const day = ref('')
const time = ref('00:00')
const description = ref('')
const amount = ref('')

// Modal success
const showSuccessModal = ref(false)
const successDetail = ref({})

// Reset form input
function reset() {
  year.value = ''
  month.value = ''
  day.value = ''
  time.value = '00:00'
  description.value = ''
  amount.value = ''
}

// Simpan data pengeluaran
async function saveExpense() {
  const amt = Number(amount.value.toString().replace(/\./g, ''))
  try {
    await store.addExpense({
      year: Number(year.value),
      month: Number(month.value),
      day: Number(day.value),
      time: time.value || '00:00',
      description: description.value || '-',
      amount: amt,
    })

    // ✅ Tampilkan modal success
    successDetail.value = {
      year: Number(year.value),
      month: Number(month.value),
      day: Number(day.value),
      time: time.value || '00:00',
      description: description.value || '-',
      amount: amt,
    }
    showSuccessModal.value = true

    emit('saved')
    emit('close')
    reset()
  } catch (e) {
    console.error(e)
    alert('Terjadi kesalahan saat menambahkan pengeluaran.')
  }
}
</script>

<template>
  <div class="bg-elev p-6 rounded-2xl shadow-md w-full max-w-lg">
    <h2 class="text-lg font-semibold text-primary mb-4">Tambah Pengeluaran</h2>

    <form @submit.prevent="saveExpense" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <input
          v-model="year"
          type="number"
          placeholder="Tahun"
          class="input"
          min="2000"
          required
        />
        <input
          v-model="month"
          type="number"
          placeholder="Bulan (01–12)"
          min="1"
          max="12"
          class="input"
          required
        />
        <input
          v-model="day"
          type="number"
          placeholder="Hari"
          min="1"
          max="31"
          class="input"
          required
        />
        <input v-model="time" type="time" class="input" />
      </div>

      <input
        v-model="description"
        type="text"
        placeholder="Deskripsi"
        class="input w-full"
      />
      <input
        v-model="amount"
        type="text"
        placeholder="Jumlah (Rp)"
        class="input w-full"
      />

      <div class="flex justify-end gap-3">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 rounded-lg border border-border text-muted hover:text-text"
        >
          Batal
        </button>
        <button
          type="submit"
          class="px-5 py-2 rounded-lg bg-success text-white font-semibold hover:opacity-90"
        >
          Simpan
        </button>
      </div>
    </form>

    <!-- Success Modal -->
    <SuccessModal
      :show="showSuccessModal"
      :detail="successDetail"
      @close="showSuccessModal = false"
    />
  </div>
</template>

<style scoped>
.input {
  background-color: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  width: 100%;
  outline: none;
  transition: all 0.2s ease;
}
.input:focus {
  box-shadow: 0 0 0 2px var(--color-primary);
}
</style>

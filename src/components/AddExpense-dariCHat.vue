<script setup>
import { ref, watch } from 'vue'
import { useTransactionsStore } from '@/stores/transactionsStore'
import SuccessModal from '@/components/SuccessModal.vue'

const emit = defineEmits(['close', 'saved'])
const store = useTransactionsStore()

// Input field reactive
const year = ref('')
const month = ref('')
const day = ref('')
const time = ref('00:00')
const description = ref('')
const amount = ref('')

// Modal success state
const showSuccessModal = ref(false)
const successDetail = ref({})
const isSubmitting = ref(false)

// Format ke rupiah (live)
watch(amount, (val) => {
  if (!val) return
  const numeric = val.toString().replace(/\D/g, '')
  amount.value = new Intl.NumberFormat('id-ID').format(numeric)
})

// Reset semua input
function reset() {
  year.value = ''
  month.value = ''
  day.value = ''
  time.value = '00:00'
  description.value = ''
  amount.value = ''
}

// Simpan pengeluaran
async function saveExpense() {
  if (!year.value || !month.value || !day.value || !amount.value) {
    alert('Mohon isi semua data yang diperlukan.')
    return
  }

  isSubmitting.value = true
  const numericAmount = Number(amount.value.replace(/\./g, '').replace(/,/g, ''))

  try {
    await store.addExpense({
      year: Number(year.value),
      month: Number(month.value),
      day: Number(day.value),
      time: time.value || '00:00',
      description: description.value || '-',
      amount: numericAmount,
    })

    // ✅ Tampilkan success modal
    successDetail.value = {
      year: year.value,
      month: month.value,
      day: day.value,
      time: time.value,
      description: description.value || '-',
      amount: numericAmount,
    }
    showSuccessModal.value = true

    // Auto close & reset form setelah 2.5 detik
    setTimeout(() => {
      showSuccessModal.value = false
      reset()
      emit('saved')
      emit('close')
    }, 2500)
  } catch (err) {
    console.error('Gagal menambah pengeluaran:', err)
    alert('Terjadi kesalahan saat menambahkan pengeluaran.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="bg-elev p-6 rounded-2xl shadow-md w-full max-w-lg">
    <h2 class="text-lg font-semibold text-primary mb-4">Tambah Pengeluaran</h2>

    <form @submit.prevent="saveExpense" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <input v-model="year" type="number" placeholder="Tahun" min="2000" class="input" required />
        <input v-model="month" type="number" placeholder="Bulan (01–12)" min="1" max="12" class="input" required />
        <input v-model="day" type="number" placeholder="Hari" min="1" max="31" class="input" required />
        <input v-model="time" type="time" class="input" />
      </div>

      <input v-model="description" type="text" placeholder="Deskripsi" class="input w-full" />
      <input v-model="amount" type="text" placeholder="Jumlah (Rp)" class="input w-full" />

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
          :disabled="isSubmitting"
          class="px-5 py-2 rounded-lg bg-success text-white font-semibold hover:opacity-90 disabled:opacity-60"
        >
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
        </button>
      </div>
    </form>

    <!-- ✅ Modal sukses -->
    <SuccessModal :show="showSuccessModal" :detail="successDetail" @close="showSuccessModal = false" />
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
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.input:focus {
  box-shadow: 0 0 0 2px var(--color-primary);
}
</style>

<!-- src/components/DailyExpenses.vue -->
<template>
  <div class="mt-6 bg-elev p-4 rounded-2xl">
    <div class="flex items-center justify-between mb-3">
      <h4 class="font-semibold text-primary">Daily Expenses</h4>

      <div class="flex items-center space-x-3">
        <label class="text-sm text-muted">Per page</label>
        <select v-model.number="localPerPage" @change="perPageChanged" class="p-1 rounded border border-border bg-bg">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
      </div>
    </div>

    <table class="w-full text-sm">
      <thead>
        <tr class="text-left text-muted">
          <th class="py-2 text-center">Date</th>
          <th class="py-2 text-center">Description</th>
          <th class="py-2 text-center">Time</th>
          <th class="py-2 text-center">Amount</th>
          <th class="py-2 text-center">Update</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length">
          <td colspan="5" class="py-6 text-center text-muted">Tidak ada data. Pilih bulan & tahun.</td>
        </tr>
        <tr v-for="r in rows" :key="r.id" class="border-t border-border">
          <td class="py-3">{{ r.date }}</td>
          <td class="py-3 text-center">{{ r.description }}</td>
          <td class="py-3 text-center">{{ formatTimeDisplay(r.time) }}</td>
          <td class="py-3 text-right">{{ formatRupiah(r.amount) }}</td>
          <td class="py-3 text-center">
            <button @click="openEdit(r)" class="px-2 py-1 rounded border border-border bg-success text-bg">Edit</button>
            <button @click="confirmDelete(r)" class="ml-2 px-2 py-1 rounded border border-border bg-danger text-bg">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- pagination -->
    <div class="mt-4 flex items-center justify-between">
      <div class="text-sm text-muted">Showing page {{ store.currentPage }} / {{ store.totalPages }}</div>
      <div class="flex items-center space-x-2">
        <button @click="prev" :disabled="store.currentPage<=1" class="px-2 py-1 rounded border border-border bg-bg">&lt;</button>
        <button v-for="p in pageButtons" :key="p" @click="goto(p)" :class="['px-2 py-1 rounded', store.currentPage===p? 'bg-primary text-bg' : 'bg-bg border border-border']">{{ p }}</button>
        <button @click="next" :disabled="store.currentPage>=store.totalPages" class="px-2 py-1 rounded border border-border bg-bg">&gt;</button>
      </div>
    </div>

    <!-- edit modal -->
    <div v-if="editing" class="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div class="w-full max-w-md bg-elev p-5 rounded-2xl">
        <h4 class="font-semibold mb-3">Edit Expense</h4>
        <div class="grid grid-cols-2 gap-3">
          <input v-model="editForm.day" type="number" min="1" max="31" class="p-2 rounded border border-border bg-bg" />
          <input v-model="editForm.time" type="time" class="p-2 rounded border border-border bg-bg" />
        </div>
        <div class="mt-3">
          <input v-model="editForm.description" class="w-full p-2 rounded border border-border bg-bg" />
        </div>
        <div class="mt-3">
          <input v-model="editAmount" @input="onEditAmount" class="w-full p-2 rounded border border-border bg-bg" />
        </div>
        <div class="mt-4 flex justify-end gap-2">
          <button @click="closeEdit" class="px-3 py-1 rounded bg-bg border border-border">Batal</button>
          <button @click="saveEdit" class="px-3 py-1 rounded bg-success text-bg">Simpan</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useTransactionsStore } from '../stores/transactionsStore'
import { formatRupiah, parseRupiah } from '../utils/formatRupiah'

const store = useTransactionsStore()

const rows = computed(() => store.dailyExpenses || [])

const localPerPage = ref(store.perPage)
watch(localPerPage, (v) => {
  store.setPerPage(v)
})

function perPageChanged() {
  store.setPerPage(localPerPage.value)
}

function formatTimeDisplay(t) {
  if (!t) return ''
  if (store.timeFormat === '24') return t
  // convert "HH:MM" to 12-hour + AM/PM
  const [hh, mm] = String(t).split(':').map(Number)
  const ampm = hh >= 12 ? 'PM' : 'AM'
  const h12 = ((hh + 11) % 12) + 1
  return `${String(h12).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${ampm}`
}

function prev() {
  if (store.currentPage > 1) store.gotoPage(store.currentPage - 1)
}
function next() {
  if (store.currentPage < store.totalPages) store.gotoPage(store.currentPage + 1)
}
function goto(p) {
  store.gotoPage(p)
}
const pageButtons = computed(() => {
  const pages = []
  for (let i = 1; i <= store.totalPages; i++) pages.push(i)
  return pages
})

// edit flow
const editing = ref(false)
const editForm = ref({ id: null, year: null, month: null, day: null, time: '', description: '', amount: 0 })
const editAmount = ref('')

function openEdit(r) {
  editing.value = true
  editForm.value = { id: r.id, year: r.year, month: r.month, day: r.day, time: r.time || '00:00', description: r.description || '', amount: r.amount }
  editAmount.value = formatRupiah(r.amount)
}

function closeEdit() {
  editing.value = false
  editForm.value = { id: null, year: null, month: null, day: null, time: '', description: '', amount: 0 }
  editAmount.value = ''
}

function onEditAmount() {
  const n = parseRupiah(editAmount.value)
  editAmount.value = formatRupiah(n)
}

async function saveEdit() {
  const parsed = parseRupiah(editAmount.value)
  try {
    await store.editExpense(editForm.value.id, {
      year: editForm.value.year,
      month: editForm.value.month,
      day: editForm.value.day,
      time: editForm.value.time,
      description: editForm.value.description,
      amount: Number(parsed),
      oldAmount: Number(editForm.value.amount)
    })
    closeEdit()
    alert('Data berhasil diubah.')
  } catch (e) {
    console.error(e)
    alert('Gagal menyimpan perubahan.')
  }
}

// delete
function confirmDelete(r) {
  if (!confirm(`Hapus pengeluaran "${r.description}" sebesar ${formatRupiah(r.amount)} ?`)) return
  store.deleteExpense(r.id).then(() => {
    alert('Data dihapus.')
  }).catch(e => { console.error(e); alert('Gagal menghapus') })
}
</script>

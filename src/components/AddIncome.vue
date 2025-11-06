<template>
  <div v-if="show" class="fixed inset-0 flex items-center justify-center bg-black/50">
    <div class="bg-elev p-6 rounded-2xl w-96">
      <h2 class="text-lg font-bold mb-4 text-primary">Tambah Pemasukan</h2>
      <input v-model="year" type="number" placeholder="Tahun (≥2000)" min="2000" class="w-full mb-3 p-2 rounded border border-border bg-bg" />
      <select v-model="month" class="w-full mb-3 p-2 rounded border border-border bg-bg">
        <option value="">Pilih Bulan</option>
        <option v-for="m in 12" :key="m" :value="String(m).padStart(2,'0')">{{ String(m).padStart(2,'0') }}</option>
      </select>
      <input v-model="amountStr" @input="handleAmount" placeholder="Nominal (Rp)" class="w-full mb-3 p-2 rounded border border-border bg-bg" />
      <div class="flex justify-end space-x-2">
        <button @click="save" class="px-4 py-2 bg-success text-bg rounded-lg">Save</button>
        <button @click="$emit('close')" class="px-4 py-2 bg-danger text-bg rounded-lg">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatRupiah, parseRupiah } from '../utils/formatRupiah'
import { addOrUpdateTransaction } from '../services/supabase'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const year = ref('')
const month = ref('')
const amountStr = ref('')

const handleAmount = () => {
  const num = parseRupiah(amountStr.value)
  amountStr.value = formatRupiah(num)
}

const save = async () => {
  if (!year.value || !month.value) {
    alert('Harap isi tahun dan bulan!')
    return
  }
  const { exists } = await addOrUpdateTransaction({ year: +year.value, month: +month.value, amount: parseRupiah(amountStr.value) })
  if (exists) {
    alert(`Bulan ${month.value} tahun ${year.value} sudah ada!`)
  } else {
    alert('Pemasukan berhasil ditambahkan!')
    emit('close')
  }
}
</script>

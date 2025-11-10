<!-- src/components/AddExpense.vue -->
<template>
    <div
        v-if="show"
        class="fixed inset-0 flex items-center justify-center bg-black/40 z-40">
        <div class="w-full max-w-lg p-6 rounded-2xl bg-elev shadow">
            <h3 class="text-lg font-semibold text-primary mb-4">
                Tambah Pengeluaran
            </h3>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-sm text-muted mb-1">Tahun</label>
                    <select
                        v-model="year"
                        class="w-full p-2 rounded border border-border bg-bg">
                        <option value="">Pilih Tahun</option>
                        <option v-for="y in store.years" :key="y" :value="y">
                            {{ y }}
                        </option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm text-muted mb-1">Bulan</label>
                    <select
                        v-model="month"
                        class="w-full p-2 rounded border border-border bg-bg">
                        <option value="">Pilih Bulan</option>
                        <option
                            v-for="m in availableMonths"
                            :key="m"
                            :value="String(m).padStart(2, '0')">
                            {{ String(m).padStart(2, "0") }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="mt-3 grid grid-cols-2 gap-3">
                <div>
                    <label class="block text-sm text-muted mb-1"
                        >Tanggal (1-31)</label
                    >
                    <input
                        v-model="day"
                        type="number"
                        min="1"
                        max="31"
                        class="w-full p-2 rounded border border-border bg-bg" />
                </div>
                <div>
                    <label class="block text-sm text-muted mb-1">Waktu</label>
                    <input
                        v-model="time"
                        type="time"
                        class="w-full p-2 rounded border border-border bg-bg" />
                </div>
            </div>

            <div class="mt-3">
                <label class="block text-sm text-muted mb-1">Deskripsi</label>
                <input
                    v-model="description"
                    type="text"
                    class="w-full p-2 rounded border border-border bg-bg"
                    placeholder="Misal: Makan siang" />
            </div>

            <div class="mt-3">
                <label class="block text-sm text-muted mb-1"
                    >Nominal (Rp)</label
                >
                <input
                    v-model="amountStr"
                    @input="onAmountInput"
                    class="w-full p-2 rounded border border-border bg-bg"
                    placeholder="0" />
            </div>

            <div class="mt-5 flex justify-end gap-3">
                <button
                    @click="onCancel"
                    class="px-4 py-2 rounded bg-bg border border-border">
                    Batal
                </button>
                <button
                    @click="onSave"
                    class="px-4 py-2 rounded bg-success text-bg">
                    Simpan
                </button>
                
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useTransactionsStore } from "../stores/transactionsStore";
import { formatRupiah, parseRupiah } from "../utils/formatRupiah";




const props = defineProps({ show: Boolean });
const emit = defineEmits(["close", "saved"]);

const store = useTransactionsStore();

const year = ref("");
const month = ref("");
const day = ref(new Date().getDate());
const time = ref("");
const description = ref("");
const amountStr = ref("");

watch(
    () => props.show,
    (v) => {
        if (v) {
            // refresh years/months
            store.fetchYears();
        }
    }
);

const availableMonths = computed(() => {
    // If month options depend on selected year, fetch months
    if (!year.value) return [];
    store.fetchMonths(year.value);
    return store.months;
});

function onAmountInput() {
    const n = parseRupiah(amountStr.value);
    amountStr.value = formatRupiah(n);
}

function onCancel() {
    emit("close");
    reset();
}

function reset() {
    year.value = "";
    month.value = "";
    day.value = new Date().getDate();
    time.value = "";
    description.value = "";
    amountStr.value = "";
}

async function onSave() {
    if (!year.value || !month.value) {
        alert("Pilih tahun dan bulan yang tersedia.");
        return;
    }
    if (!amountStr.value) {
        alert("Masukkan nominal pengeluaran.");
        return;
    }
    const amount = parseRupiah(amountStr.value);
    try {
        await store.addExpense({
            year: Number(year.value),
            month: Number(month.value),
            day: Number(day.value),
            time: time.value || "00:00",
            description: description.value || "-",
            amount,
        });
        alert("Pengeluaran berhasil ditambahkan.");
        emit("saved");
        emit("close");
        reset();
    } catch (e) {
        console.error(e);
        alert("Terjadi kesalahan saat menambahkan pengeluaran.");
    }
}
</script>

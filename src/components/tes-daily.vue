<script setup>
import SuccessModal from "@/components/SuccessModal.vue";
import { ref } from "vue";

const showSuccess = ref(false);
const testDetail = ref({
    description: "Tes Pengeluaran Kopi",
    year: 2025,
    month: 2,
    day: 10,
    time: "14:30",
    amount: 15000,
});
</script>

<template>
    <div class="p-6">
        <button
            @click="showSuccess = true"
            class="bg-blue-500 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600">
            Uji Modal Sukses
        </button>

        <SuccessModal
            :show="showSuccess"
            :detail="testDetail"
            @close="showSuccess = false" />
    </div>
</template>

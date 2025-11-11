<template>
  <transition name="fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="close"
    >
      <div
        class="bg-elev text-text rounded-2xl shadow-2xl w-full max-w-md p-6 text-center relative overflow-hidden transition-all duration-500 scale-100"
      >
        <!-- ✅ HEADER -->
        <div class="flex justify-center mb-4 relative ">
          
          <!-- ✅ SUCCESS ANIMATION -->
          <template v-if="type === 'success'">
            <video
              ref="checkVideo"
              class="w-20 h-20"
              autoplay
              muted
              playsinline
              preload="auto"
              @ended="pauseAtEnd"
            >
              <source src="/Check Mark.webm" type="video/webm" />
            </video>

            <!-- last frame -->
            <img
              v-if="showLastFrame"
              src="/g2.png"
              alt="Checkmark done"
              class="w-7 h-7 absolute left-1/2 -translate-x-1/2 pointer-events-none justify-center content-center top-[1.6em]"
            />
          </template>

          <!-- ❌ ERROR ICON -->
          <template v-else>
            <img
              src="/g2.png"
              class="w-16 h-16 opacity-90"
              alt="Error"
            />
          </template>

        </div>

        <!-- ✅ TITLE -->
        <h2 class="text-xl font-bold mb-2">
          {{ titleText }}
        </h2>

        <!-- ✅ DESCRIPTION -->
        <p class="text-muted mb-6">
          {{ descriptionText }}
        </p>

        <!-- ✅ DETAIL DATA (ONLY for success) -->
        <div
          v-if="type === 'success'"
          class="bg-elev/50 rounded-xl p-4 text-left text-sm mb-6 space-y-1"
        >
          <div class="flex justify-between">
            <span class="text-muted">Tanggal</span>
            <span>{{ detail.date || `${detail.year}-${detail.month}-${detail.day}` }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Waktu</span>
            <span>{{ detail.time }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Deskripsi</span>
            <span>{{ detail.description }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Jumlah</span>
            <span class="text-success">Rp {{ formatRupiah(detail.amount) }}</span>
          </div>
        </div>

        <!-- ✅ ERROR BOX -->
        <div v-if="type === 'error'" class="bg-red-500/20 text-red-400 rounded-xl p-4 text-left text-sm mb-6">
          <strong>Error:</strong> {{ errorMessage }}
        </div>

        <!-- ✅ FOOTER -->
        <div class="flex justify-between items-center">
          <button
            @click="close"
            class="bg-success text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition"
            v-if="type === 'success'"
          >
            Tutup
          </button>

          <button
            @click="close"
            class="bg-red-600 text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition"
            v-if="type === 'error'"
          >
            Tutup
          </button>

          <span class="text-muted text-sm" v-if="type === 'success'">
            Menutup otomatis dalam {{ countdown / 1000 }} detik...
          </span>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed, onUnmounted } from 'vue'

const props = defineProps({
  show: Boolean,
  detail: Object,
  type: { type: String, default: "success" },    // success | error
  mode: { type: String, default: "expense" },    // expense | income
  error: { type: Object, default: () => ({}) }
})

const emit = defineEmits(['close'])

const countdown = ref(2500)
const showLastFrame = ref(false)
const checkVideo = ref(null)
let timer

const titleText = computed(() => {
  if (props.type === 'error') return "Terjadi Kesalahan"
  return props.mode === "income"
    ? "Pemasukan Berhasil Ditambahkan"
    : "Pengeluaran Berhasil Ditambahkan"
})

const descriptionText = computed(() => {
  if (props.type === 'error') return "Data gagal disimpan ke sistem"
  return "Data telah disimpan ke sistem"
})

const errorMessage = computed(() => {
  return props.error?.message || JSON.stringify(props.error)
})

function formatRupiah(num) {
  if (!num) return '0'
  return new Intl.NumberFormat('id-ID').format(num)
}

function close() {
  clearInterval(timer)
  emit('close')
  showLastFrame.value = false
}

function pauseAtEnd() {
  if (checkVideo.value) {
    checkVideo.value.pause()
    showLastFrame.value = true
  }
}

watch(
  () => props.show,
  (v) => {
    if (v && props.type === 'success') {
      showLastFrame.value = false
      countdown.value = 2500

      if (checkVideo.value) {
        checkVideo.value.currentTime = 0
        checkVideo.value.play()
      }

      timer = setInterval(() => {
        countdown.value -= 1000
        if (countdown.value <= 0) close()
      }, 1000)
    }
    if (!v) clearInterval(timer)
  }
)

onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

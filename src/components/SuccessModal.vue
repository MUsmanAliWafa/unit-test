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
        <!-- Header: Animasi Check Mark -->
        <div class="flex justify-center mb-4 relative ">
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

          <!-- Gambar terakhir (backup frame terakhir) -->
          <img
            v-if="showLastFrame"
            src="/g2.png"
            alt="Checkmark done"
            class="w-7 h-7 absolute  left-1/2 -translate-x-1/2 pointer-events-none justify-center content-center top-[1.6em]"
          />
        </div>

        <!-- Title -->
        <h2 class="text-xl font-bold mb-2">Pengeluaran Berhasil Ditambahkan</h2>
        <p class="text-muted mb-6">Data telah disimpan ke sistem</p>

        <!-- Detail -->
        <div class="bg-elev/50 rounded-xl p-4 text-left text-sm mb-6 space-y-1">
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

        <!-- Footer -->
        <div class="flex justify-between items-center">
          <button
            @click="close"
            class="bg-success text-white font-semibold px-6 py-2 rounded-lg hover:opacity-90 transition"
          >
            Tutup
          </button>

          <span class="text-muted text-sm">
            Menutup otomatis dalam {{ countdown / 1000 }} detik...
          </span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
  show: Boolean,
  detail: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['close'])
const countdown = ref(2500)
const showLastFrame = ref(false)
const checkVideo = ref(null)
let timer

function close() {
  clearInterval(timer)
  emit('close')
  showLastFrame.value = false
}

function formatRupiah(num) {
  if (!num) return '0'
  return new Intl.NumberFormat('id-ID').format(num)
}

// Fungsi: ketika video selesai, hentikan di frame terakhir
function pauseAtEnd() {
  if (checkVideo.value) {
    checkVideo.value.pause()
    showLastFrame.value = true // munculkan gambar terakhir
  }
}

watch(
  () => props.show,
  (val) => {
    if (val) {
      showLastFrame.value = false
      countdown.value = 2500

      // restart video setiap kali modal ditampilkan
      if (checkVideo.value) {
        checkVideo.value.currentTime = 0
        checkVideo.value.play()
      }

      timer = setInterval(() => {
        countdown.value -= 1000
        if (countdown.value <= 0) close()
      }, 1000)
    } else {
      clearInterval(timer)
    }
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

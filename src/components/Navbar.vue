<template>
  <nav class="flex items-center justify-between p-4 bg-elev text-text border-b border-border">
    <div class="flex items-center space-x-2">
      <div class="font-bold text-lg">💰 Personal Financial</div>
    </div>
    <div class="flex items-center space-x-4">
      <!-- <button @click="toggleTheme" class="px-3 py-1 rounded-lg border border-border bg-bg hover:bg-elev">
        {{ theme === 'dark' ? '☀️ Light' : '🌙 Dark' }}
      </button> -->
      <button
  @click="toggleThemeWithAnimation"
  class="flex items-center gap-2 px-3 py-1 rounded-lg border border-theme bg-elev hover:bg-primary hover:text-bg transition-all duration-300 ease-in-out"
>
  <span
    :key="theme"
    class="block animate-theme-icon text-lg"
  >
    {{ theme === 'dark' ? '☀️' : '🌙' }}
  </span>
  <span class="font-medium">{{ theme === 'dark' ? 'Light' : 'Dark' }}</span>
</button>


      <div class="font-medium text-primary cursor-pointer">Profile</div>
    </div>
  </nav>
</template>

<!-- <script setup>
import { useTheme } from '../composables/useTheme'
const { theme, toggleTheme } = useTheme()
</script> -->
<script setup>
import { useTheme } from '@/composables/useTheme'
import { nextTick } from 'vue'

const { theme, toggleTheme } = useTheme()

// Tambahkan animasi halus di tombol
async function toggleThemeWithAnimation() {
  const btnIcon = document.querySelector('.animate-theme-icon')
  if (btnIcon) {
    btnIcon.classList.remove('animate-theme-icon') // reset animasi
    void btnIcon.offsetWidth // trigger reflow untuk restart animasi
    btnIcon.classList.add('animate-theme-icon')
  }

  // Tunggu sedikit sebelum ganti tema agar animasi sinkron
  await new Promise((resolve) => setTimeout(resolve, 100))
  toggleTheme()
}
</script>


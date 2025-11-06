<!-- src/pages/Login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-bg text-text">
    <div class="max-w-md w-full bg-elev p-6 rounded-2xl">
      <h2 class="text-2xl font-semibold mb-4 text-primary">Login (Disabled)</h2>
      <p class="text-sm text-muted mb-4">Fitur login sedang dinonaktifkan — akan dikembangkan kemudian.</p>

      <div class="space-y-3">
        <input disabled class="w-full p-2 rounded border border-border bg-bg" placeholder="Email (disabled)" />
        <input disabled class="w-full p-2 rounded border border-border bg-bg" placeholder="Password (disabled)" />
        <button disabled class="w-full p-2 rounded bg-primary text-bg">Login</button>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

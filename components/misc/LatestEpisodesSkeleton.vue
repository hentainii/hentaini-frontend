<template>
  <div>
    Loading...
  </div>
</template>

<script setup>
// No imports necesarios, Nuxt 3 los auto-importa
</script>

<style scoped>
@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeUp {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeUp 0.3s forwards;
}
.episode-item-skeleton:nth-child(1) { animation-delay: 0.05s; }
.episode-item-skeleton:nth-child(2) { animation-delay: 0.08s; }
.episode-item-skeleton:nth-child(3) { animation-delay: 0.11s; }
.episode-item-skeleton:nth-child(4) { animation-delay: 0.14s; }
.episode-item-skeleton:nth-child(5) { animation-delay: 0.17s; }
.episode-item-skeleton:nth-child(6) { animation-delay: 0.2s; }
.episode-item-skeleton:nth-child(7) { animation-delay: 0.23s; }
.episode-item-skeleton:nth-child(8) { animation-delay: 0.26s; }
.episode-item-skeleton:nth-child(9) { animation-delay: 0.29s; }
.episode-item-skeleton:nth-child(10) { animation-delay: 0.32s; }
.episode-item-skeleton:nth-child(11) { animation-delay: 0.35s; }
.episode-item-skeleton:nth-child(12) { animation-delay: 0.38s; }
</style>

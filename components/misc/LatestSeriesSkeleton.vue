<template>
  <div class="latest-series-skeleton-container py-2 pb-8">
    <div class="section-header-skeleton mb-5">
      <div class="flex flex-col">
        <div class="h-4 w-28 bg-white/20 rounded mb-1"></div>
        <div class="h-8 w-64 bg-white/30 rounded mb-2"></div>
      </div>
      <div class="animated-bar-skeleton w-10 h-1 bg-gradient-to-r from-[#1a1a1a] via-[#2c2c2c] to-[#1a1a1a] rounded mb-3 animate-pulse"></div>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">
      <div v-for="n in 12" :key="n" class="serie-item-skeleton animate-fadeUp">
        <div class="series-skeleton-card rounded-lg overflow-hidden bg-gradient-to-r from-[#1a1a1a] via-[#2c2c2c] to-[#1a1a1a] h-60 animate-pulse flex flex-col p-2">
          <div class="h-4 w-4/5 bg-white/20 rounded mt-2"></div>
          <div class="h-4 w-3/5 bg-white/20 rounded mt-1"></div>
          <div class="flex space-x-2 mt-2">
            <div class="h-6 w-12 bg-white/20 rounded-full"></div>
            <div class="h-6 w-12 bg-white/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
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
.serie-item-skeleton:nth-child(1) { animation-delay: 0.05s; }
.serie-item-skeleton:nth-child(2) { animation-delay: 0.08s; }
.serie-item-skeleton:nth-child(3) { animation-delay: 0.11s; }
.serie-item-skeleton:nth-child(4) { animation-delay: 0.14s; }
.serie-item-skeleton:nth-child(5) { animation-delay: 0.17s; }
.serie-item-skeleton:nth-child(6) { animation-delay: 0.2s; }
.serie-item-skeleton:nth-child(7) { animation-delay: 0.23s; }
.serie-item-skeleton:nth-child(8) { animation-delay: 0.26s; }
.serie-item-skeleton:nth-child(9) { animation-delay: 0.29s; }
.serie-item-skeleton:nth-child(10) { animation-delay: 0.32s; }
.serie-item-skeleton:nth-child(11) { animation-delay: 0.35s; }
.serie-item-skeleton:nth-child(12) { animation-delay: 0.38s; }
</style>

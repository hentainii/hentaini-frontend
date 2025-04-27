<template>
  <div class="hidden md:block">
    <div class="carousel-skeleton relative rounded-xl overflow-hidden shadow-xl h-[400px] animate-pulse bg-gradient-to-r from-[#1a1a1a] via-[#2c2c2c] to-[#1a1a1a]">
      <div class="absolute inset-0 z-10 bg-gradient-to-r from-black/90 via-black/70 via-50% to-transparent"></div>
      <div class="absolute inset-0 z-20 flex items-end">
        <div class="p-6 w-full md:w-2/3 lg:w-1/2">
          <div class="h-6 w-24 bg-white/20 rounded mb-2"></div>
          <div class="h-6 w-20 bg-white/20 rounded mb-2"></div>
          <div class="h-10 w-48 bg-white/30 rounded mb-4"></div>
          <div class="flex space-x-2 mb-3">
            <div v-for="i in 3" :key="i" class="h-6 w-16 bg-white/20 rounded-full"></div>
          </div>
          <div class="h-16 w-full bg-white/10 rounded mb-4"></div>
          <div class="h-10 w-36 bg-white/30 rounded"></div>
        </div>
      </div>
      <div class="absolute bottom-4 right-4 flex z-30">
        <div v-for="i in 4" :key="i" :class="['h-2', i === 1 ? 'w-5 rounded bg-yellow-400/50' : 'w-2 rounded-full bg-white/30', 'mx-1 animate-pulse']"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No imports necesarios, Nuxt 3 los auto-importa
</script>

<style scoped>
.carousel-skeleton {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { opacity: 0.7; }
  50% { opacity: 0.9; }
  100% { opacity: 0.7; }
}
</style>

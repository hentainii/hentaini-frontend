<template>
  <div class="episode-container bg-black/5 p-4">
    <!-- Skeleton for Breadcrumbs -->
    <div class="hidden md:flex mb-2">
      <div class="w-3/5 h-4 bg-white/20 rounded mb-2"></div>
    </div>
    <div class="flex flex-col md:flex-row gap-4">
      <!-- Columna principal con el reproductor -->
      <div class="flex-1 pb-0">
        <div class="rounded-lg mb-4 shadow-lg overflow-hidden bg-gradient-to-r from-[#1a1a1a] via-[#2c2c2c] to-[#1a1a1a]">
          <!-- Skeleton para el reproductor de video -->
          <div class="w-full h-72 bg-white/10 animate-pulse video-skeleton"></div>
          <!-- Skeleton para los controles del reproductor -->
          <div class="player-controls flex justify-between items-center py-2 px-4 border-t border-black/10 bg-black/5">
            <div class="flex-1 flex justify-between gap-2">
              <div class="h-8 w-20 bg-white/20 rounded"></div>
              <div class="h-8 w-20 bg-white/20 rounded"></div>
              <div class="h-8 w-20 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
        <!-- Skeleton para Título y Navegación -->
        <div class="flex flex-col md:flex-row items-center mb-2 px-1 gap-2">
          <div class="flex-1 py-2">
            <div class="h-8 w-2/3 bg-white/30 rounded mb-2"></div>
          </div>
          <div class="flex justify-center md:justify-end gap-2 py-2">
            <div class="h-8 w-20 bg-white/20 rounded"></div>
            <div class="h-8 w-20 bg-white/20 rounded"></div>
            <div class="h-8 w-20 bg-white/20 rounded"></div>
          </div>
        </div>
        <!-- Skeleton para sección de comentarios -->
        <div class="mb-4 rounded-lg shadow-lg bg-gradient-to-r from-[#1a1a1a] via-[#2c2c2c] to-[#1a1a1a] p-4">
          <div class="h-6 w-1/3 bg-white/20 rounded mb-4"></div>
          <div class="space-y-2">
            <div class="h-4 w-full bg-white/10 rounded"></div>
            <div class="h-4 w-5/6 bg-white/10 rounded"></div>
            <div class="h-4 w-2/3 bg-white/10 rounded"></div>
          </div>
        </div>
        <!-- Skeleton para Series Similares -->
        <div class="mb-4 rounded-lg shadow-lg bg-gradient-to-r from-[#1a1a1a] via-[#2c2c2c] to-[#1a1a1a] p-4">
          <div class="h-6 w-2/5 bg-white/20 rounded mb-4"></div>
          <div class="grid grid-cols-2 gap-3 pt-4">
            <div v-for="i in 4" :key="i" class="serie-item animate-pulse">
              <div class="h-32 w-full bg-white/10 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
      <!-- Columna lateral con información y episodios -->
      <div class="w-full md:w-96 flex-shrink-0 flex flex-col gap-4">
        <!-- Skeleton para Información de la serie -->
        <div class="rounded-lg mb-4 shadow-lg bg-gradient-to-r from-[#1a1a1a] via-[#2c2c2c] to-[#1a1a1a] p-4">
          <div class="h-6 w-3/5 bg-white/20 rounded mb-4"></div>
          <div class="h-4 w-full bg-white/10 rounded mb-2"></div>
          <div class="h-4 w-2/3 bg-white/10 rounded mb-3"></div>
          <div class="border-t border-black/10 my-3"></div>
          <div class="h-5 w-1/3 bg-white/20 rounded mb-2"></div>
          <div class="flex flex-wrap gap-2">
            <div v-for="i in 4" :key="i" class="h-6 w-16 bg-white/20 rounded-full"></div>
          </div>
        </div>
        <!-- Skeleton para Lista de episodios -->
        <div class="rounded-lg mb-4 shadow-lg bg-gradient-to-r from-[#1a1a1a] via-[#2c2c2c] to-[#1a1a1a] p-4">
          <div class="flex justify-between items-center mb-4">
            <div class="h-6 w-2/5 bg-white/20 rounded"></div>
            <div class="h-8 w-16 bg-white/20 rounded"></div>
          </div>
          <div class="space-y-3">
            <div v-for="i in 5" :key="i" class="flex items-center episode-list-item border-b border-black/10 pb-2">
              <div class="h-8 w-8 bg-white/20 rounded-full mr-3"></div>
              <div class="flex-1 h-4 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
        <!-- Skeleton para Anuncios -->
        <div class="w-full h-64 bg-white/10 rounded-lg mb-4 animate-pulse"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No imports necesarios, Nuxt 3 los auto-importa
</script>

<style scoped>
.video-skeleton {
  border-radius: 8px;
  overflow: hidden;
}
.player-controls {
  background-color: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}
.episode-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}
.serie-item {
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
.serie-item:nth-child(1) { animation-delay: 0.1s; }
.serie-item:nth-child(2) { animation-delay: 0.2s; }
.serie-item:nth-child(3) { animation-delay: 0.3s; }
.serie-item:nth-child(4) { animation-delay: 0.4s; }
</style>

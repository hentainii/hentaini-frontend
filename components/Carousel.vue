<template>
  <div class="carousel-container max-w-7xl mx-auto mb-4">
    <div v-if="loading" class="h-96 flex items-center justify-center bg-neutral-900 rounded-xl">
      <span class="text-neutral-400">Loading...</span>
    </div>
    <div v-else-if="isDesktop && !loading" class="relative rounded-xl overflow-hidden shadow-lg h-96">
      <div v-for="(serie, i) in featuredSeries" :key="serie.title" v-show="i === model" class="absolute inset-0 transition-opacity duration-500">
        <img
          :src="`${screenshotEndpoint}${serie.images.find(image => image.image_type.name === 'screenshot').path}`"
          :alt="serie.title"
          class="object-cover w-full h-full"
        />
        <div class="carousel-gradient absolute inset-0 z-10"></div>
        <div class="absolute bottom-0 left-0 p-8 z-20 max-w-xl">
          <div class="flex items-center mb-2">
            <Icon name="mdi:star" size="18" class="text-yellow-400 mr-1" />
            <span class="uppercase text-xs font-bold tracking-widest text-yellow-300">{{ $t('landpage.featured') || 'Featured' }}</span>
          </div>
          <h1 class="carousel-title mb-2">{{ serie.title }}</h1>
          <div class="flex flex-wrap mb-3">
            <span v-for="(genre, i) in serie.genreList" :key="i" class="text-xs border border-white/70 rounded px-2 py-0.5 mr-1 mb-1 bg-white/10 text-white/80">
              {{ genre.name }}
            </span>
          </div>
          <p class="carousel-synopsis mb-2">{{ trimTextToLength(serie.synopsis, 300) }}</p>
          <NuxtLink :to="localePath(`/h/${serie.url}`)" class="inline-flex items-center bg-primary text-white font-bold px-4 py-2 rounded mt-2 shadow hover:bg-primary/80 transition">
            <Icon name="mdi:play-circle" size="22" class="mr-2" />
            {{ $t('landpage.watch_now') || 'Watch Now' }}
          </NuxtLink>
        </div>
        <!-- Dots -->
        <div class="absolute bottom-4 right-4 flex z-30">
          <button v-for="(_, idx) in featuredSeries" :key="idx" @click="model = idx" class="w-3 h-3 rounded-full mx-1 transition-all duration-200" :class="{ 'bg-yellow-400 w-5': idx === model, 'bg-white/50': idx !== model }"></button>
        </div>
        <!-- Prev/Next -->
        <button @click="prev" class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full z-30"><Icon name="mdi:chevron-left" size="24" /></button>
        <button @click="next" class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full z-30"><Icon name="mdi:chevron-right" size="24" /></button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useLocalePath } from '#imports'

const featuredSeries = ref([])
const model = ref(0)
const loading = ref(true)
const screenshotEndpoint = '/uploads/' // Ajusta según tu config
const localePath = useLocalePath()

// Simula isDesktop, reemplaza por tu lógica real si tienes
const isDesktop = true

function trimTextToLength (text, length) {
  if (!text) return ''
  if (text.length > length) return text.substring(0, length) + '...'
  return text
}

function prev () {
  model.value = (model.value - 1 + featuredSeries.value.length) % featuredSeries.value.length
}
function next () {
  model.value = (model.value + 1) % featuredSeries.value.length
}

async function getFeaturedSeries () {
  loading.value = true
  const qs = (await import('qs')).default
  const query = qs.stringify({
    filters: { featured: true },
    populate: ['images', 'images.image_type', 'status', 'genreList'],
    sort: ['createdAt:desc']
  }, { encodeValuesOnly: true })
  const res = await fetch(`/api/series?${query}`) // Ajusta endpoint según tu config
  const series = await res.json()
  series.data.forEach(serie => {
    if (typeof serie.genres === 'string') {
      try { serie.genres = JSON.parse(serie.genres) } catch (e) { serie.genres = [] }
    }
  })
  featuredSeries.value = series.data
  loading.value = false
}

onMounted(() => {
  getFeaturedSeries()
})
</script>

<style scoped>
.carousel-container {
  margin-bottom: 1rem;
}
.carousel-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 30%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.1) 80%,
    rgba(0, 0, 0, 0) 100%
  ), linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 15%,
    rgba(0, 0, 0, 0.4) 30%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0) 70%
  );
  z-index: 1;
}
.carousel-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  color: white;
  background: linear-gradient(to right, #ffffff, #f0f882);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.carousel-synopsis {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  max-width: 90%;
}
</style>

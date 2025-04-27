<template>
  <div class="episode-card group relative flex flex-col rounded-lg overflow-hidden transition-all duration-300 h-full bg-neutral-900 shadow hover:-translate-y-1 hover:shadow-xl">
    <NuxtLink :to="localePath(`/h/${url}/${episodeNumber}`)" :title="`Watch ${title} Episode ${episodeNumber}`" class="block">
      <div class="relative aspect-video w-full overflow-hidden">
        <NuxtImg
          :src="screenshot"
          :alt="title"
          class="episode-image w-full h-full object-cover transition-all duration-500 rounded-lg group-hover:scale-105"
          :placeholder="placeholder"
          format="webp"
          :loading="'lazy'"
        />
        <!-- Badge para "new" -->
        <div v-if="isNew && lessThan7Days(created)" class="new-badge absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow animate-pulse z-10">
          <NuxtIcon name="mdi:star" class="text-xs mr-1" />
          {{ t('episode.new_badge') }}
        </div>
        <!-- Badge para "censorship" -->
        <div v-if="!censorship" class="no-censor-badge absolute bottom-2 right-2 bg-neutral-800/90 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1 shadow z-10">
          <NuxtIcon name="mdi:eye" class="text-xs mr-1" />
          {{ t('episode.uncensored') }}
        </div>
        <!-- Overlay Play -->
        <div class="overlay absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/80 via-black/40 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div class="play-button w-16 h-16 rounded-full border-4 border-white bg-white/20 flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-300">
            <NuxtIcon name="mdi:play" class="text-white text-3xl" />
          </div>
        </div>
      </div>
    </NuxtLink>
    <div class="card-content flex justify-between items-center px-3 py-2 bg-transparent flex-grow">
      <div class="card-details w-4/5">
        <h2 class="episode-title text-white text-sm font-semibold truncate m-0">{{ title }}</h2>
        <p class="episode-number text-xs text-gray-400 m-0 flex">{{ t('episode.episode_number') }} {{ episodeNumber }}</p>
      </div>
      <!-- Watch Later Button + Tooltip -->
      <div class="relative flex items-center">
        <button
          class="watchlater-btn p-2 rounded-full transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500"
          :aria-label="isInWatchLater ? t('watch_later.remove') : t('watch_later.add')"
          @click.stop="isLogin ? toggleWatchLater(serie) : $router.push('/login')"
        >
          <NuxtIcon :name="isInWatchLater ? 'mdi:eye-off-outline' : 'mdi:eye-plus-outline'" :class="isInWatchLater ? 'text-primary-500' : 'text-gray-300'" class="text-xl" />
        </button>
        <div v-if="showTooltip" class="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded shadow z-20 whitespace-nowrap">
          {{ isInWatchLater ? t('watch_later.remove') : t('watch_later.add') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useLocalePath } from '#imports'
import { useI18n } from 'vue-i18n'
import { useRuntimeConfig, useFetch } from '#app'
// NuxtIcon y NuxtImg son auto-importados por Nuxt 3

const props = defineProps({
  episode: { type: Number, default: 0 },
  serie: { type: Number, default: 0 },
  watchlaters: { type: Array, default: () => [] },
  title: { type: String, default: 'No Title' },
  episodeNumber: { type: Number, default: 0 },
  hid: { type: String, default: '0' },
  status: { type: String, default: 'No Status' },
  url: { type: String, default: '' },
  screenshot: { type: String, default: 'default.jpg' },
  placeholder: { type: String, default: 'default_placeholder.jpg' },
  created: { type: String, default: '' },
  isAd: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  censorship: { type: Boolean, default: false }
})
const emit = defineEmits(['refresh'])

const localePath = useLocalePath()
const { t } = useI18n()
const config = useRuntimeConfig()

const isInWatchLater = computed(() =>
  props.watchlaters.some(watchlater => watchlater.serie.id === props.serie && watchlater.episode_number === props.episodeNumber)
)
const thisWatchLater = computed(() =>
  props.watchlaters.find(watchlater => watchlater.serie.id === props.serie && watchlater.episode_number === props.episodeNumber) || null
)
const isLogin = true // Cambia esto por la lógica real de login
const loading = ref(false)
const showTooltip = ref(false)

function lessThan7Days(date) {
  const now = new Date()
  const created = new Date(date)
  const diff = now - created
  return diff < 7 * 24 * 60 * 60 * 1000
}

async function toggleWatchLater(serie) {
  if (!isLogin) {
    // Redirigir a login si no está logueado
    // navigateTo('/login')
    return
  }
  loading.value = true
  if (isInWatchLater.value) {
    // Eliminar de watch later
    const { error } = await useFetch(
      () => `${config.public.API_STRAPI_ENDPOINT}watchlaters/${thisWatchLater.value.id}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        key: `remove-watchlater-${thisWatchLater.value.id}`,
        dedupe: true,
        server: false,
        immediate: true,
        watch: false
      }
    )
    if (!error.value) emit('refresh')
  } else {
    // Agregar a watch later
    const user = null // Cambia esto por el id real del usuario
    const { error } = await useFetch(
      () => `${config.public.API_STRAPI_ENDPOINT}watchlaters`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          data: {
            user,
            serie,
            episode_number: props.episodeNumber
          }
        },
        key: `add-watchlater-${props.serie}-${props.episodeNumber}`,
        dedupe: true,
        server: false,
        immediate: true,
        watch: false
      }
    )
    if (!error.value) emit('refresh')
  }
  loading.value = false
}
</script>

<style scoped>
/* Todo Tailwind, sin CSS extra */
</style>

<template>
  <div v-if="episode" class="episode-container p-2 md:p-4 bg-gray-100 dark:bg-zinc-800 min-h-screen">
    <!-- Breadcrumbs mejorados -->
    <div v-if="isDesktop" class="mb-4">
      <nav class="flex items-center space-x-2 bg-white dark:bg-zinc-900 rounded-lg shadow p-2 border-b border-black/10">
        <NuxtLink v-for="(item, i) in breadcrumb" :key="i" :to="item.to" :class="{'text-primary font-bold': !item.disabled, 'text-gray-400 dark:text-gray-500': item.disabled, 'text-black dark:text-white': true}">
          <span>{{ item.text }}</span>
          <span v-if="i < breadcrumb.length - 1" class="mx-2 text-lg font-bold">•</span>
        </NuxtLink>
      </nav>
    </div>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- Columna principal con el reproductor -->
      <div class="w-full md:w-2/3 space-y-6">
        <div class="overflow-hidden rounded-lg shadow-2xl bg-white dark:bg-zinc-900 border border-black/10">
          <!-- Imagen de portada con botón de reproducción -->
          <div v-if="!showVideo" class="relative w-full aspect-video bg-gray-200 dark:bg-gray-800">
            <img :src="`${config.public.SCREENSHOT_ENDPOINT}${serieScreenshot}`" class="object-cover w-full h-full" alt="Preview" />
            <div class="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition">
              <button class="rounded-full bg-primary p-6 shadow-2xl hover:scale-110 transition-all" @click="showVideo = true">
                <Icon name="mdi:play" size="56" class="text-white" />
              </button>
            </div>
          </div>
          <!-- Reproductor de video -->
          <div v-if="showVideo" class="video-player-container">
            <VideoElement :src="currentUrl" />
          </div>
          <!-- Controles del reproductor -->
          <div class="player-controls py-3 px-2 md:p-4 border-t border-black/5 bg-black/5 flex flex-col md:flex-row items-center justify-between gap-3">
            <!-- Selección de reproductor -->
            <div class="flex-1 flex flex-wrap gap-2 overflow-x-auto">
              <button v-for="player in filteredPlayers" :key="player.name" @focus="changeCurrentUrl(player.url)" @click="changeCurrentUrl(player.url)" class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-sm font-semibold hover:bg-primary hover:text-white transition-all shadow text-black dark:text-white">
                {{ player.name }}
              </button>
            </div>
            <!-- Botones de acción con tooltips -->
            <div class="flex items-center gap-3 mt-2 md:mt-0">
              <div class="relative group">
                <button class="rounded-full bg-primary text-white p-3 hover:bg-primary/80 transition shadow-lg" @click="genDownloadName">
                  <Icon name="mdi:download" size="22" />
                </button>
                <span class="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">{{$t('episode.download')}}</span>
              </div>
              <div class="relative group">
                <button v-if="isAuthenticated" :class="[serieIsPresentInFavorites ? 'bg-red-500' : 'bg-gray-400 dark:bg-gray-600', 'rounded-full text-white p-3 hover:opacity-80 transition shadow-lg']" @click="serieIsPresentInFavorites ? removeFavorite(episode.serie.id) : setFavorite(episode.serie.id)">
                  <Icon name="mdi:heart" size="22" />
                </button>
                <NuxtLink v-else to="/login" class="rounded-full bg-gray-400 dark:bg-gray-600 text-white p-3 shadow-lg">
                  <Icon name="mdi:heart" size="22" />
                </NuxtLink>
                <span class="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">{{$t('favorites.add')}}</span>
              </div>
              <div class="relative group">
                <button v-if="isAuthenticated" :class="[isInWatchLater ? 'bg-green-600' : 'bg-gray-400 dark:bg-gray-600', 'rounded-full text-white p-3 hover:opacity-80 transition shadow-lg']" @click="toggleWatchLater(episode.serie)">
                  <Icon :name="isInWatchLater ? 'mdi:eye-off-outline' : 'mdi:eye-plus-outline'" size="22" />
                </button>
                <NuxtLink v-else to="/login" class="rounded-full bg-gray-400 dark:bg-gray-600 text-white p-3 shadow-lg">
                  <Icon name="mdi:eye-plus-outline" size="22" />
                </NuxtLink>
                <span class="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">{{$t('watch_later.add')}}</span>
              </div>
              <UtilsReportEpisode :episode="episode" />
            </div>
          </div>
        </div>
        <!-- Título y Navegación -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-2 px-1">
          <h1 class="text-xl md:text-2xl font-black truncate text-black dark:text-white">{{ episode.serie.title }} {{ $t('episode.episode_number') }} {{ episode.episode_number }}</h1>
          <div class="flex gap-2 mt-2 md:mt-0 bg-gray-100 dark:bg-zinc-800 rounded-lg shadow px-2 py-1">
            <NuxtLink v-if="episode.serie.episodes[0].episode_number !== episode.episode_number" :to="`/h/${episode.serie.url}/${episode.episode_number - 1}`" class="px-3 py-1 rounded bg-primary text-white flex items-center gap-1 shadow hover:bg-primary/90 transition">
              <Icon name="mdi:arrow-left" />
            </NuxtLink>
            <NuxtLink :to="`/h/${episode.serie.url}`" class="px-3 py-1 rounded bg-primary text-white flex items-center gap-1 shadow hover:bg-primary/90 transition">
              <Icon name="mdi:view-list" />
              {{ $t('episode.list') }}
            </NuxtLink>
            <NuxtLink v-if="episode.serie.episodes.slice(-1)[0].episode_number !== episode.episode_number" :to="`/h/${episode.serie.url}/${episode.episode_number + 1}`" class="px-3 py-1 rounded bg-primary text-white flex items-center gap-1 shadow hover:bg-primary/90 transition">
              <Icon name="mdi:arrow-right" />
            </NuxtLink>
          </div>
        </div>
        <!-- Sección de comentarios -->
        <div class="rounded-lg shadow-lg bg-white dark:bg-zinc-900 border border-black/10 p-4">
          <LayoutComments />
        </div>
      </div>
      <!-- Columna lateral con información y episodios -->
      <div class="w-full md:w-1/3 flex flex-col gap-6">
        <!-- Series Similares -->
        <div class="rounded-lg shadow-lg bg-white dark:bg-zinc-900 border border-black/10">
          <div class="flex items-center gap-2 text-primary font-semibold p-4 border-b border-black/10 text-lg">
            <Icon name="mdi:video-vintage" />
            {{ $t('serie.similar_series') }}
          </div>
          <div class="pt-1 px-2">
            <div class="flex gap-2 overflow-x-auto pb-2">
              <div v-for="serie in similarSeries" :key="serie.id" class="serie-item w-[150px] animate-fadeUpSimilar">
                <SerieCard
                  :title="serie.title"
                  :synopsis="serie.synopsis"
                  :genres="JSON.parse(serie.genres)"
                  :componentgenres="serie.genreList"
                  :status="serie.status.name"
                  :url="serie.url"
                  :screenshot="resolveImages('screenshot', serie)"
                  :placeholder="resolveImages('placeholder', serie)"
                />
              </div>
            </div>
          </div>
        </div>
        <!-- Información de la serie -->
        <div class="rounded-lg shadow-lg bg-white dark:bg-zinc-900 border border-black/10">
          <div class="flex items-center gap-2 text-primary font-semibold p-4 border-b border-black/10 text-lg">
            <Icon name="mdi:information" />
            {{ $t('episode.serie_info') }}
          </div>
          <div class="p-4">
            <p class="mb-3 text-gray-700 dark:text-gray-300 text-sm">{{ episode.serie.synopsis }}</p>
            <hr class="my-3 border-black/10" />
            <div class="mb-2 text-xs font-semibold">{{ $t('episode.genres') }}:</div>
            <div class="flex flex-wrap gap-2">
              <NuxtLink v-for="genre in JSON.parse(episode.serie.genres)" :key="genre.text ? genre.text : genre" :to="`/explore?genre=${genre.url}`" class="px-3 py-1 rounded-full border border-primary text-primary text-xs font-semibold hover:bg-primary hover:text-white transition shadow">
                {{ genre.text ? genre.text : genre.name }}
              </NuxtLink>
            </div>
          </div>
        </div>
        <!-- Lista de episodios -->
        <div class="rounded-lg shadow-lg bg-white dark:bg-zinc-900 border border-black/10">
          <div class="flex items-center justify-between p-4 border-b border-black/10">
            <div class="flex items-center gap-2 text-primary font-semibold text-lg">
              <Icon name="mdi:format-list-numbered" />
              {{ $t('episode.show_episodes') }}
            </div>
            <button @click="show = !show" class="text-primary hover:opacity-80 transition">
              <Icon :name="show ? 'mdi:chevron-up' : 'mdi:chevron-down'" />
            </button>
          </div>
          <transition 
            enter-active-class="transition duration-300 ease-out" 
            leave-active-class="transition duration-200 ease-in"
            enter-from-class="opacity-0 max-h-0" 
            enter-to-class="opacity-100 max-h-[2000px]"
            leave-from-class="opacity-100 max-h-[2000px]" 
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-show="show" class="overflow-hidden">
              <ul class="divide-y divide-black/10">
                <li v-for="episode_item in episode.serie.episodes" :key="episode_item.episode_number">
                  <NuxtLink :to="`/h/${episode.serie.url}/${episode_item.episode_number}`" :class="[episode_item.episode_number == episode.episode_number ? 'bg-primary/10 border-l-4 border-primary' : '', 'flex items-center gap-3 px-4 py-2 hover:bg-black/5 transition text-black dark:text-white']">
                    <span class="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white text-base font-bold shadow">{{ episode_item.episode_number }}</span>
                    <span class="truncate text-sm">{{ episode.serie.title }} {{ $t('episode.episode_number') }} {{ episode_item.episode_number }}</span>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </transition>
        </div>
        <!-- Anuncios -->
        <div class="mt-3 flex justify-center">
          <client-only>
            <div id="bg-ssp-10357" />
            <UtilsVueScriptComponent script="<script data-cfasync='false' src='../../bg.js' type='text/javascript'></script>" />
          </client-only>
        </div>
      </div>
    </div>

    <!-- Modal de descargas mejorado -->
    <dialog v-if="modalDownload" open class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl w-full max-w-md border border-primary">
        <div class="flex items-center justify-between bg-primary text-white rounded-t-lg p-4">
          <span class="truncate font-bold text-lg">{{ $t('episode.download') }} {{ episode.serie.title }} {{ $t('episode.episode_number') }} {{ episode.episode_number }}</span>
          <button @click="modalDownload = false" class="ml-2">
            <Icon name="mdi:close" />
          </button>
        </div>
        <div class="p-6">
          <div class="flex flex-wrap gap-3 justify-center mt-2">
            <a v-for="link in downloadsName" :key="link.name" :href="link.url.url" target="_blank" class="bg-primary text-white px-5 py-3 rounded-lg font-semibold text-base hover:bg-primary/80 transition shadow">
              {{ link.name }}
            </a>
          </div>
        </div>
        <div class="flex justify-end p-4">
          <button @click="modalDownload = false" class="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition font-semibold">{{ $t('episode.close') }}</button>
        </div>
      </div>
    </dialog>
  </div>
  <MiscEpisodeRenderSkeleton v-else />
</template>

<script setup>
import parse from 'url-parse'
import qs from 'qs'

// State y stores
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const episodesStore = useEpisodesStore()
const favoriteStore = useFavoriteStore()
const watchLaterStore = useWatchLaterStore()

const episode = ref(null)
const showVideo = ref(false)
const downloadsName = ref([])
const areDownloadLinksGenerated = ref(false)
const currentUrl = ref('')
const modalDownload = ref(false)
const rating = ref(0)
const show = ref(false)
const user_id = ref('')
const similarSeries = ref([])
const breadcrumb = ref([
  { text: 'Hentaini', disabled: false, to: '/' },
  { text: 'Serie', to: '/', disabled: false, exact: true },
  { text: 'Episode', disabled: true }
])

// Responsive
const isDesktop = ref(true)

// Parametros de ruta
const serieId = computed(() => route.params.serie)
const episodeNumber = computed(() => route.params.episode)

// --- INTEGRACIÓN FAVORITOS Y WATCH LATER ---
// Preparar integración con user store/token
// TODO: Reemplazar estos valores por los del store de usuario cuando esté disponible
const userToken = ref(null) // <-- setear desde user store
const userId = ref(null)   // <-- setear desde user store

// Setear contexto de usuario en stores (llamar esto en login/logout/cambio de usuario)
function setUserContextAll() {
  favoriteStore.setUserContext(userToken.value, userId.value)
  watchLaterStore.setUserContext(userToken.value, userId.value)
}

// Computed favoritos
const serieIsPresentInFavorites = computed(() => {
  if (!episode.value.serie?.id) return false
  return favoriteStore.isFavorited(episode.value.serie.id)
})

// Computed watch later
const isInWatchLater = computed(() => {
  if (!episode.value.serie?.id) return false
  return watchLaterStore.isInWatchLater(episode.value.serie.id, episodeNumber.value)
})

const thisWatchLaterId = computed(() => {
  if (!episode.value.serie?.id) return null
  return watchLaterStore.findWatchLaterEntryId(episode.value.serie.id, episodeNumber.value)
})

const filteredPlayers = computed(() => episode?.value.players.filter(player => player.name !== 'SSB' && player.name !== 'Cloud' && player.name !== 'C'))
const serieScreenshot = computed(() => episode?.value.image ? episode.value.image.path : (episode.value.serie.images?.find(img => img.image_type.name === 'screenshot')?.path || ''))

watch(episode, (ep) => {
  if (ep && ep.serie && ep.serie.title) {
    useHead({
      title: ep.serie.title,
      meta: [
        { name: 'description', content: 'Watch online ' + ep.serie.title + ' in best quality' },
        { name: 'keywords', content: 'Watch online' },
        { rel: 'canonical', href: `https://hentaini.com/h/${ep.serie.url}/${ep.episode_number}` },
        { name: 'language', content: 'en' },
        { name: 'Revisit-After', content: '3 days' },
        { name: 'audience', content: 'all' },
        { name: 'rating', content: 'general' },
        { name: 'distribution', content: 'global' },
        { name: 'document-type', content: 'Public' },
        { name: 'MSSmartTagsPreventParsing', content: 'true' },
        { name: 'robots', content: 'all, index, follow' },
        { name: 'googlebot', content: 'all, index, follow' },
        { name: 'yahoo-slurp', content: 'all, index, follow' },
        { name: 'msnbot', content: 'index, follow' },
        { name: 'googlebot-image', content: 'all' },
        { name: 'title', content: 'Watch ' + ep.serie.title + ' episode ' + ep.episode_number + ' free online HD' },
        { name: 'description', content: 'Watch online ' + ep.serie.title + ' in best quality. I mean, its Hentaini, the best place to watch your favourite series' },
        { name: 'keywords', content: 'Watch online hentai, best HD archive of the best of japanese culture for the world, hentaini, ahegao, yuri, yaoi, tentacle, maid, siscon, brocon' },
        { property: 'og:title', content: ep.serie.title },
        { property: 'og:description', content: 'Its a Hentai site, what do you expect? a no-girlfriend-depression solution?' },
        { property: 'og:url', content: `https://hentaini.com/h/${ep.serie.url}/${ep.episode_number}` },
        { property: 'og:image', content: 'https://hentaini.com/screenshot/' + (ep.serie.background_coverUrl || '') },
        { name: 'author', content: 'hentaini' }
      ]
    })
  }
}, { immediate: true })

// Métodos
function resolveImages(type, serie) {
  if (type === 'screenshot') {
    return `${config.public.COVER_ENDPOINT}${serie.images?.find(img => img.image_type.name === 'cover')?.path || ''}`
  } else if (type === 'placeholder') {
    const img = serie.images?.find(img => img.image_type.name === 'cover')
    return `${config.public.COVER_ENDPOINT}${img?.placeholder || img?.path || ''}`
  } else if (type === 'background') {
    return `${config.public.COVER_ENDPOINT}${serie.background_coverUrl || ''}`
  }
  return ''
}

function isDesktopScreen() {
  isDesktop.value = window.innerWidth >= 960
}

async function getEpisode() {
  // Construir query para Strapi
  const query = qs.stringify({
    filters: {
      serie: { url: { $eq: serieId.value } },
      episode_number: { $eq: episodeNumber.value }
    },
    populate: [
      'serie',
      'serie.images',
      'serie.images.image_type',
      'serie.genreList',
      'serie.episodes',
      'serie.status',
      'image'
    ],
    sort: ['createdAt:desc']
  }, { encodeValuesOnly: true })

  const response = await $fetch(`${config.public.API_STRAPI_ENDPOINT}episodes?${query}`)
  let ep = response.data[0]
  // Parsear players y downloads si existen
  if (ep) {
    try {
      ep.players = ep.players ? JSON.parse(ep.players) : []
    } catch (e) {
      ep.players = []
    }
    try {
      ep.downloads = ep.downloads ? JSON.parse(ep.downloads) : []
    } catch (e) {
      ep.downloads = []
    }
    if (ep.serie && Array.isArray(ep.serie.episodes)) {
      ep.serie.episodes = ep.serie.episodes.sort((a, b) => a.episode_number - b.episode_number)
    }
  }
  episode.value = ep
  episodesStore.setCurrentEpisode(ep)
  setTimeout(() => {
    genCurrentUrl()
    genBreadcrumb()
    setUserId()
    addVisit()
    getSimilarSeries()
    // Refrescar favoritos y watch later si hay usuario
    if (userToken.value && userId.value) {
      fetchFavorites()
      fetchWatchLaters()
    }
  }, 100)
}

// FAVORITOS API
async function fetchFavorites() {
  if (!userToken.value || !userId.value) {
    favoriteStore.setFavorites([])
    return
  }
  const query = qs.stringify({
    filters: { user: userId.value },
    populate: { serie: { populate: { images: { fields: ['path', 'placeholder'] }, status: true } } }
  }, { encodeValuesOnly: true })
  const { data } = await useFetch(
    `${config.public.API_STRAPI_ENDPOINT}favorites?${query}`,
    {
      headers: { Authorization: `Bearer ${userToken.value}` },
      key: `favorites-${userId.value}`
    }
  )
  favoriteStore.setFavorites(data.value?.data || [])
}

async function removeFavorite() {
  if (!userToken.value || !episode.value.serie?.id) return
  const favId = favoriteStore.findFavoriteEntryId(episode.value.serie.id)
  if (favId) {
    await useFetch(
      `${config.public.API_STRAPI_ENDPOINT}favorites/${favId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken.value}` },
        key: `remove-favorite-${favId}`
      }
    )
    await fetchFavorites()
  }
}

// WATCH LATER API
async function fetchWatchLaters() {
  if (!userToken.value || !userId.value) {
    watchLaterStore.setWatchLaters([])
    return
  }
  const query = qs.stringify({
    filters: { user: userId.value },
    populate: ['serie']
  }, { encodeValuesOnly: true })
  const { data } = await useFetch(
    `${config.public.API_STRAPI_ENDPOINT}watchlaters?${query}`,
    {
      headers: { Authorization: `Bearer ${userToken.value}` },
      key: `watchlaters-${userId.value}`
    }
  )
  watchLaterStore.setWatchLaters(data.value?.data || [])
}

async function addWatchLater() {
  if (!userToken.value || !userId.value || !episode.value.serie?.id) return
  await useFetch(
    `${config.public.API_STRAPI_ENDPOINT}watchlaters`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken.value}` },
      body: { data: { user: userId.value, serie: episode.value.serie.id, episode_number: episodeNumber.value } },
      key: `add-watchlater-${userId.value}-${episode.value.serie.id}-${episodeNumber.value}`
    }
  )
  await fetchWatchLaters()
}

async function removeWatchLater() {
  if (!userToken.value || !episode.value.serie?.id) return
  const wlId = watchLaterStore.findWatchLaterEntryId(episode.value.serie.id, episodeNumber.value)
  if (wlId) {
    await useFetch(
      `${config.public.API_STRAPI_ENDPOINT}watchlaters/${wlId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken.value}` },
        key: `remove-watchlater-${wlId}`
      }
    )
    await fetchWatchLaters()
  }
}

async function toggleWatchLater() {
  if (isInWatchLater.value) {
    await removeWatchLater()
  } else {
    await addWatchLater()
  }
}

function changeCurrentUrl(url) {
  currentUrl.value = url
  showVideo.value = false
}

function genCurrentUrl() {
  if (filteredPlayers.value.length > 0) {
    currentUrl.value = filteredPlayers.value[0].url
  }
}

function genBreadcrumb() {
  breadcrumb.value[2].text = 'Episode ' + episode.value.episode_number
  breadcrumb.value[1].text = episode.value.serie.title
  breadcrumb.value[1].to = `/h/${episode.value.serie.url}`
}

function genDownloadName() {
  modalDownload.value = true
  if (!areDownloadLinksGenerated.value) {
    for (let i = 0; i < episode.value.downloads.length; i++) {
      const regex = /([a-z0-9][a-z0-9-]*)?((\.[a-z]{2,6}))$/
      const nameDownload = parse(episode.value.downloads[i].url, true)
      const parsedName = nameDownload.host
      const newName = parsedName.match(regex)
      const newDownloadButtons = {}
      newDownloadButtons.url = episode.value.downloads[i]
      newDownloadButtons.name = newName ? newName[1] : parsedName
      if (!newDownloadButtons.name?.includes('cloudup')) {
        downloadsName.value.push(newDownloadButtons)
        areDownloadLinksGenerated.value = true
      }
    }
  }
}

function setUserId() {
  // TODO: reemplazar por auth real si tienes
  user_id.value = ''
}

function addVisit() {
  if (episode.value.serie?.id && typeof episode.value.serie.visits === 'number') {
    episodesStore.addVisit(episode.value.serie.id, episode.value.serie.visits + 1)
  }
}

function getSimilarSeries() {
  if (!episode.value.serie?.genreList) return
  const currentGenres = episode.value.serie.genreList.map(g => g.text || g.name)
  // Simula fetch de series similares (debería ser un endpoint real)
  // Aquí puedes usar un store de series si tienes
}

onMounted(() => {
  console.log('onMounted')
  getEpisode()
  window.addEventListener('resize', isDesktopScreen)
  isDesktopScreen()
  // Llamar setUserContextAll() aquí si tienes user info
})
</script>

<style scoped>
.episode-container {
  /* El fondo se maneja ahora por clases tailwind en el template */
}

.video-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.video-preview {
  transition: transform 0.3s ease;
}

.video-preview:hover {
  transform: scale(1.02);
}

.player-controls {
  background-color: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.serie-item {
  opacity: 0;
  transform: translateY(15px);
  animation: fadeUpSimilar 0.3s forwards;
}

.player-slide-group {
  max-width: 100%;
  overflow-x: auto;
}

@keyframes fadeUpSimilar {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.serie-item:nth-child(1) { animation-delay: 0.1s; }
.serie-item:nth-child(2) { animation-delay: 0.2s; }
.serie-item:nth-child(3) { animation-delay: 0.3s; }
.serie-item:nth-child(4) { animation-delay: 0.4s; }

@media (max-width: 600px) {
  .episode-container {
    padding: 8px !important;
  }
  
  .player-controls {
    padding: 8px !important;
  }
}
</style>

<template>
  <div v-if="status !== 'pending'">
    <NuxtImg
      v-if="screenshotImage"
      :src="config.public.SCREENSHOT_ENDPOINT + screenshotImage.path"
      alt=""
      class="fixed top-0 left-0 w-full h-screen object-cover opacity-30 z-0 background"
      style="filter: opacity(0.3);"
      format="webp"
      width="1920"
      height="1080"
      quality="70"
      priority
    />
    <div class="relative z-10 max-w-[calc(100%-32px)] mx-auto px-4 py-8">
      <!-- Breadcrumbs -->
      <nav class="text-sm text-gray-400 mb-4 flex items-center gap-2">
        <NuxtLink to="/" class="hover:text-primary-500">{{ t('Home') }}</NuxtLink>
        <span>•</span>
        <span class="text-white">{{ serie.title }}</span>
      </nav>
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Cover + Actions -->
        <div class="flex flex-col items-center md:w-1/5 w-full">
          <NuxtImg
            v-if="coverImage"
            :src="config.public.COVER_ENDPOINT + coverImage.path"
            alt="Cover"
            class="rounded-xl shadow-lg mb-4 w-full max-w-[420px]"
            format="webp"
            width="220"
            height="320"
            quality="80"
            placeholder
          />
          <div v-if="isLoggedIn" class="w-full">
            <button
              class="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white transition font-semibold mb-2"
              :class="{ 'bg-red-500 text-white': serieIsPresentInFavorites }"
              @click="toggleFavorite"
            >
              <Icon name="mdi:heart" class="w-5 h-5" />
              <span>{{ serieIsPresentInFavorites ? t('favorites.remove') : t('favorites.add') }}</span>
            </button>
          </div>
          <div v-else class="w-full">
            <NuxtLink
              :to="localePath('/login')"
              class="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-red-500 text-red-500 bg-transparent hover:bg-red-500 hover:text-white transition font-semibold mb-2"
            >
              <Icon name="mdi:heart" class="w-5 h-5" />
              <span>{{ t('serie.loginToSave') }}</span>
            </NuxtLink>
          </div>
        </div>
        <!-- Serie Info -->
        <div class="flex-1">
          <h1 class="text-3xl font-bold text-white mb-2">{{ serie.title }}</h1>
          <div v-if="serie.title_english" class="text-gray-400 mb-4">English: {{ serie.title_english }}</div>
          <div class="flex flex-wrap gap-2 mb-4">
            <span
              class="px-3 py-1 rounded-full text-xs font-semibold"
              :class="serie.status.name === 'Airing' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'"
            >
              {{ serie.status.name }}
            </span>
            <span
              class="px-3 py-1 rounded-full text-xs font-semibold"
              :class="serie.censorship ? 'bg-red-600 text-white' : 'bg-green-600 text-white'"
            >
              {{ serie.censorship ? 'Censored' : 'No Censorship' }}
            </span>
          </div>
          <div class="mb-4">
            <div class="bg-primary-900/80 border-l-4 border-primary-500 p-4 rounded text-white">
              <strong>{{ t('serie.synopsis') }}</strong> {{ serie.synopsis }}
            </div>
          </div>
          <div class="mb-4">
            <span class="text-white font-semibold">{{ t('serie.genres') }}</span>
            <div class="flex flex-wrap gap-2 mt-2 text-white">
              <NuxtLink
                v-for="(genre, index) in genres"
                :key="index"
                :to="localePath(`/g/${genre.url}`)"
                class="flex items-center gap-1 px-3 py-1 rounded-full border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white text-xs font-semibold transition"
              >
                <Icon name="mdi:play" class="w-3 h-3" />
                {{ genre.name || genre.text }}
              </NuxtLink>
            </div>
          </div>
          <div v-if="studioName" class="text-gray-400 mb-2">
            Studio: {{ studioName }}
          </div>
          <div class="mt-10 mb-5">
            <SerieEpisodeList :serie="serie" :episodes="serie.episodes" />
          </div>
        </div>
      </div>
      <div class="mt-10">
        <LayoutComments />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, useRuntimeConfig, useAsyncData, useLocalePath } from '#imports'
import { useFavoriteStore } from '@/stores/favorite'
import { useUserStore } from '@/stores/user'
import qs from 'qs'
// --- Fin Episodios Listado ---

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { t } = useI18n()
const localePath = useLocalePath()
const favoriteStore = useFavoriteStore()
const userStore = useUserStore()

const serie = ref(null)
const genres = ref([])
const studioName = ref('')
const coverImage = ref(null)
const screenshotImage = ref(null)
const isLoggedIn = computed(() => !!userStore.auth)
const serieIsPresentInFavorites = computed(() => favoriteStore.favorites.some(fav => fav.url === serie.value?.url))

// Fetch serie data
const { data, refresh, status } = await useAsyncData('serie', async () => {
  const query = qs.stringify({
    filters: { url: route.params.serie },
    populate: [
      'images',
      'images.image_type',
      'status',
      'episodes',
      'genreList',
      'studio'
    ]
  }, { encodeValuesOnly: true })
  const res = await $fetch(`${config.public.API_STRAPI_ENDPOINT}series?${query}`)
  return res.data[0]
})

onMounted(() => {
  if (/^\d{6}$/.test(route.params.serie)) {
    const query = qs.stringify({
      filters: { h_id: route.params.serie }
    }, { encodeValuesOnly: true })
    $fetch(`${config.public.API_STRAPI_ENDPOINT}series?${query}`).then(res => {
      if (res.data && res.data[0]) {
        router.push(`/h/${res.data[0].url}`)
      }
    })
  }
})

// Procesar datos de la serie
if (data.value) {
  serie.value = data.value
  genres.value = serie.value.genreList?.length > 0 ? serie.value.genreList : (serie.value.genres ? JSON.parse(serie.value.genres) : [])
  studioName.value = serie.value.studio?.name || serie.value.studio?.data?.attributes?.name || ''
  coverImage.value = serie.value.images?.find(img => img.image_type?.name === 'cover')
  screenshotImage.value = serie.value.images?.find(img => img.image_type?.name === 'screenshot')
  // Ordenar episodios
  if (serie.value.episodes) {
    serie.value.episodes.sort((a, b) => a.episode_number - b.episode_number)
  }
}

// Head/meta
useHead({
  title: serie.title || 'Serie',
  meta: [
    { name: 'description', content: `Watch online ${serie.value?.title} in best quality.` },
    { property: 'og:title', content: `Watch ${serie.value?.title} free online HD` },
    { property: 'og:description', content: `Watch online ${serie.value?.title} in best quality` },
    { property: 'og:image', content: screenshotImage.value ? config.public.SCREENSHOT_ENDPOINT + screenshotImage.value.path : '' },
    { property: 'og:url', content: `https://hentaini.com${route.fullPath}` },
    { property: 'og:type', content: 'video.tv_show' },
    { property: 'og:site_name', content: 'Hentaini' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: `Watch ${serie.value?.title} free online HD` },
    { name: 'twitter:description', content: `Watch online ${serie.value?.title} in best quality.` },
    { name: 'twitter:image', content: screenshotImage.value ? config.public.SCREENSHOT_ENDPOINT + screenshotImage.value.path : '' },
    { name: 'twitter:image:alt', content: serie.value?.title },
    { name: 'language', content: 'en' },
    { name: 'audience', content: 'all' },
    { name: 'rating', content: 'general' },
    { name: 'distribution', content: 'global' },
    { name: 'robots', content: 'all, index, follow' },
    { name: 'author', content: 'hentaini' }
  ]
})

// Favoritos
async function toggleFavorite() {
  if (serieIsPresentInFavorites.value) {
    await favoriteStore.removeFavorite({ serie: serie.value })
  } else {
    await favoriteStore.setNewFavorite({ serie: serie.value })
  }
  await favoriteStore.getFavorites({ user: userStore.auth, serie: serie.value, token: userStore.auth?.token })
}
</script>

<style scoped>
.background::after {
  background: linear-gradient(to bottom, rgb(8 15 40 / 38%) 0%, rgb(18 18 18) 100%);
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
}
</style>

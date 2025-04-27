<template>
  <div class="latest-episodes-container w-full max-w-[calc(100%-32px)] mx-auto px-2 md:px-6 pt-2 pb-5">
    <MiscLatestEpisodesSkeleton v-if="status === 'pending'" />
    <template v-else>
      <div class="section-header mb-5 relative">
        <NuxtLink :to="localePath('/explore')" class="section-link no-underline">
          <div class="header-content flex flex-col">
            <span class="subtitle text-xs uppercase tracking-wider font-semibold text-white bg-primary/15 rounded mb-0.5 shadow-sm animate-fadeIn">
              {{ $t('landpage.latest_episodes_little') }}
            </span>
            <h2 class="title text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-yellow-400 to-indigo-500 bg-clip-text text-transparent animate-fadeIn">
              {{ $t('landpage.latest_episodes') }}
            </h2>
          </div>
        </NuxtLink>
        <div class="animated-bar w-10 h-1 bg-gradient-to-r from-yellow-400 to-indigo-500 rounded mb-3 relative overflow-hidden animate-expandWidth" />
      </div>

      <div class="episodes-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 mt-3">
        <div
          v-for="(episode, idx) in episodes"
          :key="episode.id"
          class="episode-item opacity-0 translate-y-4 animate-fadeUp"
          :style="{ animationDelay: `${0.05 + idx * 0.03}s` }"
        >
          <article>
            <EpisodeCard
              :episode="episode.id"
              :serie="episode.serie.id"
              :title="episode.serie.title"
              :episodeNumber="episode.episode_number"
              :hid="episode.serie.h_id"
              :screenshot="getScreenshotImage(episode)"
              :placeholder="getPlaceholderImage(episode)"
              :created="episode.createdAt"
              :url="episode.serie.url"
              :isAd="episode.isAd"
              :isNew="episode.isNew"
              :censorship="episode.serie.censorship"
              :watchlaters="watchlaters"
              @refresh="refreshEpisodes"
            />
          </article>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue'
import { useFetch, useRuntimeConfig } from '#app'
import { useLocalePath } from '#imports'
import qs from 'qs'

const props = defineProps({
  watchlaters: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['refreshwatchlaters'])
const localePath = useLocalePath()
const config = useRuntimeConfig()
const episodes = ref([])

const query = qs.stringify({
  filters: { visible: true },
  populate: [
    'serie',
    'image',
    'serie.status',
    'serie.genreList',
    'serie.images',
    'serie.images.image_type'
  ],
  sort: ['createdAt:desc'],
  pagination: { limit: 24 }
}, { encodeValuesOnly: true })

const { data, status, refresh } = useFetch(
  () => `${config.public.API_STRAPI_ENDPOINT}episodes?${query}`, 
  { 
    key: 'latest-episodes',
    default: () => ({ data: [] }) 
  }
)

watchEffect(() => {
  if (data.value && data.value.data) {
    episodes.value = data.value.data
  }
})

function getScreenshotImage(episode) {
  if (!episode.image || !episode.image.path) return ''
  return `${config.public.SCREENSHOT_ENDPOINT}${episode.image.path}`
}

function getPlaceholderImage(episode) {
  if (!episode.image) return ''
  return `${config.public.SCREENSHOT_ENDPOINT}${episode.image.placeholder ? episode.image.placeholder : episode.image.path}`
}

function refreshEpisodes() {
  refresh()
  emit('refreshwatchlaters')
}
</script>

<style scoped>
@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
@keyframes expandWidth {
  from {
    width: 0;
    opacity: 1;
  }
  to {
    width: 40px;
    opacity: 1;
  }
}
.episode-item {
  animation: fadeUp 0.3s forwards;
}
.subtitle, .title {
  opacity: 0;
  animation: fadeIn 0.4s forwards;
}
.animated-bar {
  opacity: 0;
  animation: expandWidth 0.4s 0.1s forwards;
}
</style>

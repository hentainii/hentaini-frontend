<template>
  <div class="latest-series-container w-full max-w-[calc(100%-32px)] mx-auto px-2 md:px-6 py-2">
    <MiscLatestSeriesSkeleton v-if="status === 'pending'" />
    <template v-else>
      <div class="section-header">
        <nuxt-link :to="localePath('/explore')" class="section-link">
          <div class="header-content">
            <span class="subtitle">
              {{ $t('landpage.latest_series_little') }}
            </span>
            <h2 class="title">
              {{ $t('landpage.latest_series') }}
            </h2>
          </div>
        </nuxt-link>
        <div class="animated-bar" />
      </div>
      <div class="series-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-3">
        <div
          v-for="(serie, idx) in series"
          :key="serie.id"
          class="serie-item"
          :style="{ animationDelay: `${0.05 + idx * 0.03}s` }"
        >
          <article>
            <SerieCard
              :title="serie.title"
              :synopsis="serie.synopsis"
              :genres="serie.genres"
              :componentgenres="serie.genreList"
              :status="serie.status.name"
              :url="serie.url"
              :screenshot="getCoverImage(serie)"
              :placeholder="getPlaceholderImage(serie)"
            />
          </article>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watchEffect, computed } from 'vue'
import { useFetch, useRuntimeConfig } from '#app'
import { useLocalePath } from '#imports'
import qs from 'qs'

const localePath = useLocalePath()
const config = useRuntimeConfig()
const series = ref([])

const query = qs.stringify({
  populate: [
    'status',
    'images',
    'images.image_type',
    'genreList'
  ],
  sort: ['createdAt:desc'],
  pagination: { limit: 24 }
}, { encodeValuesOnly: true })

const { data, status } = useFetch(
  () => `${config.public.API_STRAPI_ENDPOINT}series?${query}`, 
  { 
    key: 'latest-series',
    default: () => ({ data: [] }) 
  }
)

watchEffect(() => {
  if (data.value && data.value.data) {
    series.value = data.value.data.map(serie => {
      // Parsear genres si es necesario
      if (typeof serie.genres === 'string' && serie.genres) {
        try {
          serie.genres = JSON.parse(serie.genres)
        } catch (e) {
          serie.genres = []
        }
      }
      return serie
    })
  }
})

function getCoverImage(serie) {
  if (!serie.images || !serie.images.length) return ''
  const coverImage = serie.images.find(image => image.image_type && image.image_type.name === 'cover')
  return coverImage ? `${config.public.COVER_ENDPOINT}${coverImage.path}` : ''
}

function getPlaceholderImage(serie) {
  if (!serie.images || !serie.images.length) return ''
  const coverImage = serie.images.find(image => image.image_type && image.image_type.name === 'cover')
  if (!coverImage) return ''
  return `${config.public.COVER_ENDPOINT}${coverImage.placeholder || coverImage.path}`
}
</script>

<style scoped>
.latest-series-container {
  position: relative;
  padding-top: 10px;
  padding-bottom: 30px;
}

.section-header {
  margin-bottom: 20px;
  position: relative;
}

.section-link {
  text-decoration: none;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.subtitle {
  font-size: 0.8rem;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  background: rgba(var(--v-primary-base), 0.15);
  display: inline-block;
  border-radius: 4px;
  margin-bottom: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 6px;
  background: linear-gradient(90deg, #FFC107, #6B66FF);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0;
  animation: fadeIn 0.4s 0.1s forwards;
  line-height: 1.1;
}

.animated-bar {
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #6B66FF, #FFC107);
  border-radius: 3px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  opacity: 0;
  animation: expandWidth 0.4s 0.1s forwards;
}

.animated-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

.series-grid {
  margin-top: 12px;
}

.serie-item {
  opacity: 0;
  transform: translateY(15px);
  animation: fadeUp 0.3s forwards;
}

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

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>

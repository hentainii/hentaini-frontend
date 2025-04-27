<template>
  <div class="serie-card group relative" @mouseenter="hover = true" @mouseleave="hover = false">
    <nuxt-link :to="localePath(`/h/${url}`)" :title="`Watch ${title}`" class="block">
      <div class="card-container relative overflow-hidden rounded-xl shadow-lg h-full">
        <img
          :src="screenshot"
          :alt="title"
          :loading="'lazy'"
          class="card-image object-cover w-full h-full transition-transform duration-700 ease-in-out"
          :style="{ aspectRatio: '9/14' }"
        />
        <div v-if="visits" class="visits-chip flex items-center absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs z-10">
          <Icon name="mdi:eye" class="w-4 h-4" />
          <span class="ml-1">{{ visits.toLocaleString() }}</span>
        </div>
        <div class="card-gradient absolute bottom-0 left-0 w-full h-[70%] z-1 pointer-events-none" />
        <div
          v-if="synopsis"
          :class="['card-overlay absolute top-0 left-0 w-full h-full flex flex-col justify-center p-5 z-20 transition-opacity duration-300', hover ? 'opacity-100 bg-black/80' : 'opacity-0 pointer-events-none']"
        >
          <div class="synopsis-container overflow-hidden">
            <p class="synopsis-text text-white/90 text-sm leading-snug mb-3">
              {{ synopsis.substr(0,180) + '...' }}
            </p>
            <div v-if="componentgenres && componentgenres.length > 0" class="genres-container flex flex-wrap mt-auto">
              <span
                v-for="(genre, index) in componentgenres.slice(0, 3)"
                :key="index"
                class="genre-chip mr-1 mb-1 px-2 py-0.5 rounded bg-white/15 text-white text-xs hover:bg-white/25 transition"
              >
                {{ genre.name }}
              </span>
            </div>
          </div>
        </div>
        <div class="card-title-container absolute bottom-0 left-0 w-full p-4 z-10">
          <h3 class="card-title text-white text-base font-bold m-0 truncate-2-lines drop-shadow">
            {{ title }}
          </h3>
          <div v-if="status" class="status-indicator flex items-center mt-1">
            <span class="status-dot mr-2" :class="statusClass" />
            <span class="status-text text-white/80 text-xs uppercase tracking-wide">{{ status }}</span>
          </div>
        </div>
      </div>
    </nuxt-link>
    <button
      v-if="removeTagWl"
      class="remove-btn absolute right-2 top-2 z-20 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow transition-transform duration-200 hover:scale-110"
      @click.stop="removeWatchLaters"
      aria-label="Remove from Watch Later"
    >
      <Icon name="mdi:close" class="w-4 h-4" />
    </button>
    <button
      v-if="removeTagF"
      class="remove-btn absolute right-2 top-2 z-20 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 shadow transition-transform duration-200 hover:scale-110"
      @click.stop="removeFavorites"
      aria-label="Remove from Favorites"
    >
      <Icon name="mdi:close" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLocalePath } from '#imports'
import { useI18n } from 'vue-i18n'
import { useRuntimeConfig } from '#app'
// import { useUserStore } from '@/stores/user' // Descomentar si tienes un store de usuario

const props = defineProps({
  title: { type: String, default: 'No Title' },
  synopsis: { type: String, default: '' },
  genres: { type: Array, default: () => [{ text: '' }] },
  componentgenres: { type: Array, default: () => [{ name: '' }] },
  status: { type: String, default: '' },
  url: { type: String, default: '' },
  screenshot: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  visits: { type: Number, default: null },
  removeTagWl: { type: Boolean, default: false },
  watchlaterid: { type: Number, default: 0 },
  removeTagF: { type: Boolean, default: false },
  favoriteid: { type: Number, default: 0 }
})
const emit = defineEmits(['refreshwl', 'refreshf'])

const localePath = useLocalePath()
const { t } = useI18n()
const config = useRuntimeConfig()
// const userStore = useUserStore() // Descomentar si tienes un store de usuario

const hover = ref(false)

const statusClass = computed(() => {
  if (!props.status) return ''
  const statusLower = props.status.toLowerCase()
  if (statusLower.includes('ongoing') || statusLower.includes('airing')) {
    return 'bg-green-500 shadow-green-500/60'
  } else if (statusLower.includes('completed') || statusLower.includes('finished')) {
    return 'bg-blue-500 shadow-blue-500/60'
  } else if (statusLower.includes('hiatus') || statusLower.includes('paused')) {
    return 'bg-yellow-400 shadow-yellow-400/60'
  } else {
    return 'bg-gray-400'
  }
})

async function removeWatchLaters() {
  await fetch(`${config.public.API_STRAPI_ENDPOINT}watchlaters/${props.watchlaterid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${userStore.token}` // Ajusta según tu store
    }
  })
  emit('refreshwl')
}

async function removeFavorites() {
  await fetch(`${config.public.API_STRAPI_ENDPOINT}favorites/${props.favoriteid}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // Authorization: `Bearer ${userStore.token}` // Ajusta según tu store
    }
  })
  emit('refreshf')
}
</script>

<style scoped>
.serie-card {
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
}
.serie-card:hover {
  transform: translateY(-8px);
}
.card-gradient {
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 100%);
}
.truncate-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px;
}
</style>

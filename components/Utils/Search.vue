<template>
  <div class="w-full flex flex-col items-center relative">
    <input
      v-model="search"
      type="text"
      :placeholder="t('menu.search_bar_text')"
      class="w-full max-w-xl rounded-lg bg-neutral-900 text-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-gray-400 shadow-md"
      @focus="focus = true"
      @blur="blurFocus"
      autocomplete="off"
    />
    <div
      v-if="search && searchResult && searchResult.length > 0"
      class="absolute top-14 left-0 w-full max-w-xl z-50 bg-neutral-900/90 backdrop-blur-lg rounded-xl shadow-lg border border-neutral-800 mt-2"
    >
      <ul>
        <li v-for="serie in searchResult" :key="serie.id">
          <NuxtLink
            :to="localePath(`/h/${serie.url}`)"
            class="flex items-center gap-4 px-4 py-3 hover:bg-neutral-800 transition-colors rounded-xl"
          >
            <img
              v-if="serie.images && serie.images.length > 0"
              :src="`${config.public.COVER_ENDPOINT}${serie.images.find(image => image.image_type.name === 'cover')?.path || ''}`"
              alt="cover"
              class="w-20 h-20 object-cover rounded-lg flex-shrink-0 bg-neutral-700"
              loading="lazy"
            />
            <div class="flex flex-col min-w-0">
              <span class="font-semibold text-white text-base truncate">{{ serie.title }}</span>
              <span class="text-xs text-gray-400 truncate max-w-xs">{{ serie.synopsis }}</span>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRuntimeConfig, useI18n, useLocalePath, useFetch } from '#imports'

const search = ref('')
const searchResult = ref([])
const focus = ref(false)
const config = useRuntimeConfig()
const { t } = useI18n()
const localePath = useLocalePath()
let lastQuery = ''
let abortController = null

const blurFocus = () => {
  setTimeout(() => { focus.value = false }, 100)
}

watch(search, async (searchQuery) => {
  if (searchQuery.length > 2) {
    const query = `filters[title][$containsi]=${encodeURIComponent(searchQuery)}&populate[0]=images&populate[1]=images.image_type&pagination[limit]=5`
    // Cancel previous request if any
    if (abortController) abortController.abort()
    abortController = new AbortController()
    const { data } = await useFetch(
      () => `${config.public.API_STRAPI_ENDPOINT}series?${query}`,
      {
        key: `search-series-${searchQuery}`,
        dedupe: true,
        server: false,
        immediate: true,
        watch: false,
        signal: abortController.signal
      }
    )
    searchResult.value = data.value?.data || []
  } else {
    searchResult.value = []
  }
})
</script>

<style scoped>
/* No custom styles, todo es Tailwind */
</style>

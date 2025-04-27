<template>
  <div>
    <!-- Skeleton loader while loading -->
    <div v-if="loading" class="w-full flex flex-col gap-4 animate-pulse">
      <div class="h-8 bg-gray-800 rounded w-1/2 mx-auto mt-8"></div>
      <div class="h-6 bg-gray-800 rounded w-1/3 mx-auto"></div>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8">
        <div v-for="i in 8" :key="i" class="h-64 bg-gray-800 rounded-lg"></div>
      </div>
    </div>

    <!-- Main content after loading -->
    <div v-else class="container mx-auto px-2 md:px-6">
      <!-- Título y subtítulo -->
      <div class="mt-8 mb-4">
        <h1 v-if="$route.query.genre" class="text-2xl font-semibold text-white">
          {{ $t('explore.on_genre_title_part_1') }}
          <span class="text-primary font-bold">{{ prettyGenre }}</span>
          {{ $t('explore.on_genre_title_part_2') }}
        </h1>
        <h1 v-else class="text-2xl font-semibold text-white">
          {{ $t('explore.title') }}
        </h1>
        <p v-if="$route.query.genre" class="text-base text-gray-300 mt-2">
          {{ $t('explore.on_genre_suntitle_part_1') }} {{ prettyGenre }} {{ $t('explore.on_genre_suntitle_part_2') }}
        </p>
        <p v-else class="text-base text-gray-300 mt-2">
          {{ $t('explore.subtitle') }}
        </p>
      </div>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar (desktop) -->
        <aside class="hidden lg:block w-full max-w-xs flex-shrink-0">
          <div class="sticky top-8 space-y-6">
            <!-- Filtros -->
            <div class="bg-gray-900 rounded-lg shadow p-4">
              <h2 class="text-base font-bold mb-2">{{ $t('explore.filter.title') }}</h2>
              <div class="flex flex-col gap-2">
                <button
                  v-for="(filter, index) in filtersUI"
                  :key="filter.id"
                  @click="selectFilter(index)"
                  :class="[
                    'text-left px-3 py-2 rounded transition',
                    lastFilter === index ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-gray-800 text-gray-200'
                  ]"
                >
                  <span class="inline-flex items-center gap-2">
                    <Icon name="mdi:filter-outline" class="w-4 h-4" />
                    {{ filter.name }}
                  </span>
                </button>
              </div>
            </div>
            <!-- Orden -->
            <div class="bg-gray-900 rounded-lg shadow p-4">
              <h2 class="text-base font-bold mb-2">{{ $t('explore.order_by.title') }}</h2>
              <div class="flex flex-col gap-2">
                <button
                  v-for="(order, index) in orderUI"
                  :key="order.id"
                  @click="selectOrder(index)"
                  :class="[
                    'text-left px-3 py-2 rounded transition',
                    lastOrder === index ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-gray-800 text-gray-200'
                  ]"
                >
                  <span class="inline-flex items-center gap-2">
                    <Icon name="mdi:sort" class="w-4 h-4" />
                    {{ order.name }}
                  </span>
                </button>
              </div>
            </div>
            <!-- Géneros -->
            <div class="bg-gray-900 rounded-lg shadow p-4 max-h-80 overflow-y-auto">
              <h2 class="text-base font-bold mb-2">{{ $t('explore.genres') }}</h2>
              <div class="flex flex-col gap-1">
                <nuxt-link
                  v-for="genre in genres"
                  :key="genre.name"
                  :to="$route.query.genre !== genre.url ? localePath(`/explore?genre=${genre.url}`) : undefined"
                  @click.native="handleGenreSelection(genre)"
                  :class="[
                    'flex items-center gap-2 px-3 py-2 rounded transition',
                    $route.query.genre === genre.url ? 'bg-primary/20 text-primary font-semibold' : 'hover:bg-gray-800 text-gray-200'
                  ]"
                >
                  <Icon name="mdi:tag" class="w-4 h-4" />
                  <span>{{ genre.name }}</span>
                  <button
                    v-if="$route.query.genre === genre.url"
                    @click.stop.prevent="$router.push('/explore')"
                    class="ml-auto text-gray-400 hover:text-red-500"
                  >
                    <Icon name="mdi:close" class="w-4 h-4" />
                  </button>
                </nuxt-link>
              </div>
            </div>
          </div>
        </aside>

        <!-- Mobile filter chips -->
        <div class="lg:hidden flex flex-wrap gap-2 mb-4">
          <button
            v-for="(filter, index) in filtersUI"
            :key="filter.id"
            @click="selectFilter(index)"
            :class="[
              'px-3 py-1 rounded-full border text-xs font-medium transition',
              lastFilter === index ? 'bg-primary/20 border-primary text-primary' : 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
            ]"
          >
            <Icon name="mdi:filter-outline" class="w-3 h-3 mr-1 inline" />
            {{ filter.name }}
          </button>
          <button
            v-for="(order, index) in orderUI"
            :key="order.id"
            @click="selectOrder(index)"
            :class="[
              'px-3 py-1 rounded-full border text-xs font-medium transition',
              lastOrder === index ? 'bg-primary/20 border-primary text-primary' : 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
            ]"
          >
            <Icon name="mdi:sort" class="w-3 h-3 mr-1 inline" />
            {{ order.name }}
          </button>
          <button
            v-for="genre in genres"
            :key="genre.name"
            @click="handleGenreSelection(genre)"
            :class="[
              'px-3 py-1 rounded-full border text-xs font-medium transition',
              $route.query.genre === genre.url ? 'bg-primary/20 border-primary text-primary' : 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
            ]"
          >
            <Icon name="mdi:tag" class="w-3 h-3 mr-1 inline" />
            {{ genre.name }}
            <Icon v-if="$route.query.genre === genre.url" name="mdi:close" class="w-3 h-3 ml-1 inline" />
          </button>
        </div>

        <!-- Series grid -->
        <main class="flex-1">
          <!-- Paginación superior -->
          <div class="flex justify-center mb-4">
            <nav v-if="pagination.pageCount > 1" class="inline-flex gap-1">
              <button
                v-for="page in pagination.pageCount"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition',
                  pagination.page === page ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                ]"
              >
                {{ page }}
              </button>
            </nav>
          </div>

          <!-- Mensaje de no resultados -->
          <div v-if="series.length === 0" class="flex flex-col items-center justify-center py-16">
            <Icon name="mdi:emoticon-sad-outline" class="w-16 h-16 text-gray-500 mb-4" />
            <h3 class="text-lg text-gray-400 mb-2">{{ $t('explore.no_results') || 'No series found' }}</h3>
            <button
              @click="resetFilters"
              class="px-4 py-2 bg-primary text-white rounded mt-2 hover:bg-primary/80 transition"
            >
              {{ $t('explore.reset_filters') || 'Reset filters' }}
            </button>
          </div>

          <!-- Series grid -->
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <SerieCard
              v-for="serie in series"
              :key="serie.id"
              :title="serie.title"
              :synopsis="serie.synopsis"
              :genres="serie.genres"
              :componentgenres="serie.genreList"
              :status="serie.status.name"
              :url="serie.url"
              :screenshot="`${$config.COVER_ENDPOINT}${serie.images.path}`"
              :visits="serie.visits"
            />
          </div>

          <!-- Paginación inferior -->
          <div class="flex justify-center mt-8 mb-8">
            <nav v-if="pagination.pageCount > 1" class="inline-flex gap-1">
              <button
                v-for="page in pagination.pageCount"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition',
                  pagination.page === page ? 'bg-primary text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                ]"
              >
                {{ page }}
              </button>
            </nav>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { useRoute, useRouter, useRuntimeConfig } from '#imports'
import { useI18n } from 'vue-i18n'
import { useLocalePath } from '#imports'
import SerieCard from '@/components/SerieCard.vue'
const qs = require('qs')

const $route = useRoute()
const $router = useRouter()
const $config = useRuntimeConfig()
const { t } = useI18n()
const localePath = useLocalePath()

const loading = ref(true)
const prettyGenre = ref('')
const series = ref([])
const genres = ref([])
const lastFilter = ref(null)
const lastOrder = ref(null)
const filters = ref({})
const sort = ref(['visits:desc'])
const pagination = reactive({
  page: 1,
  pageSize: 24,
  pageCount: 1
})

const filtersUI = [
  { id: 1, name: t('explore.filter.airing'), url: 'airing' },
  { id: 2, name: t('explore.filter.finalized'), url: 'finalized' },
  { id: 3, name: t('explore.filter.censorship'), url: 'no-censorship' }
]
const orderUI = [
  { id: 1, name: t('explore.order_by.most_views'), url: 'ascending' },
  { id: 2, name: t('explore.order_by.low_views'), url: 'descending' }
]

watch(() => $route.query.genre, async () => {
  await prettyGenreName()
  await getSeries()
})

watch(() => pagination.page, async () => {
  await getSeries()
})

onMounted(async () => {
  loading.value = true
  await getGenres()
  await getSeries()
  await prettyGenreName()
  loading.value = false
})

async function getSeries () {
  const query = qs.stringify({
    filters: {
      ...filters.value,
      genreList: $route.query.genre ? { url: $route.query.genre } : undefined
    },
    sort: sort.value,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize
    },
    populate: [
      'images',
      'images.image_type',
      'status',
      'episodes',
      'genreList'
    ]
  }, { encodeValuesOnly: true })
  const res = await fetch(`${$config.public.API_STRAPI_ENDPOINT}series?${query}`)
  const data = await res.json()
  const resSerie = data.data.map((serie) => {
    try { serie.genres = JSON.parse(serie.genres) } catch (e) { serie.genres = [] }
    serie.images = serie.images.filter(image => image.image_type.name === 'cover')[0] || {}
    pagination.pageCount = data.meta.pagination.pageCount
    return { ...serie }
  })
  series.value = resSerie
}

async function getGenres () {
  const query = qs.stringify({
    sort: ['name:asc'],
    pagination: { page: 1, pageSize: 100 }
  }, { encodeValuesOnly: true })
  const res = await fetch(`${$config.public.API_STRAPI_ENDPOINT}genres?${query}`)
  const data = await res.json()
  genres.value = data.data
}

function selectFilter (filter) {
  if (lastFilter.value === filter) {
    filters.value = {}
    getSeries()
    lastFilter.value = null
    return
  }
  if (filter === 0) {
    filters.value = { status: { name: { $eq: 'Airing' } } }
  } else if (filter === 1) {
    filters.value = { status: { name: { $eq: 'Finalized' } } }
  } else if (filter === 2) {
    filters.value = { censorship: { $eq: false } }
  }
  getSeries()
  lastFilter.value = filter
}

function selectOrder (order) {
  if (lastOrder.value === order) {
    sort.value[0] = 'createdAt:desc'
    getSeries()
    lastOrder.value = null
    return
  }
  if (order === 0) {
    sort.value[0] = 'visits:desc'
  } else if (order === 1) {
    sort.value[0] = 'createdAt:desc'
  }
  getSeries()
  lastOrder.value = order
}

function prettyGenreName () {
  if ($route.query.genre) {
    const g = genres.value.find(genre => genre.url === $route.query.genre)
    if (g) prettyGenre.value = g.name
  }
}

function resetFilters () {
  filters.value = {}
  sort.value = ['visits:desc']
  lastFilter.value = null
  lastOrder.value = null
  if ($route.query.genre) {
    $router.push('/explore')
  } else {
    getSeries()
  }
}

function handleGenreSelection (genre) {
  if ($route.query.genre === genre.url) {
    $router.push('/explore')
  } else {
    $router.push({ path: '/explore', query: { genre: genre.url } })
  }
}

function goToPage (page) {
  if (pagination.page !== page) {
    pagination.page = page
  }
}
</script>

<style scoped>
.text-primary { color: #0072ef; }
.bg-primary { background-color: #0072ef; }
.bg-primary\/20 { background-color: rgba(0,114,239,0.2); }
.border-primary { border-color: #0072ef; }
</style>

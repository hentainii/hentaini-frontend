<template>
  <div>
    <!-- Skeleton loader while loading -->
    <ExploreSkeleton v-if="loading" />

    <!-- Main content after loading -->
    <v-container v-else fluid>
      <v-row>
        <v-container class="pb-0">
          <v-row>
            <v-col v-if="$route.query.genre" cols="12" class="mt-4 px-4">
              <h1 class="text-h4 font-weight-medium">
                {{ $t('explore.on_genre_title_part_1') }} <span class="primary--text font-weight-bold">{{ prettyGenre }}</span> {{ $t('explore.on_genre_title_part_2') }}
              </h1>
              <p class="text-subtitle-1 mt-2">
                {{ $t('explore.on_genre_suntitle_part_1') }} {{ prettyGenre }} {{ $t('explore.on_genre_suntitle_part_2') }}
              </p>
            </v-col>
            <v-col v-else cols="12" class="mt-4 px-4">
              <h1 class="text-h4 font-weight-medium">
                {{ $t('explore.title') }}
              </h1>
              <p class="text-subtitle-1 mt-2">
                {{ $t('explore.subtitle') }}
              </p>
            </v-col>
          </v-row>
        </v-container>
      </v-row>

      <v-row>
        <v-container>
          <v-row>
            <!-- Sidebar filters - will be in a bottom sheet on mobile -->
            <v-col
              cols="12"
              lg="3"
              class="pr-lg-6"
            >
              <div class="d-none d-lg-block sticky-sidebar">
                <v-card class="mb-6 rounded-lg elevation-1">
                  <v-card-title class="subtitle-1 font-weight-bold">
                    {{ $t('explore.filter.title') }}
                  </v-card-title>
                  <v-divider />
                  <v-list dense class="py-0">
                    <v-list-item
                      v-for="(filter, index) in filtersUI"
                      :key="filter.id"
                      :class="lastFilter === index ? 'selected-item' : ''"
                      @click="selectFilter(index)"
                    >
                      <v-list-item-icon class="mr-2">
                        <v-icon small>
                          mdi-filter-outline
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title class="body-2" v-text="filter.name" />
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>

                <v-card class="mb-6 rounded-lg elevation-1">
                  <v-card-title class="subtitle-1 font-weight-bold">
                    {{ $t('explore.order_by.title') }}
                  </v-card-title>
                  <v-divider />
                  <v-list dense class="py-0">
                    <v-list-item
                      v-for="(order, index) in orderUI"
                      :key="order.id"
                      :class="lastOrder === index ? 'selected-item' : ''"
                      @click="selectOrder(index)"
                    >
                      <v-list-item-icon class="mr-2">
                        <v-icon small>
                          mdi-sort
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title class="body-2" v-text="order.name" />
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-card>

                <v-card class="rounded-lg elevation-1">
                  <v-card-title class="subtitle-1 font-weight-bold">
                    {{ $t('explore.genres') }}
                  </v-card-title>
                  <v-divider />
                  <v-list dense class="py-0 genre-list">
                    <v-list-item
                      v-for="genre in genres"
                      :key="genre.name"
                      :to="$route.query.genre !== genre.url ? localePath(`/explore?genre=${genre.url}`) : undefined"
                      :class="$route.query.genre === genre.url ? 'selected-item' : ''"
                      @click="handleGenreSelection(genre)"
                    >
                      <v-list-item-icon class="mr-2">
                        <v-icon small>
                          mdi-tag
                        </v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title class="body-2" v-text="genre.name" />
                      </v-list-item-content>
                      <v-list-item-action v-if="$route.query.genre === genre.url">
                        <v-btn icon x-small @click.stop.prevent="$router.push('/explore')">
                          <v-icon small>
                            mdi-close
                          </v-icon>
                        </v-btn>
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>
                </v-card>
              </div>
            </v-col>

            <!-- Mobile filter buttons -->
            <v-col cols="12" class="d-lg-none px-4 mb-3">
              <v-row class="mx-n1 mb-2">
                <v-col cols="6" class="pa-1">
                  <v-btn
                    block
                    color="grey darken-3"
                    depressed
                    class="rounded-lg text-capitalize py-2 px-2"
                    height="42"
                    @click="showFilterSheet = true"
                  >
                    <v-icon left size="18">
                      mdi-filter-outline
                    </v-icon>
                    <span class="text-truncate">{{ $t('explore.filter.title') }}</span>
                  </v-btn>
                </v-col>
                <v-col cols="6" class="pa-1">
                  <v-btn
                    block
                    color="grey darken-3"
                    depressed
                    class="rounded-lg text-capitalize py-2 px-2"
                    height="42"
                    @click="showOrderSheet = true"
                  >
                    <v-icon left size="18">
                      mdi-sort
                    </v-icon>
                    <span class="text-truncate">{{ $t('explore.order_by.title') }}</span>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row class="mx-n1">
                <v-col cols="12" class="pa-1">
                  <v-btn
                    block
                    color="grey darken-3"
                    depressed
                    class="rounded-lg text-capitalize py-2 px-2"
                    height="42"
                    @click="showGenreSheet = true"
                  >
                    <div class="d-flex align-center justify-space-between w-100">
                      <div class="d-flex align-center">
                        <v-icon left size="18" class="mr-2">
                          mdi-tag-multiple
                        </v-icon>
                        <span class="text-truncate">{{ $t('explore.genres') }}</span>
                      </div>
                      <v-chip
                        v-if="$route.query.genre"
                        x-small
                        color="primary"
                        outlined
                        class="ml-2"
                      >
                        {{ prettyGenre }}
                      </v-chip>
                    </div>
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>

            <!-- Series grid -->
            <v-col
              cols="12"
              lg="9"
            >
              <!-- Series grid pagination -->
              <v-row class="justify-center mb-4">
                <v-pagination
                  v-model="pagination.page"
                  :length="pagination.pageCount"
                  :total-visible="6"
                  :disabled="loadingMore"
                  circle
                />
              </v-row>

              <!-- Active filters chips (mobile) -->
              <v-row v-if="lastFilter !== null || lastOrder !== null || $route.query.genre" class="px-4 d-lg-none mb-2">
                <v-col cols="12" class="pa-0">
                  <v-chip
                    v-if="lastFilter !== null"
                    class="mr-2 mb-2"
                    small
                    outlined
                    close
                    color="primary"
                    @click:close="selectFilter(lastFilter)"
                  >
                    <v-icon left x-small>
                      mdi-filter-outline
                    </v-icon>
                    {{ filtersUI[lastFilter].name }}
                  </v-chip>
                  <v-chip
                    v-if="lastOrder !== null"
                    class="mr-2 mb-2"
                    small
                    outlined
                    close
                    color="primary"
                    @click:close="selectOrder(lastOrder)"
                  >
                    <v-icon left x-small>
                      mdi-sort
                    </v-icon>
                    {{ orderUI[lastOrder].name }}
                  </v-chip>
                  <v-chip
                    v-if="$route.query.genre"
                    class="mr-2 mb-2"
                    small
                    outlined
                    close
                    color="primary"
                    @click:close="$router.push('/explore')"
                  >
                    <v-icon left x-small>
                      mdi-tag
                    </v-icon>
                    {{ prettyGenre }}
                  </v-chip>
                </v-col>
              </v-row>

              <!-- Series grid -->
              <v-row>
                <v-col
                  v-for="serie in series"
                  :key="serie.id"
                  cols="6"
                  sm="4"
                  md="4"
                  lg="3"
                  class="pa-2"
                >
                  <SerieCard
                    :title="serie.title"
                    :synopsis="serie.synopsis"
                    :genres="serie.genres"
                    :componentgenres="serie.genreList"
                    :status="serie.status.name"
                    :url="serie.url"
                    :image="getCoverImage(serie)"
                    :visits="serie.visits"
                  />
                </v-col>
              </v-row>

              <!-- Loading more content indicator -->
              <v-row v-if="loadingMore" class="justify-center py-4">
                <v-progress-circular
                  indeterminate
                  color="primary"
                />
              </v-row>

              <!-- No results message -->
              <v-row v-else-if="series.length === 0" class="justify-center py-8">
                <v-col cols="12" class="text-center">
                  <v-icon size="64" color="grey lighten-1">
                    mdi-emoticon-sad-outline
                  </v-icon>
                  <h3 class="mt-4 grey--text text--darken-1">
                    {{ $t('explore.no_results') || 'No series found' }}
                  </h3>
                  <v-btn
                    text
                    color="primary"
                    class="mt-2"
                    @click="resetFilters"
                  >
                    {{ $t('explore.reset_filters') || 'Reset filters' }}
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Bottom pagination -->
              <v-row class="justify-center mt-6 mb-8">
                <v-pagination
                  v-model="pagination.page"
                  :length="pagination.pageCount"
                  :total-visible="6"
                  :disabled="loadingMore"
                  circle
                />
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-row>

      <!-- Mobile bottom sheets -->
      <v-bottom-sheet v-model="showFilterSheet" inset>
        <v-sheet class="rounded-t-lg pa-4 overflow-y-scroll" height="auto">
          <div class="d-flex align-center mb-4">
            <h3 class="text-subtitle-1 font-weight-medium">
              {{ $t('explore.filter.title') }}
            </h3>
            <v-spacer />
            <v-btn icon small @click="showFilterSheet = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-list class="pa-0">
            <v-list-item
              v-for="(filter, index) in filtersUI"
              :key="filter.id"
              :class="lastFilter === index ? 'selected-item' : ''"
              @click="selectFilter(index); showFilterSheet = false"
            >
              <v-list-item-icon>
                <v-icon>mdi-filter-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="filter.name" />
              </v-list-item-content>
              <v-list-item-action v-if="lastFilter === index">
                <v-icon color="primary">
                  mdi-check
                </v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-bottom-sheet>

      <v-bottom-sheet v-model="showOrderSheet" inset>
        <v-sheet class="rounded-t-lg pa-4 overflow-y-scroll" height="auto">
          <div class="d-flex align-center mb-4">
            <h3 class="text-subtitle-1 font-weight-medium">
              {{ $t('explore.order_by.title') }}
            </h3>
            <v-spacer />
            <v-btn icon small @click="showOrderSheet = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-list class="pa-0">
            <v-list-item
              v-for="(order, index) in orderUI"
              :key="order.id"
              :class="lastOrder === index ? 'selected-item' : ''"
              @click="selectOrder(index); showOrderSheet = false"
            >
              <v-list-item-icon>
                <v-icon>mdi-sort</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="order.name" />
              </v-list-item-content>
              <v-list-item-action v-if="lastOrder === index">
                <v-icon color="primary">
                  mdi-check
                </v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-bottom-sheet>

      <v-bottom-sheet v-model="showGenreSheet" inset>
        <v-sheet class="rounded-t-lg pa-4 overflow-y-auto" height="auto" max-height="70vh">
          <div class="d-flex align-center mb-4">
            <h3 class="text-subtitle-1 font-weight-medium">
              {{ $t('explore.genres') }}
            </h3>
            <v-spacer />
            <v-btn icon small @click="showGenreSheet = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-list class="pa-0">
            <v-list-item
              v-for="genre in genres"
              :key="genre.name"
              :to="$route.query.genre !== genre.url ? localePath(`/explore?genre=${genre.url}`) : undefined"
              :class="$route.query.genre === genre.url ? 'selected-item' : ''"
              @click="handleGenreSelection(genre)"
            >
              <v-list-item-icon class="mr-2">
                <v-icon small>
                  mdi-tag
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="body-2" v-text="genre.name" />
              </v-list-item-content>
              <v-list-item-action v-if="$route.query.genre === genre.url">
                <v-btn icon x-small @click.stop.prevent="$router.push('/explore')">
                  <v-icon small>
                    mdi-close
                  </v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-bottom-sheet>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'Explore',
  components: {
    ExploreSkeleton: () => import('@/components/misc/ExploreSkeleton')
  },
  data () {
    return {
      expanded: [0],
      expandedOrderBy: [0],
      expandedFilterBy: [0],
      innerWidth: 0,
      prettyGenre: '',
      series: [],
      seriesCount: 0,
      lastFilter: null,
      lastOrder: null,
      showFilterSheet: false,
      showOrderSheet: false,
      showGenreSheet: false,
      loading: true,
      loadingMore: false,
      genres: {
        episodes: {
          urlName: ''
        }
      },
      defaultOrder: [
        'visits:desc'
      ],
      sort: [
        'visits:desc'
      ],
      filters: {},
      pagination: {
        page: 1,
        pageSize: 24
      },
      filtersUI: [
        { id: 1, name: this.$t('explore.filter.airing'), url: 'airing', class: 'grey darken-4' },
        { id: 2, name: this.$t('explore.filter.finalized'), url: 'finalized', class: 'grey darken-4' },
        { id: 3, name: this.$t('explore.filter.censorship'), url: 'no-censorship', class: 'grey darken-4' }
      ],
      orderUI: [
        { id: 1, name: this.$t('explore.order_by.most_views'), url: 'ascending' },
        { id: 2, name: this.$t('explore.order_by.low_views'), url: 'descending' }
      ],
      breadcrumb: [
        {
          text: 'Hentaini',
          disabled: false,
          href: '/'
        },
        {
          text: 'Explore',
          disabled: true
        }
      ]
    }
  },
  watch: {
    '$route.query.genre': {
      handler () {
        this.prettyGenreName()
        this.getSeries()
      },
      deep: false
    },
    'pagination.page': {
      handler () {
        this.loadingMore = true
        this.getSeries()
      },
      deep: false
    },
    innerWidth (innerWidth) {
      if (innerWidth < 1264) {
        this.expanded = []
        this.expandedOrderBy = []
        this.expandedFilterBy = []
      } else {
        this.expanded = [0]
        this.expandedOrderBy = [0]
        this.expandedFilterBy = [0]
      }
    }
  },
  async mounted () {
    this.loading = true
    await this.getGenres()
    await this.getSeries()
    await this.prettyGenreName()
    this.loading = false
  },
  beforeMount () {
    this.getSize()
  },
  methods: {
    async getSeries () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          ...this.filters,
          genreList: this.$route.query.genre ? { url: this.$route.query.genre } : undefined
        },
        sort: this.sort,
        pagination: this.pagination,
        populate: [
          'images',
          'images.image_type',
          'status',
          'episodes',
          'genreList'
        ]
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`)
        .then(res => res.json())
        .then((series) => {
          const resSerie = series.data.map((serie) => {
            serie.genres = JSON.parse(serie.genres)
            this.pagination = series.meta.pagination
            return {
              ...serie
            }
          })
          this.series = resSerie
          this.loadingMore = false
        })
        .catch((error) => {
          console.error('Error fetching series:', error)
          this.loadingMore = false
        })
    },
    async getGenres () {
      const qs = require('qs')
      const query = qs.stringify({
        sort: [
          'name:asc'
        ],
        pagination: {
          page: 1,
          pageSize: 100
        }
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}genres?${query}`)
        .then(res => res.json())
        .then((genres) => {
          this.genres = genres.data
        })
        .catch((error) => {
          console.error('Error fetching genres:', error)
        })
    },
    selectFilter (filter) {
      if (this.lastFilter === filter) {
        this.filters = {}
        this.getSeries()
        this.lastFilter = null
        return
      }
      const airingFilter = {
        status: {
          name: {
            $eq: 'Airing'
          }
        }
      }
      const finalizedFilter = {
        status: {
          name: {
            $eq: 'Finalized'
          }
        }
      }
      const censorshipFilter = {
        censorship: {
          $eq: false
        }
      }
      if (filter === 0) {
        this.filters = airingFilter
      } else if (filter === 1) {
        this.filters = finalizedFilter
      } else if (filter === 2) {
        this.filters = censorshipFilter
      }
      this.getSeries()
      this.lastFilter = filter
    },
    selectOrder (order) {
      if (this.lastOrder === order) {
        this.sort[0] = 'createdAt:desc'
        this.getSeries()
        this.lastOrder = null
        return
      }
      if (order === 0) {
        this.sort[0] = 'visits:desc'
      } else if (order === 1) {
        this.sort[0] = 'createdAt:desc'
      }
      this.getSeries()
      this.lastOrder = order
    },
    getSize () {
      window.addEventListener('resize', () => {
        this.innerWidth = window.innerWidth
      })
      this.innerWidth = window.innerWidth
      if (innerWidth < 1264) {
        this.expanded = []
        this.expandedOrderBy = []
        this.expandedFilterBy = []
      } else {
        this.expanded = [0]
        this.expandedOrderBy = [0]
        this.expandedFilterBy = [0]
      }
    },
    prettyGenreName () {
      if (this.$route.query.genre) {
        const g = this.genres.find(genre => genre.url === this.$route.query.genre)
        if (g) {
          this.prettyGenre = g.name
        }
      }
    },
    resetFilters () {
      this.filters = {}
      this.sort = ['visits:desc']
      this.lastFilter = null
      this.lastOrder = null
      if (this.$route.query.genre) {
        this.$router.push('/explore')
      } else {
        this.getSeries()
      }
    },
    handleGenreSelection (genre) {
      if (this.$route.query.genre === genre.url) {
        this.$router.push('/explore')
      } else {
        this.$router.push({ path: '/explore', query: { genre: genre.url } })
      }
      this.showGenreSheet = false
    },
    getCoverImage (serie) {
      if (!serie.images || !Array.isArray(serie.images)) {
        return {
          path: '',
          placeholder: '',
          cf_path: null,
          cf_placeholder: null
        }
      }
      const coverImage = serie.images.find(image => image.image_type && image.image_type.name === 'cover')
      if (!coverImage) {
        return {
          path: '',
          placeholder: '',
          cf_path: null,
          cf_placeholder: null
        }
      }
      return {
        path: coverImage.path || '',
        placeholder: coverImage.placeholder || '',
        cf_path: coverImage.cf_path || null,
        cf_placeholder: coverImage.cf_placeholder || null
      }
    }
  }
}
</script>

<style scoped>
.selected-item {
  background-color: rgba(var(--v-primary-base), 0.1) !important;
}

.v-list-item {
  min-height: 40px !important;
}

.v-card {
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.v-card .v-card-title {
  padding: 12px 16px;
}

.v-sheet.v-bottom-sheet {
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.sticky-sidebar {
  position: sticky;
  top: 16px;
  height: calc(100vh - 32px);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  padding-right: 8px;
}

.sticky-sidebar::-webkit-scrollbar {
  width: 5px;
}

.sticky-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sticky-sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.genre-list {
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.genre-list::-webkit-scrollbar {
  width: 5px;
}

.genre-list::-webkit-scrollbar-track {
  background: transparent;
}

.genre-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}
</style>

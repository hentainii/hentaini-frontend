<template>
  <div>
    <!-- Skeleton loader while loading -->
    <StudiosSkeleton v-if="loading" />

    <!-- Main content after loading -->
    <v-container v-else fluid>
      <v-row>
        <v-container class="pb-0">
          <!-- Breadcrumbs -->
          <v-row>
            <v-col cols="12" class="px-4 pb-0">
              <v-breadcrumbs
                :items="breadcrumbs"
                divider=">"
                class="pa-0"
              >
                <template #item="{ item }">
                  <v-breadcrumbs-item
                    :href="item.href"
                    :disabled="item.disabled"
                    :to="item.to"
                    class="text-body-2"
                  >
                    <v-icon
                      v-if="item.icon"
                      :color="item.color"
                      class="mr-1"
                      size="16"
                    >
                      {{ item.icon }}
                    </v-icon>
                    {{ item.text }}
                  </v-breadcrumbs-item>
                </template>
              </v-breadcrumbs>
            </v-col>
          </v-row>

          <!-- Title Section -->
          <v-row>
            <v-col v-if="$route.query.producer" cols="12" class="mt-2 px-4">
              <h1 class="text-h4 font-weight-medium">
                <v-icon color="blue" class="mr-2">
                  mdi-camera-outline
                </v-icon>
                {{ $t('studios.on_producer_title_part_1') || 'Studios from' }}
                <span class="primary--text font-weight-bold">{{ prettyProducerName }}</span>
              </h1>
              <p class="text-subtitle-1 mt-2">
                {{ $t('studios.on_producer_subtitle') || 'Explore all studios under this producer' }}
              </p>
            </v-col>
            <v-col v-else cols="12" class="mt-2 px-4">
              <h1 class="text-h4 font-weight-medium">
                <v-icon color="blue" class="mr-2">
                  mdi-camera-outline
                </v-icon>
                {{ $t('studios.title') || 'Studios' }}
              </h1>
              <p class="text-subtitle-1 mt-2">
                {{ $t('studios.subtitle') || 'Discover animation studios behind your favorite series' }}
              </p>
            </v-col>
          </v-row>
        </v-container>
      </v-row>

      <v-row>
        <v-container>
          <v-row>
            <!-- Sidebar filters - desktop -->
            <v-col
              cols="12"
              lg="3"
              class="pr-lg-6"
            >
              <div class="d-none d-lg-block sticky-sidebar">
                <!-- Order By Filter -->
                <v-card class="mb-6 rounded-lg elevation-1">
                  <v-card-title class="subtitle-1 font-weight-bold">
                    {{ $t('studios.order_by.title') || 'Order By' }}
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

                <!-- Search -->
                <v-card class="rounded-lg elevation-1">
                  <v-card-title class="subtitle-1 font-weight-bold">
                    {{ $t('studios.search') || 'Search' }}
                  </v-card-title>
                  <v-divider />
                  <v-card-text>
                    <v-text-field
                      v-model="searchQuery"
                      :placeholder="$t('studios.search_placeholder') || 'Search studios...'"
                      outlined
                      dense
                      hide-details
                      prepend-inner-icon="mdi-magnify"
                      clearable
                      @input="debouncedSearch"
                    />
                  </v-card-text>
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
                    @click="showOrderSheet = true"
                  >
                    <v-icon left size="18">
                      mdi-sort
                    </v-icon>
                    <span class="text-truncate">{{ $t('studios.order_by.title') || 'Sort' }}</span>
                  </v-btn>
                </v-col>
                <v-col cols="6" class="pa-1">
                  <v-btn
                    block
                    color="grey darken-3"
                    depressed
                    class="rounded-lg text-capitalize py-2 px-2"
                    height="42"
                    @click="showSearchSheet = true"
                  >
                    <v-icon left size="18">
                      mdi-magnify
                    </v-icon>
                    <span class="text-truncate">{{ $t('studios.search') || 'Search' }}</span>
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>

            <!-- Content grid -->
            <v-col
              cols="12"
              lg="9"
            >
              <!-- Pagination -->
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
              <v-row v-if="lastOrder !== null || searchQuery" class="px-4 d-lg-none mb-2">
                <v-col cols="12" class="pa-0">
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
                    v-if="searchQuery"
                    class="mr-2 mb-2"
                    small
                    outlined
                    close
                    color="primary"
                    @click:close="clearSearch"
                  >
                    <v-icon left x-small>
                      mdi-magnify
                    </v-icon>
                    {{ searchQuery }}
                  </v-chip>
                </v-col>
              </v-row>

              <!-- Content grid - Always showing Studios -->
              <v-row>
                <v-col
                  v-for="studio in studios"
                  :key="studio.id"
                  cols="6"
                  sm="4"
                  md="4"
                  lg="3"
                  class="pa-2"
                >
                  <StudioCard
                    :studio="studio"
                    @click="goToStudio(studio)"
                    @view-series="goToStudio(studio)"
                    @view-producer="goToProducerDetails(studio)"
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
              <v-row v-else-if="getCurrentItems().length === 0" class="justify-center py-8">
                <v-col cols="12" class="text-center">
                  <v-icon size="64" color="grey lighten-1">
                    mdi-emoticon-sad-outline
                  </v-icon>
                  <h3 class="mt-4 grey--text text--darken-1">
                    {{ $t('studios.no_results') || 'No results found' }}
                  </h3>
                  <v-btn
                    text
                    color="primary"
                    class="mt-2"
                    @click="resetFilters"
                  >
                    {{ $t('studios.reset_filters') || 'Reset filters' }}
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

      <v-bottom-sheet v-model="showOrderSheet" inset>
        <v-sheet class="rounded-t-lg pa-4" height="auto">
          <div class="d-flex align-center mb-4">
            <h3 class="text-subtitle-1 font-weight-medium">
              {{ $t('studios.order_by.title') || 'Order By' }}
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

      <v-bottom-sheet v-model="showSearchSheet" inset>
        <v-sheet class="rounded-t-lg pa-4" height="auto">
          <div class="d-flex align-center mb-4">
            <h3 class="text-subtitle-1 font-weight-medium">
              {{ $t('studios.search') || 'Search' }}
            </h3>
            <v-spacer />
            <v-btn icon small @click="showSearchSheet = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-text-field
            v-model="searchQuery"
            :placeholder="$t('studios.search_placeholder') || 'Search studios...'"
            outlined
            dense
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            autofocus
            @input="debouncedSearch"
          />
        </v-sheet>
      </v-bottom-sheet>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'Studios',
  components: {
    StudiosSkeleton: () => import('@/components/misc/StudiosSkeleton'),
    StudioCard: () => import('@/components/Cards/StudioCard')
  },
  data () {
    return {
      loading: true,
      loadingMore: false,
      searchQuery: '',
      searchTimeout: null,
      prettyProducerName: '',
      lastOrder: null,
      showOrderSheet: false,
      showSearchSheet: false,
      studios: [],
      pagination: {
        page: 1,
        pageSize: 24,
        pageCount: 1
      },
      orderUI: [
        { id: 1, name: 'Name A-Z', url: 'name:asc' },
        { id: 2, name: 'Name Z-A', url: 'name:desc' },
        { id: 3, name: 'Most Series', url: 'series_count:desc' },
        { id: 4, name: 'Newest', url: 'createdAt:desc' }
      ]
    }
  },
  computed: {
    breadcrumbs () {
      const crumbs = [
        {
          text: 'Home',
          to: this.localePath('/'),
          icon: 'mdi-home',
          color: 'grey',
          disabled: false
        }
      ]

      // Si estamos viendo studios de una productora, el flujo es: Home > Producers > Producer X
      if (this.$route.query.producer) {
        crumbs.push({
          text: this.$t('producers.title') || 'Producers',
          to: this.localePath('/producers'),
          icon: 'mdi-office-building',
          color: 'orange',
          disabled: false
        })

        crumbs.push({
          text: this.prettyProducerName,
          to: this.localePath(`/producers/${this.prettyProducerName}`), // Idealmente debería ser el ID
          icon: 'mdi-office-building',
          color: 'orange',
          disabled: true
        })
      } else {
        // Si estamos viendo todos los studios sin filtro, es: Home > Studios
        crumbs.push({
          text: this.$t('studios.title') || 'Studios',
          to: this.localePath('/studios'),
          icon: 'mdi-camera-outline',
          color: 'blue',
          disabled: true
        })
      }

      return crumbs
    },
    debouncedSearch () {
      return () => {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = setTimeout(() => {
          this.performSearch()
        }, 500)
      }
    }
  },
  watch: {
    '$route.query': {
      handler () {
        this.handleRouteChange()
      },
      deep: false
    },
    'pagination.page': {
      handler () {
        this.loadingMore = true
        this.loadData()
      },
      deep: false
    }
  },
  async mounted () {
    this.loading = true
    await this.handleRouteChange()
    this.loading = false
  },
  methods: {
    async handleRouteChange () {
      if (this.$route.query.producer) {
        this.prettyProducerName = this.$route.query.producer
        await this.getStudiosByProducer()
      } else {
        await this.getStudios()
      }
    },
    async getStudios () {
      try {
        const qs = require('qs')

        const filters = {}
        if (this.searchQuery) {
          filters.name = {
            $contains: this.searchQuery
          }
        }
        if (this.$route.query.producer) {
          filters.producers = {
            name: this.$route.query.producer
          }
        }

        let sort = ['name:asc']
        if (this.lastOrder !== null) {
          sort = [this.orderUI[this.lastOrder].url]
        }

        const query = qs.stringify({
          filters,
          sort,
          pagination: this.pagination,
          populate: ['producers', 'series']
        }, {
          encodeValuesOnly: true
        })

        await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios?${query}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then((data) => {
            const studios = data.data.map(studio => ({
              ...studio,
              seriesCount: studio.series?.length || 0,
              producerName: studio.producers?.[0]?.name || 'Unknown'
            }))

            this.studios = studios
            this.pagination = data.meta.pagination
          })
          .catch((error) => {
            console.error('Error loading studios:', error)
          })
      } catch (error) {
        console.error('Error loading studios:', error)
      }
      this.loadingMore = false
    },
    async getStudiosByProducer () {
      try {
        const qs = require('qs')

        const filters = {
          producers: {
            name: this.prettyProducerName
          }
        }
        if (this.searchQuery) {
          filters.name = {
            $contains: this.searchQuery
          }
        }

        let sort = ['name:asc']
        if (this.lastOrder !== null) {
          sort = [this.orderUI[this.lastOrder].url]
        }

        const query = qs.stringify({
          filters,
          sort,
          pagination: this.pagination,
          populate: ['producers', 'series']
        }, {
          encodeValuesOnly: true
        })

        await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios?${query}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.$store.state.auth.token}`
          }
        })
          .then(res => res.json())
          .then((data) => {
            const studios = data.data.map(studio => ({
              ...studio,
              seriesCount: studio.series?.length || 0,
              producerName: studio.producers?.[0]?.name || 'Unknown'
            }))

            this.studios = studios
            this.pagination = data.meta.pagination
          })
          .catch((error) => {
            console.error('Error loading studios by producer:', error)
          })
      } catch (error) {
        console.error('Error loading studios by producer:', error)
      }
      this.loadingMore = false
    },

    selectOrder (index) {
      if (this.lastOrder === index) {
        this.lastOrder = null
        return
      }
      this.lastOrder = index
      if (this.$route.query.producer) {
        this.getStudiosByProducer()
      } else {
        this.getStudios()
      }
    },
    performSearch () {
      // Implement search logic here
      this.pagination.page = 1
      if (this.$route.query.producer) {
        this.getStudiosByProducer()
      } else {
        this.getStudios()
      }
    },
    clearSearch () {
      this.searchQuery = ''
      this.performSearch()
    },
    resetFilters () {
      this.searchQuery = ''
      this.lastOrder = null
      this.pagination.page = 1
      if (this.$route.query.producer) {
        this.$router.push('/studios')
      } else {
        this.getStudios()
      }
    },
    goToStudio (studio) {
      this.$router.push({ path: `/studios/${studio.id}` })
    },
    goToProducerDetails (studio) {
      // Navegar a la página de detalles de la productora del estudio
      if (studio.producers && studio.producers[0] && studio.producers[0].id) {
        this.$router.push({ path: `/producers/${studio.producers[0].id}` })
      } else if (studio.producerName) {
        // Si no tenemos el ID, navegar por nombre
        this.$router.push({ path: '/producers', query: { search: studio.producerName } })
      }
    },
    getCurrentItems () {
      return this.studios
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

/* Breadcrumbs styling */
.v-breadcrumbs {
  padding: 8px 0 !important;
}

.v-breadcrumbs-item {
  font-size: 0.875rem !important;
}

.v-breadcrumbs-item:hover:not(.v-breadcrumbs-item--disabled) {
  color: var(--v-primary-base) !important;
}

/* Card overlay improvements */
.card-overlay {
  min-height: 120px;
}
</style>

<template>
  <div>
    <!-- Skeleton loader while loading -->
    <ProducersSkeleton v-if="loading" />

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
            <v-col cols="12" class="mt-2 px-4">
              <h1 class="text-h4 font-weight-medium">
                <v-icon color="orange" class="mr-2">
                  mdi-office-building
                </v-icon>
                {{ $t('producers.title') || 'Productoras' }}
              </h1>
              <p class="text-subtitle-1 mt-2">
                {{ $t('producers.subtitle') || 'Descubre las productoras detrás de tus series favoritas' }}
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
                    {{ $t('producers.order_by.title') || 'Ordenar Por' }}
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
                    {{ $t('producers.search') || 'Buscar' }}
                  </v-card-title>
                  <v-divider />
                  <v-card-text>
                    <v-text-field
                      v-model="searchQuery"
                      :placeholder="$t('producers.search_placeholder') || 'Buscar productoras...'"
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

            <!-- Main Content -->
            <v-col
              cols="12"
              lg="9"
            >
              <!-- Mobile filters -->
              <v-row class="d-lg-none mb-4">
                <v-col cols="6">
                  <v-btn
                    block
                    color="primary"
                    outlined
                    @click="showOrderSheet = true"
                  >
                    <v-icon left>
                      mdi-sort
                    </v-icon>
                    Ordenar
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn
                    block
                    color="primary"
                    outlined
                    @click="showSearchSheet = true"
                  >
                    <v-icon left>
                      mdi-magnify
                    </v-icon>
                    Buscar
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Filters Applied -->
              <v-row v-if="searchQuery" class="mb-2">
                <v-col cols="12">
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

              <!-- Producers grid -->
              <v-row>
                <v-col
                  v-for="producer in producers"
                  :key="producer.id"
                  cols="6"
                  sm="4"
                  md="4"
                  lg="3"
                  class="pa-2"
                >
                  <ProducerCard
                    :producer="producer"
                    @click="goToProducerDetails(producer)"
                    @view-details="goToProducerDetails(producer)"
                    @view-studios="goToProducerStudios(producer)"
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
              <v-row v-if="!loading && producers.length === 0" class="justify-center py-8">
                <v-col cols="12" class="text-center">
                  <v-icon size="64" color="grey lighten-1" class="mb-4">
                    mdi-office-building-outline
                  </v-icon>
                  <h3 class="text-h6 grey--text text--lighten-1 mb-2">
                    {{ searchQuery ? 'No se encontraron productoras' : 'No hay productoras disponibles' }}
                  </h3>
                  <p class="text-body-2 grey--text">
                    {{ searchQuery ? 'Intenta con otros términos de búsqueda' : 'Pronto agregaremos más contenido' }}
                  </p>
                  <v-btn
                    v-if="searchQuery"
                    color="primary"
                    text
                    @click="clearSearch"
                  >
                    Limpiar búsqueda
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Pagination -->
              <v-row v-if="pagination.pageCount > 1" class="justify-center mt-6 mb-8">
                <v-pagination
                  v-model="pagination.page"
                  :length="pagination.pageCount"
                  :total-visible="7"
                  color="primary"
                  class="elevation-1"
                />
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-row>

      <!-- Mobile bottom sheets for filters -->
      <v-bottom-sheet v-model="showOrderSheet" inset>
        <v-sheet class="rounded-t-lg pa-4" height="auto">
          <div class="d-flex align-center mb-4">
            <h3 class="text-subtitle-1 font-weight-medium">
              {{ $t('producers.order_by.title') || 'Ordenar Por' }}
            </h3>
            <v-spacer />
            <v-btn icon small @click="showOrderSheet = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-list dense>
            <v-list-item
              v-for="(order, index) in orderUI"
              :key="order.id"
              :class="lastOrder === index ? 'selected-item' : ''"
              @click="selectOrder(index); showOrderSheet = false"
            >
              <v-list-item-icon class="mr-2">
                <v-icon small>
                  mdi-sort
                </v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title v-text="order.name" />
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-bottom-sheet>

      <v-bottom-sheet v-model="showSearchSheet" inset>
        <v-sheet class="rounded-t-lg pa-4" height="auto">
          <div class="d-flex align-center mb-4">
            <h3 class="text-subtitle-1 font-weight-medium">
              {{ $t('producers.search') || 'Buscar' }}
            </h3>
            <v-spacer />
            <v-btn icon small @click="showSearchSheet = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
          <v-text-field
            v-model="searchQuery"
            :placeholder="$t('producers.search_placeholder') || 'Buscar productoras...'"
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
  name: 'Producers',
  components: {
    ProducersSkeleton: () => import('@/components/misc/ProducersSkeleton'),
    ProducerCard: () => import('@/components/Cards/ProducerCard')
  },
  data () {
    return {
      loading: true,
      loadingMore: false,
      searchQuery: '',
      searchTimeout: null,
      lastOrder: null,
      showOrderSheet: false,
      showSearchSheet: false,
      producers: [],
      pagination: {
        page: 1,
        pageSize: 24,
        pageCount: 1
      },
      orderUI: [
        { id: 1, name: 'Nombre A-Z', url: 'name:asc' },
        { id: 2, name: 'Nombre Z-A', url: 'name:desc' },
        { id: 3, name: 'Más Studios', url: 'studios_count:desc' },
        { id: 4, name: 'Más Series', url: 'series_count:desc' },
        { id: 5, name: 'Más Recientes', url: 'createdAt:desc' }
      ]
    }
  },
  computed: {
    breadcrumbs () {
      return [
        {
          text: 'Home',
          to: this.localePath('/'),
          icon: 'mdi-home',
          color: 'grey',
          disabled: false
        },
        {
          text: this.$t('producers.title') || 'Productoras',
          to: this.localePath('/producers'),
          icon: 'mdi-office-building',
          color: 'orange',
          disabled: true
        }
      ]
    },
    debouncedSearch () {
      return this.debounce(this.performSearch, 500)
    }
  },
  watch: {
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
    await this.loadData()
    this.loading = false
  },
  methods: {
    async loadData () {
      try {
        const qs = require('qs')

        let filters = {}
        if (this.searchQuery) {
          filters = {
            name: {
              $contains: this.searchQuery
            }
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
          populate: ['studios', 'series']
        }, {
          encodeValuesOnly: true
        })

        await fetch(`${this.$config.API_STRAPI_ENDPOINT}producers?${query}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then((data) => {
            const producers = data.data.map(producer => ({
              ...producer,
              studiosCount: producer.studios?.length || 0,
              seriesCount: producer.series?.length || 0
            }))

            this.producers = producers
            this.pagination = data.meta.pagination
            this.loadingMore = false
          })
          .catch((error) => {
            console.error('Error loading producers:', error)
            this.loadingMore = false
          })
      } catch (error) {
        console.error('Error loading producers:', error)
        this.loadingMore = false
      }
    },
    selectOrder (index) {
      if (this.lastOrder === index) {
        this.lastOrder = null
        return
      }
      this.lastOrder = index
      this.pagination.page = 1
      this.loadData()
    },
    performSearch () {
      this.pagination.page = 1
      this.loadData()
    },
    clearSearch () {
      this.searchQuery = ''
      this.performSearch()
    },
    goToProducerDetails (producer) {
      // Navegar a la página de detalles de la productora
      this.$router.push({ path: `/producers/${producer.id}` })
    },
    goToProducerStudios (producer) {
      // Navegar a la página de studios con filtro por productora
      this.$router.push({ path: '/studios', query: { producer: producer.name } })
    },
    debounce (func, wait) {
      return (...args) => {
        clearTimeout(this.searchTimeout)
        this.searchTimeout = setTimeout(() => func.apply(this, args), wait)
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

.v-pagination >>> .v-pagination__item {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0 2px;
}

.v-pagination >>> .v-pagination__item--active {
  background-color: var(--v-primary-base) !important;
  color: white !important;
}
</style>

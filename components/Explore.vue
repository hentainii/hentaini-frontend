<template>
  <v-container fluid>
    <v-row>
      <v-container class="pb-0">
        <v-row>
          <v-col v-if="$route.query.genre" cols="12" class="mt-4 px-2">
            <h1>{{ $t('explore.on_genre_title_part_1') }} <strong class="blue--text darken-4"> {{ prettyGenre }} </strong> {{ $t('explore.on_genre_title_part_2') }}</h1>
          </v-col>
          <v-col v-else cols="12" class="mt-4 px-2">
            <h1>{{ $t('explore.title') }}</h1>
          </v-col>
          <v-col v-if="$route.query.genre" cols="12" class="px-2 pb-0">
            <p>{{ $t('explore.on_genre_suntitle_part_1') }} {{ prettyGenre }} {{ $t('explore.on_genre_suntitle_part_2') }}</p>
          </v-col>
          <v-col v-else cols="12" class="px-2 pb-0">
            <p>{{ $t('explore.subtitle') }}</p>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
    <v-row>
      <v-container class="px-0">
        <v-row>
          <v-col
            cols="12"
            xs="12"
            sm="12"
            md="12"
            lg="3"
          >
            <v-expansion-panels
              v-model="expandedFilterBy"
              multiple
              tile
              flat
            >
              <v-expansion-panel>
                <v-expansion-panel-header>{{ $t('explore.filter.title') }}</v-expansion-panel-header>
                <v-expansion-panel-content class="px-0">
                  <v-list
                    rounded
                    :subheader="false"
                    class="transparent"
                  >
                    <v-list-item-group
                      color="primary"
                    >
                      <v-list-item
                        v-for="(filter, index) in filtersUI"
                        :key="filter.id"
                        @click="selectFilter(index)"
                      >
                        <v-list-item-icon>
                          <v-icon>mdi-filter</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title v-text="filter.name" />
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-expansion-panels
              v-model="expandedOrderBy"
              multiple
              tile
              flat
            >
              <v-expansion-panel>
                <v-expansion-panel-header>{{ $t('explore.order_by.title') }}</v-expansion-panel-header>
                <v-expansion-panel-content class="px-0">
                  <v-list
                    rounded
                    :subheader="false"
                    class="transparent px-0"
                  >
                    <v-list-item-group
                      color="primary"
                    >
                      <v-list-item
                        v-for="(order, index) in orderUI"
                        :key="order.id"
                        @click="selectOrder(index)"
                      >
                        <v-list-item-icon>
                          <v-icon>mdi-filter</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title v-text="order.name" />
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-expansion-panels
              v-model="expanded"
              multiple
              tile
              flat
            >
              <v-expansion-panel>
                <v-expansion-panel-header>{{ $t('explore.genres') }}</v-expansion-panel-header>
                <v-expansion-panel-content class="px-0">
                  <v-list
                    rounded
                    class="px-0 transparent"
                  >
                    <v-list-item
                      v-for="genre in genres"
                      :key="genre.name"
                      :to="localePath(`/explore?genre=${genre.url}`)"
                    >
                      <v-list-item-icon>
                        <v-icon>mdi-folder-search-outline</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title v-text="genre.name" />
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-col>
          <v-col
            cols="12"
            xs="12"
            sm="12"
            md="12"
            lg="9"
            class="pa-0"
          >
            <v-container class="pa-0">
              <v-row class="justify-center">
                <v-pagination
                  v-model="pagination.page"
                  :length="pagination.pageCount"
                  :total-visible="6"
                  circle
                />
              </v-row>
              <v-row>
                <v-col
                  v-for="serie in series"
                  :key="serie.id"
                  cols="6"
                  lg="3"
                  md="3"
                  sm="4"
                >
                  <SerieCard
                    :title="serie.title"
                    :synopsis="serie.synopsis"
                    :genres="serie.genres"
                    :componentgenres="serie.genreList"
                    :status="serie.status.name"
                    :url="serie.url"
                    :screenshot="`${$config.COVER_ENDPOINT}${serie.images.path}`"
                    :visits="serie.visits"
                  />
                </v-col>
              </v-row>
              <v-row class="justify-center mb-5">
                <v-pagination
                  v-model="pagination.page"
                  :length="pagination.pageCount"
                  :total-visible="6"
                  circle
                />
              </v-row>
            </v-container>
          </v-col>
        </v-row>
      </v-container>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'Explore',
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
    await this.getSeries()
    await this.getGenres()
    await this.prettyGenreName()
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
            serie.images = serie.images.filter(image => image.image_type.name === 'cover')[0]
            this.pagination = series.meta.pagination
            return {
              ...serie
            }
          })
          this.series = resSerie
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
        this.prettyGenre = g.name
      }
    }
  }
}
</script>

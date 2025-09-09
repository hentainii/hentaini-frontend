<template>
  <div>
    <Header />
    <div v-if="producer">
      <!-- Hero section with gradient background -->
      <v-container fluid class="pa-0">
        <div class="producer-hero-section">
          <v-container style="position: relative; z-index: 10;">
            <v-row class="align-center" style="min-height: 300px;">
              <v-col cols="12">
                <div class="text-center white--text">
                  <v-breadcrumbs :items="breadcrumb" divider="•" class="justify-center pb-4 white--text" />

                  <!-- Producer icon -->
                  <div class="mb-4">
                    <v-avatar size="120" color="white" class="elevation-8">
                      <v-icon size="60" color="primary">
                        mdi-office-building
                      </v-icon>
                    </v-avatar>
                  </div>

                  <h1 class="text-h3 font-weight-bold mb-4">
                    {{ producer.name }}
                  </h1>
                  <p v-if="producer.description" class="text-h6 mb-4" style="opacity: 0.9; max-width: 800px; margin: 0 auto;">
                    {{ producer.description }}
                  </p>
                  <div class="d-flex flex-wrap justify-center gap-3">
                    <v-chip color="primary" large>
                      <v-icon left>
                        mdi-camera-outline
                      </v-icon>
                      {{ producer.studiosCount || 0 }} Studios
                    </v-chip>
                    <v-chip color="secondary" large>
                      <v-icon left>
                        mdi-play-circle-outline
                      </v-icon>
                      {{ producer.seriesCount || 0 }} Series
                    </v-chip>
                    <v-chip v-if="producer.founded" color="info" large>
                      <v-icon left>
                        mdi-calendar
                      </v-icon>
                      {{ $t('producers.details.founded_in') }} {{ producer.founded }}
                    </v-chip>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </v-container>

      <!-- Studios section -->
      <v-container class="pt-8">
        <v-row>
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between mb-6">
              <div>
                <h2 class="text-h4 font-weight-bold">
                  <v-icon color="blue" class="mr-2">
                    mdi-camera-outline
                  </v-icon>
                  {{ $t('producers.details.studios_section_title') }}
                </h2>
                <p class="text-subtitle-1 mt-2">
                  {{ $t('producers.details.studios_section_subtitle') }} {{ producer.name }}
                </p>
              </div>
              <div class="d-flex align-center">
                <v-btn
                  :to="localePath('/studios')"
                  color="primary"
                  text
                  class="mr-2"
                >
                  {{ $t('producers.details.view_all_studios') }}
                  <v-icon right>
                    mdi-arrow-right
                  </v-icon>
                </v-btn>
              </div>
            </div>

            <v-row v-if="studios.length > 0">
              <v-col
                v-for="studio in studios"
                :key="studio.id"
                cols="6"
                sm="4"
                md="4"
                lg="3"
                class="pa-2"
              >
                <CardsStudioCard
                  :studio="studio"
                  @click="goToStudio(studio)"
                  @view-series="goToStudio(studio)"
                  @view-producer="() => {}"
                />
              </v-col>
            </v-row>

            <v-row v-else class="justify-center py-8">
              <v-col cols="12" class="text-center">
                <v-icon size="64" color="grey lighten-1" class="mb-4">
                  mdi-camera-outline
                </v-icon>
                <h3 class="text-h6 grey--text text--lighten-1 mb-2">
                  {{ $t('producers.details.no_studios_title') }}
                </h3>
                <p class="text-body-2 grey--text">
                  {{ $t('producers.details.no_studios_subtitle') }}
                </p>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Recent Series section -->
        <v-row class="mt-8">
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between mb-6">
              <div>
                <h2 class="text-h4 font-weight-bold">
                  <v-icon color="green" class="mr-2">
                    mdi-play-circle-outline
                  </v-icon>
                  {{ $t('producers.details.recent_series_title') }}
                </h2>
                <p class="text-subtitle-1 mt-2">
                  {{ $t('producers.details.recent_series_subtitle') }} {{ producer.name }}
                </p>
              </div>
            </div>

            <v-row v-if="recentSeries.length > 0">
              <v-col
                v-for="serie in recentSeries"
                :key="serie.id"
                cols="6"
                sm="4"
                md="3"
                lg="2"
                class="pa-2"
              >
                <SerieCard
                  :serie="serie"
                />
              </v-col>
            </v-row>

            <v-row v-else class="justify-center py-8">
              <v-col cols="12" class="text-center">
                <v-icon size="64" color="grey lighten-1" class="mb-4">
                  mdi-play-circle-outline
                </v-icon>
                <h3 class="text-h6 grey--text text--lighten-1 mb-2">
                  {{ $t('producers.details.no_series_title') }}
                </h3>
                <p class="text-body-2 grey--text">
                  {{ $t('producers.details.no_series_subtitle') }}
                </p>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </div>

    <div v-else class="text-center pa-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      />
      <p class="mt-4">
        {{ $t('producers.details.loading') }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      producer: null,
      studios: [],
      recentSeries: [],
      head: this.$t ? this.$t('producers.details.loading') : 'Loading producer...',
      breadcrumb: [
        {
          text: 'Home',
          disabled: false,
          href: '/'
        },
        {
          text: this.$t('producers.title'),
          disabled: false,
          href: '/producers'
        },
        {
          text: this.$t('producers.details.breadcrumb_loading'),
          disabled: true
        }
      ]
    }
  },
  head () {
    return this.head
  },
  async mounted () {
    await this.getProducerData()
  },
  methods: {
    async getProducerData () {
      const producerId = this.$route.params.id
      const qs = require('qs')

      try {
        // Get producer details
        const producerQuery = qs.stringify({
          populate: ['studios', 'series', 'studios.series']
        }, {
          encodeValuesOnly: true
        })

        await fetch(`${this.$config.API_STRAPI_ENDPOINT}producers/${producerId}?${producerQuery}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then((data) => {
            this.producer = {
              ...data.data,
              studiosCount: data.data.studios?.length || 0,
              seriesCount: data.data.series?.length || 0
            }
          })
          .catch((error) => {
            console.error('Error loading producer:', error)
          })

        // Get studios by producer
        const studiosQuery = qs.stringify({
          filters: {
            producers: {
              id: producerId
            }
          },
          pagination: {
            page: 1,
            pageSize: 12
          },
          populate: ['producers', 'series']
        }, {
          encodeValuesOnly: true
        })

        await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios?${studiosQuery}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then((data) => {
            this.studios = data.data.map(studio => ({
              ...studio,
              seriesCount: studio.series?.length || 0,
              producerName: studio.producers?.[0]?.name || 'Unknown'
            }))
          })
          .catch((error) => {
            console.error('Error loading studios:', error)
          })

        // Get recent series by producer
        const seriesQuery = qs.stringify({
          filters: {
            producer: {
              id: producerId
            }
          },
          sort: ['createdAt:desc'],
          pagination: {
            page: 1,
            pageSize: 6
          },
          populate: [
            'images',
            'images.image_type',
            'status',
            'genreList'
          ]
        }, {
          encodeValuesOnly: true
        })

        await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${seriesQuery}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then((data) => {
            this.recentSeries = data.data.map((serie) => {
              serie.genres = JSON.parse(serie.genres || '[]')
              serie.images = serie.images.filter(image => image.image_type.name === 'cover')[0]
              return serie
            })
          })
          .catch((error) => {
            console.error('Error loading series:', error)
          })

        // Update breadcrumb and head
        if (this.producer) {
          this.breadcrumb[2].text = this.producer.name
          this.head = {
            title: `${this.producer.name} - ${this.$t('producers.details.meta_title_suffix')}`,
            meta: [
              { hid: 'description', name: 'description', content: `${this.$t('producers.details.meta_description_prefix')} ${this.producer.name}. ${this.producer.description || ''}` },
              { hid: 'og:title', property: 'og:title', content: `${this.producer.name} - ${this.$t('producers.details.meta_title_suffix')}` },
              { hid: 'og:description', property: 'og:description', content: `${this.$t('producers.details.meta_description_prefix')} ${this.producer.name}` },
              { hid: 'og:url', property: 'og:url', content: `https://hentaini.com${this.$route.path}` },
              { hid: 'author', name: 'author', content: 'hentaini' }
            ]
          }
        }
      } catch (error) {
        console.error('Error loading producer data:', error)
      }
    },
    goToStudio (studio) {
      this.$router.push({ path: `/studios/${studio.id}` })
    }
  }
}
</script>

<style scoped>
.producer-hero-section {
  position: relative;
  min-height: 300px;
  background: linear-gradient(135deg, #1976D2 0%, #42A5F5 50%, #64B5F6 100%);
}

.gap-3 > * {
  margin-right: 12px;
  margin-bottom: 8px;
}

@media (max-width: 599px) {
  .producer-hero-section {
    min-height: 250px;
  }

  .text-h3 {
    font-size: 1.8rem !important;
  }
}
</style>

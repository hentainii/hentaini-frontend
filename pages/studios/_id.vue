<template>
  <div>
    <Header />
    <div v-if="studio">
      <!-- Hero section with gradient background -->
      <v-container fluid class="pa-0">
        <div class="studio-hero-section">
          <v-container style="position: relative; z-index: 10;">
            <v-row class="align-center" style="min-height: 300px;">
              <v-col cols="12">
                <div class="text-center white--text">
                  <v-breadcrumbs :items="breadcrumb" divider="•" class="justify-center pb-4 white--text" />

                  <!-- Studio icon -->
                  <div class="mb-4">
                    <v-avatar size="120" color="white" class="elevation-8">
                      <v-icon size="60" color="primary">
                        mdi-camera-outline
                      </v-icon>
                    </v-avatar>
                  </div>

                  <h1 class="text-h3 font-weight-bold mb-4">
                    {{ studio.name }}
                  </h1>
                  <p v-if="studio.description" class="text-h6 mb-4" style="opacity: 0.9; max-width: 800px; margin: 0 auto;">
                    {{ studio.description }}
                  </p>
                  <div class="d-flex flex-wrap justify-center gap-3">
                    <v-chip color="orange" large>
                      <v-icon left>
                        mdi-office-building
                      </v-icon>
                      {{ studio.producerName || 'Unknown Producer' }}
                    </v-chip>
                    <v-chip color="secondary" large>
                      <v-icon left>
                        mdi-play-circle-outline
                      </v-icon>
                      {{ studio.seriesCount || 0 }} {{ $t('studios.series_count.other') }}
                    </v-chip>
                    <v-chip v-if="studio.founded" color="info" large>
                      <v-icon left>
                        mdi-calendar
                      </v-icon>
                      {{ $t('studios.details.founded_in') }} {{ studio.founded }}
                    </v-chip>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-container>
        </div>
      </v-container>

      <!-- Series section -->
      <v-container class="pt-8">
        <v-row>
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between mb-6">
              <div>
                <h2 class="text-h4 font-weight-bold">
                  <v-icon color="green" class="mr-2">
                    mdi-play-circle-outline
                  </v-icon>
                  {{ $t('studios.details.series_section_title') }}
                </h2>
                <p class="text-subtitle-1 mt-2">
                  {{ $t('studios.details.series_section_subtitle') }} {{ studio.name }}
                </p>
              </div>
              <div class="d-flex align-center">
                <v-btn
                  v-if="studio.producerName"
                  :to="localePath(`/producers/${studio.producerId}`)"
                  color="orange"
                  outlined
                  class="mr-2"
                >
                  <v-icon left>
                    mdi-office-building
                  </v-icon>
                  {{ $t('studios.details.view_producer') }}
                </v-btn>
              </div>
            </div>

            <v-row v-if="series.length > 0">
              <v-col
                v-for="serie in series"
                :key="serie.id"
                cols="6"
                sm="4"
                md="3"
                lg="2"
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

            <v-row v-else class="justify-center py-8">
              <v-col cols="12" class="text-center">
                <v-icon size="64" color="grey lighten-1" class="mb-4">
                  mdi-play-circle-outline
                </v-icon>
                <h3 class="text-h6 grey--text text--lighten-1 mb-2">
                  {{ $t('studios.details.no_series_title') }}
                </h3>
                <p class="text-body-2 grey--text">
                  {{ $t('studios.details.no_series_subtitle') }}
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
        {{ $t('studios.details.loading') }}
      </p>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      studio: null,
      series: [],
      head: this.$t ? this.$t('studios.details.loading') : 'Loading studio...',
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
          text: this.$t('studios.details.breadcrumb_loading'),
          disabled: true
        },
        {
          text: this.$t('studios.details.breadcrumb_loading'),
          disabled: true
        }
      ]
    }
  },
  head () {
    return this.head
  },
  async mounted () {
    await this.getStudioData()
  },
  methods: {
    async getStudioData () {
      const studioId = this.$route.params.id
      const qs = require('qs')

      try {
        // Get studio details
        const studioQuery = qs.stringify({
          populate: ['producers', 'series']
        }, {
          encodeValuesOnly: true
        })

        await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios/${studioId}?${studioQuery}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(res => res.json())
          .then((data) => {
            this.studio = {
              ...data.data,
              seriesCount: data.data.series?.length || 0,
              producerName: data.data.producers?.[0]?.name || 'Unknown',
              producerId: data.data.producers?.[0]?.id || null
            }
          })
          .catch((error) => {
            console.error('Error loading studio:', error)
          })

        // Get series by studio
        const seriesQuery = qs.stringify({
          filters: {
            studio: {
              id: studioId
            }
          },
          sort: ['visits:desc'],
          pagination: {
            page: 1,
            pageSize: 24
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
            this.series = data.data.map((serie) => {
              serie.genres = JSON.parse(serie.genres || '[]')
              return serie
            })
          })
          .catch((error) => {
            console.error('Error loading series:', error)
          })

        // Update breadcrumb and head
        if (this.studio) {
          this.breadcrumb[2].text = this.studio.producerName
          this.breadcrumb[2].href = `/producers/${this.studio.producerId}`
          this.breadcrumb[2].disabled = false
          this.breadcrumb[3].text = this.studio.name
          this.breadcrumb[3].disabled = true

          this.head = {
            title: `${this.studio.name} - ${this.$t('studios.details.meta_title_suffix')}`,
            meta: [
              { hid: 'description', name: 'description', content: `${this.$t('studios.details.meta_description_prefix')} ${this.studio.name}. ${this.studio.description || ''}` },
              { hid: 'og:title', property: 'og:title', content: `${this.studio.name} - ${this.$t('studios.details.meta_title_suffix')}` },
              { hid: 'og:description', property: 'og:description', content: `${this.$t('studios.details.meta_description_prefix')} ${this.studio.name}` },
              { hid: 'og:url', property: 'og:url', content: `https://hentaini.com${this.$route.path}` },
              { hid: 'author', name: 'author', content: 'hentaini' }
            ]
          }
        }
      } catch (error) {
        console.error('Error loading studio data:', error)
      }
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
.studio-hero-section {
  position: relative;
  min-height: 300px;
  background: linear-gradient(135deg, #2196F3 0%, #42A5F5 50%, #64B5F6 100%);
}

.gap-3 > * {
  margin-right: 12px;
  margin-bottom: 8px;
}

@media (max-width: 599px) {
  .studio-hero-section {
    min-height: 250px;
  }

  .text-h3 {
    font-size: 1.8rem !important;
  }
}
</style>

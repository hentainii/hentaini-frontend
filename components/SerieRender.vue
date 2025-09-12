<template>
  <div v-if="serie">
    <v-container fluid class="m0 pa-0">
      <v-img
        :src="`${$config.SCREENSHOT_ENDPOINT}${serie.images.find(image => image.image_type.name === 'screenshot').path}`"
        alt=""
        aspect-ratio="16/9"
        style="position: absolute; top: 0; left: 0; width: 100%; height:100vh;filter:opacity(0.3);"
        class="background"
      />
    </v-container>
    <v-container style="position:relative;">
      <v-row style="    position: relative;z-index: 10;">
        <v-col>
          <v-breadcrumbs :items="breadcrumb" divider="•" class="pl-0 pb-0" />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          sm="4"
          md="4"
          lg="2"
        >
          <v-row>
            <v-col cols="12">
              <v-img
                :src="`${$config.COVER_ENDPOINT}${serie.images.find(image => image.image_type.name === 'cover').path}`"
                style="max-height:415px;border-radius:10px;"
              />
            </v-col>
          </v-row>
          <v-row v-if="$store.state.auth">
            <v-col cols="12">
              <v-btn
                block
                color="red accent-1"
                class="elevation-0 rounded-xl"
                small
                :outlined="!serieIsPresentInFavorites"
                @click="serieIsPresentInFavorites ? removeFavorite(serie.id) : setFavorite(serie.id)"
              >
                <v-icon class="mr-2">
                  mdi-heart
                </v-icon>
                {{ serieIsPresentInFavorites ? $t('favorites.remove') : $t('favorites.add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col cols="12">
              <v-btn
                block
                color="'red accent-1'"
                class="elevation-0 rounded-xl"
                :to="localePath('/login')"
              >
                <v-icon class="mr-2">
                  mdi-heart
                </v-icon>
                {{ $t('serie.loginToSave') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
        <v-col
          cols="12"
          sm="8"
          md="8"
          lg="10"
        >
          <v-row>
            <v-col cols="12" class="pb-0">
              <h1 class="mb-2">
                {{ serie.title }}
              </h1>
              <!-- Rating Section -->
              <div class="rating-section-compact d-flex align-center mb-3">
                <!-- Rating Number -->
                <div class="rating-number mr-4">
                  <span class="text-h4 font-weight-bold primary--text">
                    {{ formattedRating }}
                  </span>
                  <span class="text-body-2 grey--text">/5</span>
                </div>

                <!-- Rating Info and Actions -->
                <div class="rating-info-stack d-flex flex-column mr-4">
                  <span class="text-subtitle-2 font-weight-medium grey--text text--lighten-1">
                    Ratings
                  </span>
                  <span class="text-body-2 grey--text">
                    {{ $tc('rating.votes', serieRating.totalVotes, { n: serieRating.totalVotes }) }}
                  </span>
                </div>

                <!-- Rating Button -->
                <v-btn
                  small
                  color="primary"
                  outlined
                  class="rating-btn-compact"
                  @click="openRatingModal"
                >
                  <v-icon small class="mr-1">
                    mdi-star
                  </v-icon>
                  {{ userRating > 0 ? $t('rating.update') : $t('rating.rate') }}
                </v-btn>
              </div>
            </v-col>
          </v-row>
          <v-row v-if="serie.title_english" class="px-4 pb-4">
            <span style="color:#b9b9b9;">English: {{ serie.title_english }}</span>
          </v-row>
          <v-row class="px-4 pb-4" style="gap:10px;">
            <v-chip
              small
              :color="serie.status.name === 'Airing' ? 'success' : 'red accent-2'"
            >
              <strong>{{ serie.status.name }}</strong>
            </v-chip>
            <v-chip
              small
              :color="serie.censorship ? 'red accent-2' : 'success'"
            >
              <strong>{{ serie.censorship ? 'Censored' : 'No Censorship' }}</strong>
            </v-chip>
          </v-row>
          <v-row class="px-4">
            <v-alert
              border="left"
              colored-border
              text
              color="primary"
            >
              <strong>{{ $t('serie.synopsis') }}</strong> {{ serie.synopsis }}
            </v-alert>
          </v-row>
          <v-row v-if="serie.genreList.length > 0" class="px-4">
            <span class="mt-2">{{ $t('serie.genres') }}</span>
            <v-chip
              v-for="(genre, index) in serie.genreList"
              :key="index"
              :to="localePath(`/g/${genre.url}`)"
              color="primary ml-2 mt-2"
              text-color="white"
              outlined
              small
            >
              <v-icon left>
                mdi-play
              </v-icon>
              {{ genre.name }}
            </v-chip>
          </v-row>
          <v-row v-else class="px-4">
            <span class="mt-2">{{ $t('serie.genres') }}</span>
            <v-chip
              v-for="(genre, index) in JSON.parse(serie.genres)"
              :key="index"
              :to="localePath(`/g/${genre.url}`)"
              color="primary ml-2 mt-2"
              text-color="white"
              outlined
              small
            >
              {{ genre.text ? genre.text : genre.name }}
            </v-chip>
          </v-row>
          <v-row v-if="serie.studio && (serie.studio.name || (serie.studio && serie.studio.name))" class="px-4 pb-2 mt-4">
            <span style="color:#b9b9b9;">
              <v-icon small color="blue" class="mr-1">mdi-camera-outline</v-icon>
              {{ $t('serie.studio') }}
              <nuxt-link
                :to="localePath(`/studios/${serie.studio.id || (serie.studio.data && serie.studio.data.id) || '1'}`)"
                class="primary--text text-decoration-none"
              >
                {{ serie.studio.name || (serie.studio && serie.studio.name) }}
              </nuxt-link>
            </span>
          </v-row>
          <v-row v-if="serie.producer && (serie.producer.name || (serie.producer && serie.producer.name))" class="px-4 pb-2">
            <span style="color:#b9b9b9;">
              <v-icon small color="orange" class="mr-1">mdi-office-building</v-icon>
              {{ $t('serie.producer') }}
              <nuxt-link
                :to="localePath(`/producers/${serie.producer.id || '1'}`)"
                class="primary--text text-decoration-none"
              >
                {{ serie.producer.name || (serie.producer && serie.producer.name) }}
              </nuxt-link>
            </span>
          </v-row>
          <v-row v-if="serie.episodes.length > 0" class="mt-10 mb-5">
            <SerieEpisodeList :serie="serie" :episodes="serie.episodes" />
          </v-row>
          <v-row v-else class="mt-10 mb-5 px-4">
            <h4>{{ $t('serie.noEpísodes') }}</h4>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
    <v-container>
      <v-row>
        <LayoutComments
          content-type="serie"
          :content-id="serie.id"
        />
      </v-row>
    </v-container>
    <!-- Serie Rating Modal -->
    <SerieRatingModal
      :visible="showRatingModal"
      :serie="serie"
      :user-rating="userRating"
      @close="showRatingModal = false"
      @rated="onRated"
    />
  </div>
</template>
<script>
import { mapActions, mapGetters } from 'vuex'
import SerieRatingModal from './SerieRatingModal.vue'

export default {
  components: {
    SerieRatingModal
  },
  props: {
    serie: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      favorites: [],
      showRatingModal: false,
      serieRating: {
        averageRating: 0,
        totalVotes: 0
      },
      breadcrumb: [
        {
          text: 'Home',
          disabled: false,
          href: '/'
        },
        {
          text: 'Series',
          disabled: true
        }
      ]
    }
  },
  computed: {
    ...mapGetters('ratings', ['isLoading']),
    serieIsPresentInFavorites () {
      return this.favorites.some(favorite => favorite.url === this.serie.url)
    },
    userRating () {
      if (!this.serie) { return 0 }
      return this.$store.state.ratings.userRatings[this.serie.id] || 0
    },
    formattedRating () {
      if (this.serieRating.averageRating === 0) {
        return '0.0'
      }
      return this.serieRating.averageRating.toFixed(1)
    }
  },
  watch: {
    // Recargar rating cuando cambie el estado de autenticación
    '$store.state.auth' (newAuth, oldAuth) {
      if (this.serie && newAuth !== oldAuth) {
        this.loadSerieRating()
      }
    }
  },
  mounted () {
    const serie = this.$route.params.serie
    // is its a string of six numbers
    if (/^\d{6}$/.test(serie)) {
      this.$router.push('/')
    }

    this.getSerieExtraInfo()
    /**
     * Google Analytics
     */
    if (process.browser) {
      this.$gtag('config', 'G-CC7E5GXL8F', {
        page_title: this.$metaInfo?.title,
        page_path: this.$route.fullPath
      })
    }
  },
  methods: {
    ...mapActions('ratings', ['fetchSerieRating']),
    getSerieExtraInfo () {
      this.getFavorites()
      this.loadSerieRating()
      this.breadcrumb[1].text = this.serie.title
    },
    async loadSerieRating () {
      try {
        const userId = this.$store.state.auth?.id
        const ratingData = await this.fetchSerieRating({
          serieId: this.serie.id,
          userId
        })
        this.serieRating = {
          averageRating: ratingData.averageRating,
          totalVotes: ratingData.totalVotes
        }
        this.userRating = ratingData.userRating || 0
      } catch (error) {
        console.error('Error loading serie rating:', error)
      }
    },
    openRatingModal () {
      this.showRatingModal = true
    },
    async onRated (ratingData) {
      // Recargar el rating después de que el usuario vote
      await this.loadSerieRating()
      this.showRatingModal = false
    },
    async getFavorites () {
      this.favorites = await this.$store.dispatch('favorite/getFavorites', {
        user: this.$store.state.auth,
        serie: this.serie,
        token: this.$store.state.auth.token
      })
    },
    async setFavorite () {
      const res = await this.$store.dispatch('favorite/setNewFavorite', {
        user: this.$store.state.auth,
        serie: this.serie,
        token: this.$store.state.auth.token
      })
      this.favorites.push({
        id: res.data.id,
        url: this.serie.url
      })
    },
    removeFavorite () {
      this.$store.dispatch('favorite/removeFavorite', {
        user: this.$store.state.auth,
        favorite: this.favorites.filter(favorite => favorite.url === this.serie.url)[0],
        token: this.$store.state.auth.token
      })
      this.favorites = this.favorites.filter(favorite => favorite.url !== this.serie.url)
    }
  }
}
</script>
<style>
  .background::after {
    background: linear-gradient(to bottom,rgb(8 15 40 / 38%) 0%,rgb(18 18 18) 100%);
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 100%;
    pointer-events: none;
  }

  /* Compact Rating Section Styles */
  .rating-section-compact {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    max-width: fit-content;
  }

  .rating-section-compact:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  }

  .rating-number {
    display: flex;
    align-items: baseline;
    gap: 2px;
  }

  .rating-info-stack {
    min-width: 60px;
    line-height: 1.2;
  }

  .rating-btn-compact {
    border-radius: 20px !important;
    text-transform: none !important;
    font-weight: 600 !important;
    transition: all 0.3s ease !important;
    min-width: auto !important;
  }

  .rating-btn-compact:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4) !important;
  }

  /* Mobile Responsive */
  @media (max-width: 600px) {
    .rating-section-compact {
      padding: 10px 12px;
      margin: 0 -4px;
      max-width: 100%;
    }

    .rating-number {
      margin-right: 12px !important;
    }

    .rating-info-stack {
      margin-right: 12px !important;
      min-width: 50px;
    }

    .rating-btn-compact {
      font-size: 12px !important;
      padding: 6px 10px !important;
    }
  }

  @media (max-width: 400px) {
    .rating-section-compact {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 8px;
    }

    .rating-number {
      margin-right: 0 !important;
    }

    .rating-info-stack {
      margin-right: 0 !important;
    }

    .rating-btn-compact {
      align-self: stretch;
    }
  }
</style>

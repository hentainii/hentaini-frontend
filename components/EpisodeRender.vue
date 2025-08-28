<!-- eslint-disable import/no-named-as-default-member -->
<template>
  <v-container v-if="episode.id" class="episode-container pa-2 pa-lg-4">
    <!-- Breadcrumbs -->
    <v-row v-if="$store.state.isDesktop">
      <v-col class="py-0">
        <v-breadcrumbs :items="breadcrumb" divider="•" class="pa-0" />
      </v-col>
    </v-row>

    <v-row>
      <!-- Columna principal con el reproductor -->
      <v-col cols="12" md="8" class="pb-0">
        <v-card class="overflow-hidden rounded-lg mb-4 elevation-3">
          <!-- Imagen de portada con botón de reproducción -->
          <div v-if="!showVideo" class="video-container position-relative">
            <v-img
              :src="serieScreenshot"
              width="100%"
              cover
              :aspect-ratio="16/9"
              class="video-preview"
            >
              <div class="player-overlay d-flex justify-center align-center">
                <v-btn
                  fab
                  x-large
                  color="primary"
                  class="play-button elevation-8"
                  @click="showVideo = true"
                >
                  <v-icon size="48">
                    mdi-play
                  </v-icon>
                </v-btn>
              </div>
            </v-img>
          </div>

          <!-- Reproductor de video -->
          <div v-if="showVideo" class="video-player-container">
            <!-- Reproductor HLS nativo para archivos m3u8 -->
            <div v-if="isHLSPlayer" style="position:relative;overflow: hidden;padding-top:56.25%" class="rounded-lg">
              <video
                ref="hlsVideo"
                width="100%"
                height="100%"
                controls
                preload="metadata"
                playsinline
                webkit-playsinline
                crossorigin="anonymous"
                autoplay="false"
                style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"
                class="rounded-lg"
              >
                Tu navegador no soporta el elemento video.
              </video>
            </div>
            <!-- Reproductor iframe para otros players -->
            <VideoElement v-else :src="currentUrl" />
          </div>

          <!-- Controles del reproductor -->
          <v-card-actions class="player-controls py-2 px-0 pa-sm-2">
            <v-container fluid class="py-2 ma-0 px-0">
              <v-row>
                <!-- Selección de reproductor -->
                <v-col cols="12" sm="12" md="8" class="player-selection d-flex align-center py-2">
                  <v-slide-group
                    v-model="selectedPlayerIndex"
                    :show-arrows="$store.state.isDesktop"
                    center-active
                    mandatory
                    class="player-slide-group"
                  >
                    <v-slide-item
                      v-for="player in filteredPlayers"
                      :key="player.name"
                      v-slot:="{ active, toggle }"
                    >
                      <v-btn
                        class="mx-1"
                        :class="{'compact-btn': $vuetify.breakpoint.smAndDown}"
                        :input-value="active"
                        active-class="primary white--text"
                        depressed
                        rounded
                        @click="toggle; changeCurrentUrl(player.url)"
                        @focus="changeCurrentUrl(player.url)"
                      >
                        {{ player.name }}
                      </v-btn>
                    </v-slide-item>
                  </v-slide-group>
                </v-col>

                <!-- Botones de acción -->
                <v-col cols="12" sm="12" md="4" class="d-flex justify-center justify-md-end py-2">
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <v-btn
                        color="grey darken-1"
                        small
                        fab
                        class="mr-2"
                        v-on="on"
                        @click="genDownloadName"
                      >
                        <v-icon>mdi-download</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('episode.download') }}</span>
                  </v-tooltip>

                  <v-tooltip v-if="$store.state.auth" bottom>
                    <template #activator="{ on }">
                      <v-btn
                        :color="serieIsPresentInFavorites ? 'red' : 'grey darken-1'"
                        fab
                        small
                        class="mr-2"
                        v-on="on"
                        @click="serieIsPresentInFavorites ? removeFavorite(episode.serie.id) : setFavorite(episode.serie.id)"
                      >
                        <v-icon>mdi-heart</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ serieIsPresentInFavorites ? $t('favorites.remove') : $t('favorites.add') }}</span>
                  </v-tooltip>
                  <v-tooltip v-else bottom>
                    <template #activator="{ on }">
                      <v-btn
                        color="grey darken-1"
                        fab
                        small
                        class="mr-2"
                        :to="localePath('/login')"
                        v-on="on"
                      >
                        <v-icon>mdi-heart</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('favorites.add') }}</span>
                  </v-tooltip>

                  <v-tooltip v-if="$store.state.auth" bottom>
                    <template #activator="{ on }">
                      <v-btn
                        :color="isInWatchLater ? 'green darken-1' : 'grey darken-1'"
                        fab
                        small
                        class="mr-2"
                        v-on="on"
                        @click="toggleWatchLater(episode.serie)"
                      >
                        <v-icon>{{ isInWatchLater ? 'mdi-eye-off-outline' : 'mdi-eye-plus-outline' }}</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ isInWatchLater ? $t('watch_later.remove') : $t('watch_later.add') }}</span>
                  </v-tooltip>
                  <v-tooltip v-else bottom>
                    <template #activator="{ on }">
                      <v-btn
                        color="grey darken-1"
                        fab
                        small
                        class="mr-2"
                        :to="localePath('/login')"
                        v-on="on"
                      >
                        <v-icon>mdi-eye-plus-outline</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('watch_later.add') }}</span>
                  </v-tooltip>

                  <UtilsReportEpisode
                    :episode="episode"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-actions>
        </v-card>

        <!-- Título y Navegación -->
        <v-row align="center" class="mb-2 px-1">
          <v-col cols="12" md="8" class="py-2">
            <h1 class="text-h6 text-md-h5 font-weight-black text-truncate text-center text-md-left">
              {{ episode.serie.title }} {{ $t('episode.episode_number') }} {{ episode.episode_number }}
            </h1>
          </v-col>
          <v-col cols="12" md="4" class="d-flex justify-center justify-md-end py-2">
            <v-btn-toggle class="episode-navigation elevation-2 rounded-lg">
              <v-btn
                v-if="episode.serie.episodes[0].episode_number !== episode.episode_number"
                :to="localePath(`/h/${episode.serie.url}/${episode.episode_number - 1}`)"
                color="primary"
                text
                class="px-3"
              >
                <v-icon left>
                  mdi-arrow-left
                </v-icon>
              </v-btn>
              <v-btn
                :to="localePath(`/h/${episode.serie.url}`)"
                color="white"
                text
                class="px-3"
              >
                <v-icon>mdi-view-list</v-icon>
                {{ $t('episode.list') }}
              </v-btn>
              <v-btn
                v-if="episode.serie.episodes.slice(-1)[0].episode_number !== episode.episode_number"
                :to="localePath(`/h/${episode.serie.url}/${episode.episode_number + 1}`)"
                color="primary"
                text
                class="px-3"
              >
                <v-icon right>
                  mdi-arrow-right
                </v-icon>
              </v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>

        <!-- Sección de comentarios -->
        <v-card class="mb-4 rounded-lg elevation-3">
          <v-card-text>
            <LayoutComments
              content-type="episode"
              :content-id="episode.id"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Columna lateral con información y episodios -->
      <v-col cols="12" md="4">
        <!-- Información de la serie -->
        <v-card class="rounded-lg mb-4 elevation-3">
          <v-card-title class="white--text">
            <v-icon left color="white">
              mdi-information
            </v-icon>
            {{ $t('episode.serie_info') }}
          </v-card-title>

          <v-card-text class="pt-2">
            <p class="mb-3 text-body-2">
              {{ episode.serie.synopsis }}
            </p>

            <v-divider class="my-3" />

            <!-- Rating Display -->
            <div class="mb-3 d-flex align-center" style="gap:15px;">
              <div class="text-subtitle-2 font-weight-medium">
                {{ $t('rating.display.average') }}:
              </div>
              <RatingDisplay
                :average-rating="serieRating.averageRating"
                :total-votes="serieRating.totalVotes"
                compact
              />

              <!-- Rating Button -->
              <div>
                <v-btn
                  v-if="$store.state.auth"
                  color="amber darken-1"
                  text
                  small
                  @click="openRatingModal"
                >
                  <v-icon left small>
                    mdi-star
                  </v-icon>
                  {{ $t('rating.button') }}
                </v-btn>
                <v-btn
                  v-else
                  color="grey darken-1"
                  text
                  small
                  :to="localePath('/login')"
                >
                  <v-icon left small>
                    mdi-star
                  </v-icon>
                  {{ $t('rating.button') }}
                </v-btn>
              </div>
            </div>

            <v-divider class="my-3" />

            <!-- Géneros -->
            <div class="mb-2 text-subtitle-2 font-weight-medium">
              {{ $t('episode.genres') }}:
            </div>
            <v-chip-group>
              <v-chip
                v-for="genre in JSON.parse(episode.serie.genres)"
                :key="genre.text ? genre.text : genre"
                :to="localePath(`/explore?genre=${genre.url}`)"
                small
                class="mr-1 mb-1"
                color="grey lighten-1"
                outlined
              >
                {{ genre.text ? genre.text : genre.name }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>

        <!-- Lista de episodios -->
        <v-card class="rounded-lg mb-4 elevation-3">
          <v-card-title class="d-flex justify-space-between align-center white--text">
            <div>
              <v-icon left color="white">
                mdi-format-list-numbered
              </v-icon>
              {{ $t('episode.show_episodes') }}
            </div>
            <v-btn
              icon
              @click="show = !show"
            >
              <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            </v-btn>
          </v-card-title>

          <v-expand-transition>
            <div v-show="show">
              <v-list class="episode-list py-0">
                <v-list-item
                  v-for="episode_item in episode.serie.episodes"
                  :key="episode_item.episode_number"
                  :to="localePath(`/h/${episode.serie.url}/${episode_item.episode_number}`)"
                  :class="[
                    episode_item.episode_number == episode.episode_number ? 'current-episode' : '',
                    $vuetify.breakpoint.smAndDown ? 'compact-list-item' : ''
                  ]"
                  class="episode-list-item"
                >
                  <v-list-item-content>
                    <v-list-item-title :class="{'text-body-2': $vuetify.breakpoint.smAndDown}">
                      {{ episode.serie.title }} {{ $t('episode.episode_number') }} {{ episode_item.episode_number }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </div>
          </v-expand-transition>
        </v-card>

        <!-- Series Similares -->
        <v-card class="mb-4 rounded-lg elevation-3">
          <v-card-title class="white--text">
            <v-icon left color="white">
              mdi-video-vintage
            </v-icon>
            {{ $t('serie.similar_series') }}
          </v-card-title>
          <v-card-text class="pt-1">
            <v-slide-group
              center-active
              :show-arrows="$store.state.isDesktop"
            >
              <v-slide-item
                v-for="serie in similarSeries"
                :key="serie.id"
              >
                <article
                  class="serie-item mx-1"
                  style="width:150px;"
                >
                  <SerieCard
                    :title="serie.title"
                    :synopsis="serie.synopsis"
                    :genres="JSON.parse(serie.genres)"
                    :componentgenres="serie.genreList"
                    :status="serie.status.name"
                    :url="serie.url"
                    :image="getCoverImage(serie)"
                  />
                </article>
              </v-slide-item>
            </v-slide-group>
          </v-card-text>
        </v-card>

        <!-- Anuncios -->
        <v-row class="mt-3 justify-center">
          <client-only>
            <div id="bg-ssp-10357" />
            <UtilsVueScriptComponent script="<script data-cfasync='false' src='../../bg.js' type='text/javascript'></script>" />
          </client-only>
        </v-row>
      </v-col>
    </v-row>

    <!-- Modal de Rating -->
    <SerieRatingModal
      :visible="showRatingModal"
      :serie="episode.serie"
      :user-rating="userRating"
      @close="showRatingModal = false"
      @rated="onRated"
    />

    <!-- Modal de descargas -->
    <v-dialog
      v-model="modalDownload"
      class="download-modal"
    >
      <v-card class="rounded-lg">
        <v-card-title
          class="primary white--text"
          :class="{'py-3': $vuetify.breakpoint.smAndDown}"
        >
          <span class="text-truncate">
            {{ $t('episode.download') }} {{ episode.serie.title }} {{ $t('episode.episode_number') }} {{ episode.episode_number }}
          </span>
          <v-spacer />
          <v-btn
            v-if="$vuetify.breakpoint.xsOnly"
            icon
            dark
            @click="modalDownload = false"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text :class="{'pa-2': $vuetify.breakpoint.smAndDown, 'pt-5': !$vuetify.breakpoint.smAndDown}">
          <v-row class="justify-center mt-2">
            <v-btn
              v-for="link in downloadsName"
              :key="link.name"
              :href="link.url.url"
              target="_blank"
              color="primary mr-2"
              class="p-3"
            >
              {{ link.name }}
            </v-btn>
          </v-row>
        </v-card-text>

        <v-card-actions :class="{'pb-4 px-4': !$vuetify.breakpoint.smAndDown, 'pa-2': $vuetify.breakpoint.smAndDown}">
          <v-spacer />
          <v-btn
            v-if="!$vuetify.breakpoint.xsOnly"
            color="grey darken-1"
            text
            @click="modalDownload = false"
          >
            {{ $t('episode.close') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
  <MiscEpisodeRenderSkeleton v-else />
</template>

<script>
import parse from 'url-parse'
import { mapActions, mapGetters } from 'vuex'
import Hls from 'hls.js'
import SerieRatingModal from './SerieRatingModal.vue'
import RatingDisplay from './RatingDisplay.vue'

export default {
  components: {
    SerieRatingModal,
    RatingDisplay
  },
  data () {
    return {
      CDN: process.env.CDN_URI,
      episode: {
        id: null,
        players: [],
        serie: {
          title: ''
        }
      },
      showVideo: false,
      downloadsName: [],
      areDownloadLinksGenerated: false,
      currentUrl: '',
      nextEpisodeUrl: '',
      episodeCount: [],
      favorites: [],
      breadcrumb: [
        {
          text: 'Hentaini',
          disabled: false,
          to: '/'
        },
        {
          text: 'Serie',
          to: '/',
          disabled: false,
          exact: true
        },
        {
          text: 'Episode',
          disabled: true
        }
      ],
      modalDownload: false,
      rating: 0,
      show: true,
      user_id: '',
      watchlaters: [],
      similarSeries: [],
      showRatingModal: false,
      serieRating: {
        averageRating: 0,
        totalVotes: 0
      },
      userRating: 0,
      hlsInstance: null,
      selectedPlayerIndex: 0
    }
  },
  head () {
    return {
      title: this.episode ? this.episode.serie.title : 'Hentaini',
      meta: this.episode
        ? [
            { hid: 'description', name: 'description', content: 'Watch online ' + this.episode.serie.title + ' in best quality' },
            { hid: 'keywords', name: 'keywords', content: 'Watch online' },
            { hid: 'canonical', rel: 'canonical', href: `https://hentaini.com/h/${this.episode.serie.url}/${this.episode.episode_number}` },
            { hid: 'language', name: 'language', content: 'en' },
            { hid: 'Revisit-After', name: 'Revisit-After', content: '3 days' },
            { hid: 'audience', name: 'audience', content: 'all' },
            { hid: 'rating', name: 'rating', content: 'general' },
            { hid: 'distribution', name: 'distribution', content: 'global' },
            { hid: 'document-type', name: 'document-type', content: 'Public' },
            { hid: 'MSSmartTagsPreventParsing', name: 'MSSmartTagsPreventParsing', content: 'true' },
            { hid: 'robots', name: 'robots', content: 'all' },
            { hid: 'robots', name: 'robots', content: 'all, index, follow' },
            { hid: 'googlebot', name: 'googlebot', content: 'all, index, follow' },
            { hid: 'yahoo-slurp', name: 'yahoo-slurp', content: 'all, index, follow' },
            { hid: 'msnbot', name: 'msnbot', content: 'index, follow' },
            { hid: 'googlebot-image', name: 'googlebot-image', content: 'all' },
            { hid: 'title', name: 'title', content: 'Watch ' + this.episode.serie.title + ' episode ' + this.episode.episode_number + ' free online HD' },
            { hid: 'description', name: 'description', content: 'Watch online ' + this.episode.serie.title + ' in best quality. I mean, its Hentaini, the best place to watch your favourite series' },
            { hid: 'keywords', name: 'keywords', content: 'Watch online hentai, best HD archive of the best of japanese culture for the world, hentaini, ahegao, yuri, yaoi, tentacle, maid, siscon, brocon' },
            { hid: 'og:title', property: 'og:title', content: this.episode.serie.title },
            { hid: 'og:description', property: 'og:description', content: 'Its a Hentai site, what do you expect? a no-girlfriend-depression solution?' },
            { hid: 'og:url', property: 'og:url', content: `https://hentaini.com/h/${this.episode.serie.url}/${this.episode.episode_number}` },
            { hid: 'og:image', property: 'og:image', content: 'https://hentaini.com/screenshot/' + this.episode.serie.background_coverUrl },
            { hid: 'author', name: 'author', content: 'hentaini' }
          ]
        : []
    }
  },
  computed: {
    ...mapGetters('ratings', ['getSerieRating', 'getUserRating', 'isLoading']),
    serieId () {
      return this.$route.params.serie
    },
    episodeNumber () {
      return this.$route.params.episode
    },
    serieIsPresentInFavorites () {
      return this.favorites.some(favorite => favorite.url === this.episode.serie.url)
    },
    isHLSPlayer () {
      const currentPlayer = this.filteredPlayers.find(player => player.url === this.currentUrl)
      if (!currentPlayer) { return false }
      // Detectar HLS por nombre del reproductor o por extensión .m3u8
      return currentPlayer.name === 'HLS Player' ||
             (currentPlayer.url && currentPlayer.url.toLowerCase().includes('.m3u8'))
    },
    filteredPlayers () {
      return this.episode.players.filter(player => player.name !== 'SSB' && player.name !== 'Cloud' && player.name !== 'C' && player.name !== 'TERA' && player.name !== 'TR' && player.name !== 'CW' && player.name !== 'F')
    },
    isInWatchLater () {
      return this.watchlaters.some(watchlater => watchlater.serie.url === this.serieId && watchlater.episode_number === parseInt(this.episodeNumber))
    },
    thisWatchLater () {
      return this.watchlaters.find(watchlater => watchlater.serie.url === this.serieId && watchlater.episode_number === parseInt(this.episodeNumber)) || null
    },
    serieScreenshot () {
      const screenshotImage = this.episode.image || this.episode.serie.images?.find(image => image.image_type?.name === 'screenshot')
      if (screenshotImage?.cf_path) {
        return `${screenshotImage.cf_path}`
      }
      return screenshotImage?.path ? `${this.$config.SCREENSHOT_ENDPOINT}${screenshotImage.path}` : ''
    }
  },
  watch: {
    showVideo (newVal) {
      if (newVal && this.isHLSPlayer) {
        this.$nextTick(() => {
          this.initHLSPlayer()
        })
      }
    },
    currentUrl () {
      // Limpiar instancia HLS anterior cuando cambie la URL
      if (this.hlsInstance) {
        this.hlsInstance.destroy()
        this.hlsInstance = null
      }
      if (this.showVideo && this.isHLSPlayer) {
        this.$nextTick(() => {
          this.initHLSPlayer()
        })
      }
    },
    selectedPlayerIndex (newIndex) {
      // Actualizar currentUrl cuando cambie el índice seleccionado
      if (this.filteredPlayers[newIndex]) {
        this.currentUrl = this.filteredPlayers[newIndex].url
      }
    }
  },
  beforeDestroy () {
    // Limpiar instancia HLS al destruir el componente
    if (this.hlsInstance) {
      this.hlsInstance.destroy()
      this.hlsInstance = null
    }
  },
  mounted () {
    const serie = this.$route.params.serie
    // is its a string of six numbers
    if (/^\d{6}$/.test(serie)) {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          h_id: serie
        }
      },
      {
        encodeValuesOnly: true
      })
      fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`)
        .then(res => res.json())
        .then(({ data: serie }) => {
          this.$router.push(`/h/${serie[0].url}/${this.$route.params.episode}`)
        })
    }

    this.getEpisode()
    if (this.$store.state.auth) {
      this.getFavorites()
      this.getWatchLaters()
    }
    window.addEventListener('resize', this.isDesktopScreen)
    this.isDesktopScreen()
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
    ...mapActions('ratings', ['fetchSerieRating', 'submitRating']),
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
    },
    isDesktopScreen () {
      const res = document.body.clientWidth
      if (res < 960) {
        this.isDesktop = false
      } else {
        this.isDesktop = true
      }
      this.$store.commit('isDesktop', this.isDesktop)
    },
    async getEpisode () {
      const episode = await this.$store.dispatch('episodes/getEpisodePublic', {
        serieId: this.serieId,
        episode_number: this.episodeNumber
      })
      episode.players = JSON.parse(episode.players)
      episode.downloads = JSON.parse(episode.downloads)
      // sort episode.series.episodes by episode number
      episode.serie.episodes = episode.serie.episodes.sort((a, b) => a.episode_number - b.episode_number)
      this.episode = episode
      setTimeout(() => {
        this.genCurrentUrl()
        this.genBreadcrumb()
        this.setUserId()
        this.addVisit()
        this.getSimilarSeries()
        this.loadSerieRating()
      }, 100)
    },
    async getFavorites () {
      this.favorites = await this.$store.dispatch('favorite/getFavorites', {
        user: this.$store.state.auth,
        serie: this.episode.serie,
        token: this.$store.state.auth.token
      })
    },
    addVisit () {
      this.$store.dispatch('episodes/addVisit', {
        serieId: this.episode.serie.id,
        visits: this.episode.serie.visits + 1
      })
    },
    changeCurrentUrl (currentUrl) {
      this.currentUrl = currentUrl
      // Actualizar el índice seleccionado para sincronizar con v-slide-group
      const playerIndex = this.filteredPlayers.findIndex(player => player.url === currentUrl)
      if (playerIndex !== -1) {
        this.selectedPlayerIndex = playerIndex
      }
      // No resetear showVideo aquí para mantener el estado del reproductor
      // Reinicializar HLS cuando cambie la URL si el video ya está siendo mostrado
      if (this.showVideo && this.isHLSPlayer) {
        this.$nextTick(() => {
          this.initHLSPlayer()
        })
      }
    },
    genCurrentUrl () {
      this.currentUrl = this.filteredPlayers[0].url
      this.selectedPlayerIndex = 0
    },
    genBreadcrumb () {
      this.breadcrumb[2].text = 'Episode ' + this.episode.episode_number
      this.breadcrumb[1].text = this.episode.serie.title
      this.breadcrumb[1].to = `/h/${this.episode.serie.url}`
    },
    genDownloadName () {
      this.modalDownload = true
      if (!this.areDownloadLinksGenerated) {
        for (let i = 0; i < this.episode.downloads.length; i++) {
          const regex = /([a-z0-9][a-z0-9-]*)?((\.[a-z]{2,6}))$/
          const nameDownload = parse(this.episode.downloads[i].url, true)
          const parsedName = nameDownload.host
          const newName = parsedName.match(regex)
          const newDownloadButtons = {}
          newDownloadButtons.url = this.episode.downloads[i]
          newDownloadButtons.name = newName[1]
          if (!newDownloadButtons.name.includes('cloudup')) {
            this.downloadsName.push(newDownloadButtons)
            this.areDownloadLinksGenerated = true
          }
        }
      }
    },
    setUserId () {
      if (!this.$store.state.auth) {
        this.user_id = ''
      } else {
        this.user_id = this.$store.state.auth.username
      }
    },
    async setFavorite () {
      const res = await this.$store.dispatch('favorite/setNewFavorite', {
        user: this.$store.state.auth,
        serie: this.episode.serie,
        token: this.$store.state.auth.token
      })
      this.favorites.push({
        id: res.data.id,
        url: this.episode.serie.url
      })
    },
    removeFavorite () {
      this.$store.dispatch('favorite/removeFavorite', {
        user: this.$store.state.auth,
        favorite: this.favorites.filter(favorite => favorite.url === this.episode.serie.url)[0],
        token: this.$store.state.auth.token
      })
      this.favorites = this.favorites.filter(favorite => favorite.url !== this.episode.serie.url)
    },
    toggleWatchLater (serie) {
      if (this.isInWatchLater) {
        fetch(`${this.$config.API_STRAPI_ENDPOINT}watchlaters/${this.thisWatchLater.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.$store.state.auth.token}`
          }
        }).then((result) => {
          if (result.status === 200) {
            this.getEpisode()
            this.getWatchLaters()
          }
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
        })
      } else {
        const user = this.$store.state.auth.id
        fetch(`${this.$config.API_STRAPI_ENDPOINT}watchlaters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({
            data: {
              user,
              serie,
              episode_number: this.episodeNumber
            }
          })
        }).then((result) => {
          if (result.status === 200) {
            this.getEpisode()
            this.getWatchLaters()
          }
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
        })
      }
    },
    getWatchLaters () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          user: {
            id: this.$store.state.auth.id
          }
        },
        populate: ['serie']
      },
      {
        encodeValuesOnly: true
      })
      fetch(`${this.$config.API_STRAPI_ENDPOINT}watchlaters?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        }
      })
        .then(res => res.json())
        .then(({ data: watchLaters }) => {
          this.watchlaters = watchLaters
        })
    },
    getSimilarSeries () {
      const currentGenres = this.episode.serie.genreList.map(g => g.name)
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          genreList: {
            name: {
              $in: currentGenres
            }
          },
          id: {
            $ne: this.episode.serie.id
          }
        },
        pagination: {
          page: 1,
          pageSize: 8
        },
        populate: ['genreList', 'images', 'images.image_type', 'status']
      }, {
        encodeValuesOnly: true
      })
      fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`)
        .then(res => res.json())
        .then(({ data: series }) => {
          this.similarSeries = series
        })
    },
    initHLSPlayer () {
      const video = this.$refs.hlsVideo
      if (!video || !this.currentUrl) { return }

      // Limpiar instancia anterior si existe
      if (this.hlsInstance) {
        this.hlsInstance.destroy()
        this.hlsInstance = null
      }

      if (Hls.isSupported()) {
        // Usar HLS.js para navegadores que lo soportan
        this.hlsInstance = new Hls()
        this.hlsInstance.loadSource(this.currentUrl)
        this.hlsInstance.attachMedia(video)
        this.hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch((e) => {
            console.log('Autoplay prevented:', e)
          })
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Soporte nativo de HLS (Safari/iOS)
        video.src = this.currentUrl
        video.addEventListener('canplay', () => {
          video.play().catch((e) => {
            console.log('Autoplay prevented:', e)
          })
        })
      }
    },
    async loadSerieRating () {
      try {
        const userId = this.$store.state.auth?.id
        const ratingData = await this.fetchSerieRating({
          serieId: this.episode.serie.id,
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
    onRated (data) {
      this.userRating = data.rating
      this.loadSerieRating()
    }
  }
}
</script>

<style scoped>
.episode-container {
  background-color: rgba(0, 0, 0, 0.02);
}

.video-container {
  position: relative;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.video-preview {
  transition: transform 0.3s ease;
}

.video-preview:hover {
  transform: scale(1.02);
}

.player-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.player-overlay:hover {
  background-color: rgba(0, 0, 0, 0.5);
}

.play-button {
  transition: all 0.3s ease;
}

.play-button:hover {
  transform: scale(1.1);
}

.episode-navigation {
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.player-controls {
  background-color: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.episode-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background-color 0.2s ease;
}

.episode-list-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.episode-list-item.current-episode {
  background-color: rgba(var(--v-primary-base), 0.1);
}

.episode-number {
  min-width: 36px;
  width: 36px;
  height: 36px;
}

.download-modal .v-card__title {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.compact-btn {
  height: 32px !important;
  min-width: 64px !important;
  padding: 0 12px !important;
  font-size: 0.875rem !important;
}

.compact-list-item {
  min-height: 48px !important;
  padding: 4px 8px !important;
}

.compact-avatar {
  min-width: 32px !important;
  width: 32px !important;
  height: 32px !important;
  margin-right: 8px !important;
}

.player-slide-group {
  max-width: 100%;
  overflow-x: auto;
}

.serie-item {
  opacity: 0;
  transform: translateY(15px);
  animation: fadeUpSimilar 0.3s forwards;
}

@keyframes fadeUpSimilar {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Staggered animation for similar series items */
.serie-item:nth-child(1) { animation-delay: 0.1s; }
.serie-item:nth-child(2) { animation-delay: 0.2s; }
.serie-item:nth-child(3) { animation-delay: 0.3s; }
.serie-item:nth-child(4) { animation-delay: 0.4s; }

@media (max-width: 600px) {
  .episode-container {
    padding: 8px !important;
  }

  .v-card-title {
    word-break: break-word;
    font-size: 1.25rem !important;
  }

  .player-controls {
    padding: 8px !important;
  }
}
</style>

<template>
  <div style="max-width: 1400px; margin: 0 auto;">
    <Header />
    <v-container v-if="watchlaters.length > 0">
      <v-row>
        <v-col>
          <h1>{{ $t('watch_later.title') }}</h1>
          <h5 class="text--primary">
            {{ $t('watch_later.subtitle') }}
          </h5>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-for="(watchlater) in watchlaters"
          :key="watchlater.id"
          cols="4"
          lg="2"
          md="4"
          sm="4"
          xs="4"
        >
          <!-- Mostrar EpisodeCard para episodios específicos -->
          <EpisodeCard
            v-if="watchlater.episode_number"
            :episode="watchlater.serie.episodes.find(episode => episode.episode_number === watchlater.episode_number)"
            :watchlaters="[watchlater]"
            @refresh="getWatchLaterSeries"
          />
          <!-- Mantener SerieCard para retrocompatibilidad (series sin episode_number) -->
          <SerieCard
            v-else
            :serie="watchlater.serie"
            :watchlaterid="watchlater.id"
            :removeTagWl="true"
            @refreshwl="getWatchLaterSeries"
          />
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <v-row class="align-center justify-center" style="height:80vh;">
        <v-container>
          <v-row class="justify-center">
            <h1>
              <v-icon color="green lighten-1 text-h1" style="font-size:3rem;">
                mdi-history
              </v-icon>
            </h1>
          </v-row>
          <v-row class="justify-center">
            <h1> {{ $t('watch_later.no_watch_later') }}</h1>
          </v-row>
          <v-row class="justify-center">
            <nuxt-link to="/explore">
              {{ $t('landpage.latest_series_little') }}
            </nuxt-link>
          </v-row>
        </v-container>
      </v-row>
    </v-container>
  </div>
</template>

<script>

export default {
  data () {
    return {
      watchlaters: []
    }
  },
  head () {
    return {
      title: 'Watch Later'
    }
  },
  mounted () {
    this.getWatchLaterSeries()
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
    async getWatchLaterSeries () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          user: this.$store.state.auth.id
        },
        populate: [
          'serie',
          'serie.status',
          'serie.images',
          'serie.images.image_type',
          'serie.genreList',
          'serie.episodes',
          'serie.episodes.image',
          'serie.episodes.serie',
          'serie.episodes.image.image_type'
        ],
        sort: ['createdAt:desc'],
        pagination: {
          limit: 24
        }
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}watchlaters?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        }
      })
        .then(res => res.json())
        .then((watchlaters) => {
          watchlaters.data.map((watchlater) => {
            if (watchlater.serie.genres) {
              watchlater.serie.genres = JSON.parse(watchlater.serie.genres)
              return watchlater
            } else {
              return watchlater
            }
          })
          this.watchlaters = watchlaters.data
        })
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
    },
    getEpisodeImage (serie, episodeNumber) {
      // Buscar el episodio específico
      if (!serie.episodes || !Array.isArray(serie.episodes)) {
        return this.getCoverImage(serie) // Fallback a imagen de serie
      }

      const episode = serie.episodes.find(ep => ep.episode_number === episodeNumber)
      if (!episode || !episode.images || !Array.isArray(episode.images)) {
        return this.getCoverImage(serie) // Fallback a imagen de serie
      }

      // Buscar imagen de screenshot del episodio
      const screenshotImage = episode.images.find(image =>
        image.image_type && image.image_type.name === 'screenshot'
      )

      if (!screenshotImage) {
        return this.getCoverImage(serie) // Fallback a imagen de serie
      }

      return {
        path: screenshotImage.path || '',
        placeholder: screenshotImage.placeholder || '',
        cf_path: screenshotImage.cf_path || null,
        cf_placeholder: screenshotImage.cf_placeholder || null
      }
    }
  }
}
</script>

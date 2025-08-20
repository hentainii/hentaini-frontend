<template>
  <div>
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
          <SerieCard
            :title="watchlater.serie.title"
            :synopsis="watchlater.serie.synopsis"
            :genres="watchlater.serie.genres"
            :componentgenres="watchlater.serie.genreList"
            :status="watchlater.serie.status.name"
            :url="watchlater.serie.url"
            :screenshot="getCoverImageUrl(watchlater.serie)"
            :placeholder="getCoverPlaceholderUrl(watchlater.serie)"
            :cf_screenshot="getCfCoverImageUrl(watchlater.serie)"
            :cf_placeholder="getCfCoverPlaceholderUrl(watchlater.serie)"
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
  mounted () {
    this.getWatchLaterSeries()
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
          'serie.genreList'
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
    getCoverImageUrl (serie) {
      const coverImage = serie.images?.find(image => image.image_type?.name === 'cover')
      return coverImage?.path ? `${this.$config.COVER_ENDPOINT}${coverImage.path}` : ''
    },
    getCoverPlaceholderUrl (serie) {
      const coverImage = serie.images?.find(image => image.image_type?.name === 'cover')
      const placeholderPath = coverImage?.placeholder || coverImage?.path
      return placeholderPath ? `${this.$config.COVER_ENDPOINT}${placeholderPath}` : ''
    },
    getCfCoverImageUrl (serie) {
      const coverImage = serie.images?.find(image => image.image_type?.name === 'cover')
      return coverImage?.cf_path ? `${this.$config.CLOUDFLARE_ENDPOINT}${coverImage.cf_path}` : ''
    },
    getCfCoverPlaceholderUrl (serie) {
      const coverImage = serie.images?.find(image => image.image_type?.name === 'cover')
      const cfPlaceholderPath = coverImage?.cf_placeholder || coverImage?.cf_path
      return cfPlaceholderPath ? `${this.$config.CLOUDFLARE_ENDPOINT}${cfPlaceholderPath}` : ''
    }
  }
}
</script>

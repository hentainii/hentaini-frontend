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
            :screenshot="`${$config.COVER_ENDPOINT}${watchlater.serie.images.find(image => image.image_type.name === 'cover').path}`"
            :placeholder="`${$config.COVER_ENDPOINT}${watchlater.serie.images.find(image => image.image_type.name === 'cover').placeholder ? watchlater.serie.images.find(image => image.image_type.name === 'cover').placeholder : watchlater.serie.images.find(image => image.image_type.name === 'cover').path}`"
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
        user: {
          username: this.$store.state.auth.username
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
          console.log(this.watchlaters)
        })
    }
  }
}
</script>

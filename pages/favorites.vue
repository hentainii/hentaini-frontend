<template>
  <div>
    <Header />
    <v-container v-if="favorites.length > 0">
      <v-row>
        <v-col>
          <h1>{{ $t('favorites.title') }}</h1>
          <h5 class="text--primary">
            {{ $t('favorites.subtitle') }}
          </h5>
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-for="(favorite) in favorites"
          :key="favorite.id"
          cols="4"
          lg="2"
          md="4"
          sm="4"
          xs="4"
        >
          <SerieCard
            :title="favorite.serie.title"
            :synopsis="favorite.serie.synopsis"
            :genres="favorite.serie.genres"
            :componentgenres="favorite.serie.genreList"
            :status="favorite.serie.status.name"
            :url="favorite.serie.url"
            :screenshot="`${$config.COVER_ENDPOINT}${favorite.serie.images.find(image => image.image_type.name === 'cover').path}`"
            :placeholder="`${$config.COVER_ENDPOINT}${favorite.serie.images.find(image => image.image_type.name === 'cover').placeholder ? favorite.serie.images.find(image => image.image_type.name === 'cover').placeholder : favorite.serie.images.find(image => image.image_type.name === 'cover').path}`"
            :favoriteid="favorite.id"
            :removeTagF="true"
            @refreshf="getFavorites"
          />
        </v-col>
      </v-row>
    </v-container>
    <v-container v-else>
      <v-row class="align-center justify-center" style="height:80vh;">
        <v-container>
          <v-row class="justify-center">
            <h1>
              <v-icon color="red lighten-1 text-h1" style="font-size:3rem;">
                mdi-heart
              </v-icon>
            </h1>
          </v-row>
          <v-row class="justify-center">
            <h1> {{ $t('favorites.no_favorites') }}</h1>
          </v-row>
          <v-row class="justify-center">
            <nuxt-link to="/explore"> {{ $t('landpage.latest_series_little') }}</nuxt-link>
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
      favorites: []
    }
  },
  mounted () {
    this.getFavorites()
  },
  methods: {
    async getFavorites () {
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
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}favorites?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        }
      })
        .then(res => res.json())
        .then((favorites) => {
          favorites.data.map((favorite) => {
            if (favorite.serie.genres) {
              favorite.serie.genres = JSON.parse(favorite.serie.genres)
              return favorite
            } else {
              return favorite
            }
          })
          this.favorites = favorites.data
        })
    }
  }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
        <h5 class="text--primary">
          <nuxt-link :to="localePath('/explore')">
            {{ $t('landpage.latest_series_little') }}
          </nuxt-link>
        </h5>
        <h2>{{ $t('landpage.latest_series') }}</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-for="(serie) in series"
        :key="serie._id"
        cols="6"
        lg="2"
        md="4"
        sm="4"
        xs="4"
      >
        <article>
          <SerieCard
            :title="serie.title"
            :synopsis="serie.synopsis"
            :genres="serie.genres"
            :componentgenres="serie.genreList"
            :status="serie.status.name"
            :url="serie.url"
            :screenshot="`${$config.COVER_ENDPOINT}${serie.images.find(image => image.image_type.name === 'cover').path}`"
            :placeholder="`${$config.COVER_ENDPOINT}${serie.images.find(image => image.image_type.name === 'cover').placeholder ? serie.images.find(image => image.image_type.name === 'cover').placeholder : serie.images.find(image => image.image_type.name === 'cover').path}`"
          />
        </article>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  data () {
    return {
      series: []
    }
  },
  mounted () {
    this.getLatestSeries()
  },
  methods: {
    getLatestSeries () {
      const qs = require('qs')
      const query = qs.stringify({
        populate: [
          'status',
          'images',
          'images.image_type',
          'genreList'
        ],
        sort: ['createdAt:desc'],
        pagination: {
          limit: 24
        }
      },
      {
        encodeValuesOnly: true
      })
      fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`)
        .then(res => res.json())
        .then((series) => {
          series.data.map((serie) => {
            serie.genres = JSON.parse(serie.genres)
            return serie
          })
          this.series = series.data
        })
    }
  }
}
</script>

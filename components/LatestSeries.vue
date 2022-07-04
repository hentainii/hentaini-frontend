<template>
  <v-container>
    <v-row>
      <v-col>
        <h5>
          <a href="/explore">{{ $t('landpage.latest_series_little') }}</a>
        </h5>
        <h1>{{ $t('landpage.latest_series') }}</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-for="(serie) in series"
        :key="serie._id"
        cols="6"
        lg="2"
        md="4"
        sm="6"
        xs="6"
      >
        <SerieCard
          :title="serie.title"
          :synopsis="serie.synopsis"
          :genres="serie.genres"
          :status="serie.status.name"
          :url="serie.h_id"
          :screenshot="`${$config.COVER_ENDPOINT}${serie.images.cover.path}`"
        />
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
    async getLatestSeries () {
      const qs = require('qs')
      const query = qs.stringify({
        populate: [
          'status',
          'images',
          'images.image_type'
        ],
        sort: ['createdAt:desc'],
        pagination: {
          limit: 24
        }
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${process.env.API_STRAPI_ENDPOINT}series?${query}`)
        .then(res => res.json())
        .then((input) => {
          const res = input.data.map((serie) => {
            serie.attributes.genres = JSON.parse(serie.attributes.genres)
            serie.attributes.images.cover = serie.attributes.images.data.filter(image => image.attributes.image_type.data.attributes.name === 'cover')[0].attributes
            serie.attributes.images.screenshot = serie.attributes.images.data.filter(image => image.attributes.image_type.data.attributes.name === 'screenshot')[0].attributes
            serie.attributes.status = serie.attributes.status.data.attributes
            return {
              ...serie.attributes
            }
          })
          this.series = res
        })
    }
  }
}
</script>

<template>
  <div style="height:400px;">
    <v-carousel
      v-model="model"
      :show-arrows="false"
      hide-delimiters
      height="400"
      cycle
      interval="4000"
    >
      <v-carousel-item
        v-for="serie in featuredSeries"
        :key="serie.title"
        :src="`${$config.SCREENSHOT_ENDPOINT}${serie.images.find(
          image => image.image_type.name === 'screenshot'
        ).path}`"
        :lazy-src="`${$config.SCREENSHOT_ENDPOINT}${serie.images.find(
          image => image.image_type.name === 'screenshot'
        ).placeholder ? serie.images.find(
          image => image.image_type.name === 'screenshot'
        ).placeholder : serie.images.find(
          image => image.image_type.name === 'screenshot'
        ).path}`"
        :to="localePath(`/h/${serie.url}`)"
        gradient="to top right, rgba(0,0,0,.8), rgba(0,0,0,.2)"
      >
        <v-row align="end" class="lightbox white--text pa-2 fill-height">
          <v-col class="mb-10">
            <v-container>
              <v-chip
                color="primary white--text"
                class="rounded-lg"
              >
                {{ serie.status.name }}
              </v-chip>
              <h1>{{ serie.title }}</h1>
              <p>{{ serie.synopsis }}</p>
            </v-container>
          </v-col>
        </v-row>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>

<script>
export default {
  data () {
    return {
      featuredSeries: [],
      model: 0,
      CDN: process.env.CDN_URI
    }
  },
  mounted () {
    this.getFeaturedSeries()
  },
  methods: {
    getFeaturedSeries () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          featured: true
        },
        populate: [
          'images',
          'images.image_type',
          'status'
        ],
        sort: ['createdAt:desc']
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
          this.featuredSeries = series.data
        })
    }
  }
}
</script>

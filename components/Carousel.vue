<template>
  <v-carousel
    v-if="featuredSeries"
    v-model="model"
    :show-arrows="false"
    height="600"
    cycle
    interval="4000"
  >
    <v-carousel-item
      v-for="serie in featuredSeries"
      :key="serie.title"
      :src="`${$config.SCREENSHOT_ENDPOINT}${serie.images.path}`"
      :href="`h/${serie.h_id}`"
      gradient="to top right, rgba(0,0,0,.8), rgba(0,0,0,.2)"
    >
      <v-row align="end" class="lightbox white--text pa-2 fill-height">
        <v-col class="mb-10">
          <v-container>
            <v-chip
              color="blue darken-2 white--text"
            >
              {{ serie.status.name }}
            </v-chip>
            <h1>{{ serie.title }}</h1>
            <p>{{ serie.synopsis }}</p>
            <v-chip-group
              active-class="blue darken-3"
              column
            >
              <v-chip
                v-for="genre in serie.genres"
                :key="genre.text"
                :href="`/explore?genre=${genre.url}`"
              >
                {{ genre.text }}
              </v-chip>
            </v-chip-group>
          </v-container>
        </v-col>
      </v-row>
    </v-carousel-item>
  </v-carousel>
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
    async getFeaturedSeries () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          featured: {
            $eq: true
          }
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
      await fetch(`${process.env.API_STRAPI_ENDPOINT}series?${query}`)
        .then(res => res.json())
        .then((series) => { // Genres came in a string, so we map the array to convert it to an object
          const res = series.data.map((serie) => {
            serie.attributes.genres = JSON.parse(serie.attributes.genres)
            serie = serie.attributes
            serie.status = serie.status.data.attributes
            serie.images = serie.images.data.filter(image => image.attributes.image_type.data.attributes.name === 'screenshot')[0].attributes
            return {
              ...serie
            }
          })
          this.featuredSeries = res
        })
    }
  }
}
</script>

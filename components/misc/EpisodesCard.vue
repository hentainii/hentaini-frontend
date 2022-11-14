<template>
  <v-card
    class="mx-auto"
  >
    <v-img
      :src="$config.SCREENSHOT_ENDPOINT + serieImage"
      height="200px"
    />

    <v-card-title>
      {{ episodecount }} episodes uploaded in Hentaini
    </v-card-title>

    <v-card-subtitle>
      Last update: today
    </v-card-subtitle>

    <v-card-actions>
      <v-btn
        color="orange lighten-2"
        text
        :to="`/panel/serie`"
      >
        Manage
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data () {
    return {
      episodecount: null,
      serieImage: null
    }
  },
  mounted () {
    this.getEpisodeCount()
    this.getLastSerie()
  },
  methods: {
    async getEpisodeCount () {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?sort=createdAt:desc`)
        .then(res => res.json())
        .then((res) => {
          this.episodecount = res.meta.pagination.total
        })
    },
    async getLastSerie () {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?sort=createdAt:desc&populate[0]=images&populate[1]=images.image_type`)
        .then(res => res.json())
        .then((res) => {
          this.serieImage = res.data[1].images.find(image => image.image_type.name === 'screenshot').path
        })
    }
  }
}
</script>

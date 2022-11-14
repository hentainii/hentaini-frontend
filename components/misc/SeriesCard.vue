<template>
  <v-card
    class="mx-auto"
  >
    <v-img
      :src="$config.SCREENSHOT_ENDPOINT + serieImage"
      height="200px"
    />

    <v-card-title>
      {{ seriescount }} series in Hentaini
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
      seriescount: null,
      serieImage: null
    }
  },
  mounted () {
    this.getSeriesCount()
  },
  methods: {
    async getSeriesCount () {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?sort=createdAt:desc&populate[0]=images&populate[1]=images.image_type`)
        .then(res => res.json())
        .then((res) => {
          this.serieImage = res.data[0].images.find(image => image.image_type.name === 'screenshot').path
          this.seriescount = res.meta.pagination.total
        })
    }
  }
}
</script>

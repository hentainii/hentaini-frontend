<template>
  <v-card
    class="mx-auto"
  >
    <v-img
      src="https://cdn.vuetifyjs.com/images/cards/sunshine.jpg"
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

      <v-spacer />

      <v-btn
        icon
        @click="show = !show"
      >
        <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  data () {
    return {
      episodecount: null
    }
  },
  mounted () {
    this.getEpisodeCount()
  },
  methods: {
    async getEpisodeCount () {
      await fetch(`${process.env.API_STRAPI_ENDPOINT}episodes`)
        .then(res => res.json())
        .then((res) => {
          this.episodecount = res.meta.pagination.total
        })
    }
  }
}
</script>

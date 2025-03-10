<template>
  <v-card
    class="mx-auto"
  >
    <v-img
      :src="serieImage"
      height="200px"
    />

    <v-card-title>
      {{ reportsCount }} pending reports
    </v-card-title>

    <v-card-subtitle>
      Last update: today
    </v-card-subtitle>

    <v-card-actions>
      <v-btn
        color="orange lighten-2"
        text
        :to="`/panel/reports`"
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
      reportsCount: null,
      serieImage: 'img/damn.jpeg'
    }
  },
  mounted () {
    this.getreportsCount()
  },
  methods: {
    async getreportsCount () {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}reports?sort=createdAt:desc&populate[0]=reports&filters[fixed]=false`)
        .then(res => res.json())
        .then((res) => {
          this.reportsCount = res.meta.pagination.total
        })
    }
  }
}
</script>

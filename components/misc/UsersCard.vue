<template>
  <v-card
    max-width="344"
  >
    <v-img
      :src="`${$config.SCREENSHOT_ENDPOINT}usercount.jpg`"
      height="200px"
    />
    <v-card-title>
      {{ usercount }} users registered
    </v-card-title>

    <v-card-subtitle>
      Last update: today
    </v-card-subtitle>

    <v-card-actions>
      <v-btn
        color="orange lighten-2"
        text
        :to="`/panel/user`"
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
      usercount: null
    }
  },
  mounted () {
    this.getUserCount()
  },
  methods: {
    async getUserCount () {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}users`)
        .then(res => res.json())
        .then((res) => {
          this.usercount = res.length
        })
    }
  }
}
</script>

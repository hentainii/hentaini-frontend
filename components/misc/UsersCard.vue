<template>
  <v-card
    class="mx-auto"
  >
    <v-img
      :src="`${$config.SCREENSHOT_ENDPOINT}usercount.jpg`"
      height="200px"
    />
    <v-card-title>
      {{ usercount }} users registered in Hentaini
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

      <v-spacer></v-spacer>

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
      usercount: null
    }
  },
  mounted () {
    this.getUserCount()
  },
  methods: {
    async getUserCount () {
      await fetch(`${process.env.API_STRAPI_ENDPOINT}users`)
        .then(res => res.json())
        .then((res) => {
          this.usercount = res.length
        })
    }
  }
}
</script>

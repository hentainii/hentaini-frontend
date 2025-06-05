<template>
  <v-card class="mx-auto" elevation="8" max-width="400" hover>
    <v-card-title class="blue darken-2 white--text">
      <v-icon color="white" class="mr-2">
        mdi-camera-outline
      </v-icon>
      Studio Management
    </v-card-title>

    <v-card-text class="text-center py-6">
      <v-row>
        <v-col cols="6">
          <h2 class="text-h4 blue--text text--darken-2 font-weight-bold">
            {{ totalStudios }}
          </h2>
          <p class="text-body-2 grey--text mb-0">
            Total Studios
          </p>
        </v-col>
        <v-col cols="6">
          <h2 class="text-h4 red--text font-weight-bold">
            {{ unlinkedStudios }}
          </h2>
          <p class="text-body-2 grey--text mb-0">
            Unlinked
          </p>
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <div class="d-flex justify-center align-center">
        <v-icon color="blue darken-2" size="64">
          mdi-camera-outline
        </v-icon>
      </div>
    </v-card-text>

    <v-card-actions class="justify-center">
      <v-btn
        color="blue darken-2"
        dark
        large
        block
        @click="navigateToStudios"
      >
        <v-icon left>
          mdi-cog
        </v-icon>
        Manage Studios
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'MiscStudiosCard',
  data () {
    return {
      totalStudios: 0,
      unlinkedStudios: 0
    }
  },
  async mounted () {
    await this.loadStats()
  },
  methods: {
    async loadStats () {
      try {
        // Load basic stats
        await this.$store.dispatch('studios/getStudios', {
          token: this.$store.state.auth.token
        })

        const studios = this.$store.state.studios.studios || []
        this.totalStudios = studios.length
        this.unlinkedStudios = studios.filter(studio =>
          !studio.producers || studio.producers.length === 0
        ).length
      } catch (error) {
        console.error('Error loading studio stats:', error)
      }
    },
    navigateToStudios () {
      this.$router.push('/panel/studio')
    }
  }
}
</script>

<style scoped>
.v-card {
  border-radius: 16px;
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-4px);
}
</style>

<template>
  <v-card class="mx-auto" elevation="8" max-width="400" hover>
    <v-card-title class="orange darken-2 white--text">
      <v-icon color="white" class="mr-2">
        mdi-office-building
      </v-icon>
      Producer Management
    </v-card-title>

    <v-card-text class="text-center py-6">
      <v-row>
        <v-col cols="6">
          <h2 class="text-h4 orange--text text--darken-2 font-weight-bold">
            {{ totalProducers }}
          </h2>
          <p class="text-body-2 grey--text mb-0">
            Total Producers
          </p>
        </v-col>
        <v-col cols="6">
          <h2 class="text-h4 green--text font-weight-bold">
            {{ linkedStudios }}
          </h2>
          <p class="text-body-2 grey--text mb-0">
            Linked Studios
          </p>
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <div class="d-flex justify-center align-center">
        <v-icon color="orange darken-2" size="64">
          mdi-office-building
        </v-icon>
      </div>
    </v-card-text>

    <v-card-actions class="justify-center">
      <v-btn
        color="orange darken-2"
        dark
        large
        block
        @click="navigateToProducers"
      >
        <v-icon left>
          mdi-cog
        </v-icon>
        Manage Producers
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'MiscProducersCard',
  data () {
    return {
      totalProducers: 0,
      linkedStudios: 0
    }
  },
  async mounted () {
    await this.loadStats()
  },
  methods: {
    async loadStats () {
      try {
        // Load basic stats
        await this.$store.dispatch('studios/getProducers', {
          token: this.$store.state.auth.token
        })

        const producers = this.$store.state.studios.producers || []
        this.totalProducers = producers.length
        this.linkedStudios = producers.reduce((sum, producer) =>
          sum + (producer.studiosCount || 0), 0
        )
      } catch (error) {
        console.error('Error loading producer stats:', error)
      }
    },
    navigateToProducers () {
      this.$router.push('/panel/producer')
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

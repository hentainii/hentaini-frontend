<template>
  <v-card class="mx-auto" elevation="8" max-width="400" hover>
    <v-card-title class="purple darken-2 white--text">
      <v-icon color="white" class="mr-2">
        mdi-link-variant
      </v-icon>
      Studio-Producer Linking
    </v-card-title>

    <v-card-text class="text-center py-6">
      <v-row>
        <v-col cols="6">
          <h2 class="text-h4 green--text font-weight-bold">
            {{ linkedCount }}
          </h2>
          <p class="text-body-2 grey--text mb-0">
            Linked
          </p>
        </v-col>
        <v-col cols="6">
          <h2 class="text-h4 red--text font-weight-bold">
            {{ unlinkedCount }}
          </h2>
          <p class="text-body-2 grey--text mb-0">
            Unlinked
          </p>
        </v-col>
      </v-row>

      <v-divider class="my-4" />

      <div class="d-flex justify-center align-center">
        <v-icon color="purple darken-2" size="64">
          mdi-link-variant
        </v-icon>
      </div>

      <v-progress-linear
        :value="linkingProgress"
        color="purple darken-2"
        height="8"
        rounded
        class="mt-2"
      />
      <p class="text-caption grey--text mt-1">
        {{ Math.round(linkingProgress) }}% Studios Linked
      </p>
    </v-card-text>

    <v-card-actions class="justify-center">
      <v-btn
        color="purple darken-2"
        dark
        large
        block
        @click="navigateToLinking"
      >
        <v-icon left>
          mdi-link-plus
        </v-icon>
        Manage Links
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'MiscLinkingCard',
  data () {
    return {
      linkedCount: 0,
      unlinkedCount: 0,
      totalStudios: 0
    }
  },
  computed: {
    linkingProgress () {
      if (this.totalStudios === 0) { return 0 }
      return (this.linkedCount / this.totalStudios) * 100
    }
  },
  async mounted () {
    await this.loadStats()
  },
  methods: {
    async loadStats () {
      try {
        // Load studios to calculate linking stats
        await this.$store.dispatch('studios/getStudios', {
          token: this.$store.state.auth.token
        })

        const studios = this.$store.state.studios.studios || []
        this.totalStudios = studios.length
        this.linkedCount = studios.filter(studio =>
          studio.producers && studio.producers.length > 0
        ).length
        this.unlinkedCount = studios.filter(studio =>
          !studio.producers || studio.producers.length === 0
        ).length
      } catch (error) {
        console.error('Error loading linking stats:', error)
      }
    },
    navigateToLinking () {
      this.$router.push('/panel/linking')
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

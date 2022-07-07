<template>
  <v-container>
    <v-chip-group
      v-if="genres"
      style="border-bottom: 1px solid rgb(84 84 84);padding-bottom: 10px;padding-top: 5px;"
    >
      <v-chip v-for="tag in genres" :key="tag.url" :href="`/explore?genre=${tag.url}`">
        {{ tag.name }}
      </v-chip>
    </v-chip-group>
  </v-container>
</template>
<script>
export default {
  name: 'TagCloud',
  data: () => ({
    h: 'e'
  }),
  computed: {
    genres () {
      return this.$store.state.genres.genres
    }
  },
  mounted () {
    this.getTags()
  },
  methods: {
    async getTags () {
      await this.$store.dispatch('genres/getGenres', {
        token: this.$store.state.auth.token
      })
    }
  }
}
</script>
<style>
.v-slide-group__prev {
display: none !important;
}
</style>

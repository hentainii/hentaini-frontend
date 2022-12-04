<template>
  <v-container fluid>
    <nuxt-link
      v-for="(episode, index) in episodes"
      :key="index"
      :to="localePath(`/h/${serie.h_id}/${episode.episode_number}`)"
    >
      <v-row
        class="episode"
      >
        <v-icon x-large>
          mdi-play
        </v-icon>
        <h3 class="mt-2">
          {{ serie.title }} episode {{ episode.episode_number }}
        </h3>
      </v-row>
    </nuxt-link>
  </v-container>
</template>
<script>
export default {
  name: 'SerieEpisodeList',
  props: {
    serie: {
      type: Object,
      default: null
    },
    episodes: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
    }
  }
}
</script>
<style scoped>
  .episode {
    border-bottom: 2px solid rgb(255 255 240 / 33%);
    padding:10px;
    margin-top:10px;
    color: white!important;
  }
  .episode:hover {
    background-color: rgb(255 255 240 / 33%);
    cursor:pointer;
  }
</style>

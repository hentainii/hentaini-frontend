<template>
  <v-container v-if="serie">
    <v-alert
      v-if="alertBox"
      type="info"
      :class="alertBoxColor"
      tile
      dismissible
    >
      {{ createdMessage }}
    </v-alert>
    <v-row>
      <v-col cols="3">
        <v-card
          class="mx-auto elevation-0"
          width="auto"
        >
          <v-img
            class="white--text align-end"
            height="50vh"
            width="auto"
            :src="coverImageSrc"
            :lazy-src="coverImagePlaceholder"
          >
            <v-card-title>{{ serie.title }}</v-card-title>
          </v-img>
          <v-card-subtitle class="pb-0">
            English: {{ serie.title_english }}
          </v-card-subtitle>
          <v-card-subtitle class="pb-0">
            Episodes: {{ serie.episodes.length }}
          </v-card-subtitle>

          <v-card-text class="text--primary">
            <div>{{ serie.synopsis }}</div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              color="deep-purple accent-4"
              class="elevation-0"
              :to="`/panel/serie/${serie.id}/episode/create`"
            >
              Add Episode
            </v-btn>

            <v-btn
              color="deep-purple accent-2"
              outlined
              class="elevation-0"
              :to="`/panel/serie/${serie.id}/edit`"
            >
              Edit Serie
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="9">
        <v-simple-table width="100%">
          <template #default>
            <thead>
              <tr>
                <th class="text-left">
                  Episode Number
                </th>
                <th class="text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="episode in serie.episodes"
                :key="episode.id"
              >
                <td>{{ episode.episode_number }}</td>
                <td>
                  <v-tooltip top>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        :to="`/h/${serie.url}/${episode.episode_number}`"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>
                          mdi-play-box-edit-outline
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Play Episode</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        :to="`/panel/serie/${serie.id}/episodes/${episode.id}/edit`"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon>
                          mdi-circle-edit-outline
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Edit Episode</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        v-on="on"
                        @click="deleteEpisode(episode.id)"
                      >
                        <v-icon>
                          mdi-delete-outline
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Remove Episode</span>
                  </v-tooltip>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'EpisodeList',
  data: () => ({
    serie: null,
    alertBox: false,
    alertBoxColor: '',
    createdMessage: ''
  }),
  computed: {
    coverImage () {
      if (!this.serie || !this.serie.images || !Array.isArray(this.serie.images)) {
        return null
      }
      return this.serie.images.find(image =>
        image && image.image_type && image.image_type.name === 'cover'
      )
    },
    coverImageSrc () {
      if (!this.coverImage || !this.coverImage.path) {
        return '/img/placeholder-cover.jpg' // Fallback image
      }
      if (this.coverImage.cf_path) {
        return this.coverImage.cf_path
      }
      return `${this.$config.COVER_ENDPOINT}${this.coverImage.path}`
    },
    coverImagePlaceholder () {
      if (!this.coverImage) {
        return '/img/placeholder-cover.jpg'
      }
      if (this.coverImage.cf_placeholder) {
        return this.coverImage.cf_placeholder
      }
      if (this.coverImage.cf_path) {
        return this.coverImage.cf_path
      }
      const placeholderPath = this.coverImage.placeholder || this.coverImage.path
      if (!placeholderPath) {
        return '/img/placeholder-cover.jpg'
      }
      return `${this.$config.COVER_ENDPOINT}${placeholderPath}`
    }
  },
  async mounted () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'primary'
      this.createdMessage = 'Episode Created Successfully.'
    }
    if (this.$route.query.edited) {
      this.alertBox = true
      this.alertBoxColor = 'yellow darken-4'
      this.createdMessage = 'Episode Edited Successfully.'
    }
    if (this.$route.query.deleted) {
      this.alertBox = true
      this.alertBoxColor = 'red darken-4'
      this.createdMessage = 'Episode Deleted Successfully.'
    }
    await this.getSerie()
  },
  methods: {
    async getSerie () {
      await this.$store.dispatch('series/getSerie', {
        serieId: this.$route.params.id,
        populate: [
          'genreList',
          'status',
          'images',
          'images.image_type',
          'language',
          'serie_type',
          'episodes'
        ]
      })
      this.serie = { ...JSON.parse(JSON.stringify(this.$store.state.series.currentSerie)) }
      this.serie.episodes.sort((a, b) => a.episode_number - b.episode_number)
    },
    deleteEpisode (episodeId) {
      const alertResult = confirm('Are you sure you want to delete this episode?')
      if (!alertResult) { return }
      const deleted = this.$store.dispatch('episodes/deleteEpisode', {
        episodeId,
        token: this.$store.state.auth.token
      })
      if (deleted) {
        this.$router.push({
          query: {
            deleted: true
          }
        })
        this.serie = null
        this.getSerie()
        window.location.reload()
      }
    }
  }
}
</script>

<style>

</style>

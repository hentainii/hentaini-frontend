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
          class="mx-auto"
          width="auto"
        >
          <v-img
            class="white--text align-end"
            height="50vh"
            width="auto"
            :src="`${$config.COVER_ENDPOINT}${serie.images.cover.path}`"
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
              color="green"
              text
              :to="`/panel/serie/${serie.id}/episode/create`"
            >
              Add Episode
            </v-btn>

            <v-btn
              color="orange"
              text
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
                  <DeleteModalDeleteEpisode :episodenumber="episode.episode_number" :episodeid="episode.id" :serieid="$route.params.id" />
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
  async mounted () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
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
      const qs = require('qs')
      const query = qs.stringify({
        populate: [
          'genreList',
          'status',
          'images',
          'images.image_type',
          'language',
          'serie_type',
          'episodes'
        ]
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${process.env.API_STRAPI_ENDPOINT}series/${this.$route.params.id}?${query}`)
        .then(res => res.json())
        .then((input) => {
          const res = []
          res.push(input)
          const loop = res.map((res) => {
            res.data.attributes.id = res.data.id
            res.data.attributes.status.data.attributes.id = res.data.attributes.status.data.id
            res.data.attributes.status = res.data.attributes.status.data.attributes
            res.data.attributes.language.data.attributes.id = res.data.attributes.language.data.id
            res.data.attributes.language = res.data.attributes.language.data.attributes
            res.data.attributes.serie_type.data.attributes.id = res.data.attributes.serie_type.data.id
            res.data.attributes.serie_type = res.data.attributes.serie_type.data.attributes
            res.data.attributes.images.cover = res.data.attributes.images.data.filter(image => image.attributes.image_type.data.attributes.name === 'cover')[0].attributes
            res.data.attributes.images.screenshot = res.data.attributes.images.data.filter(image => image.attributes.image_type.data.attributes.name === 'screenshot')[0].attributes
            res.data.attributes.episodes = res.data.attributes.episodes.data.map((episodes) => {
              episodes.attributes.id = episodes.id
              return episodes.attributes
            })
            res.data.attributes.genreList = res.data.attributes.genreList.data.map((genre) => {
              genre.attributes.id = genre.id
              return genre.attributes
            })
            return {
              ...res.data.attributes
            }
          })
          this.serie = loop[0]
        })
    }
  }
}
</script>

<style>

</style>

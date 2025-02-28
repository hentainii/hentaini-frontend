<template>
  <v-container v-if="serie" fluid>
    <v-alert
      v-if="alertBox"
      type="info"
      :class="alertBoxColor"
      tile
      dismissible
    >
      {{ errorMessage }}
    </v-alert>
    <v-row>
      <v-col cols="6">
        <v-card
          class="rounded-xl elevation-0"
          style="box-shadow: #7b1fa2 2px 2px 0px 1px !important;"
        >
          <v-card-title>
            Create Episode for: {{ serie.title }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col>
                <v-text-field
                  v-model.number="episode.episode_number"
                  label="Episode Number"
                  type="number"
                  required
                  hide-details
                  dense
                  outlined
                />
              </v-col>
              <v-col>
                <v-switch
                  v-model="episode.visible"
                  label="Is Visible?"
                  outlined
                />
              </v-col>
              <v-col>
                <v-switch
                  v-model="episode.isNew"
                  label="Is Premiere?"
                  outlined
                />
              </v-col>
              <v-col>
                <v-switch
                  v-model="episode.hasCustomScreenshot"
                  label="Use Custom Image?"
                  prepend-icon="mdi-image"
                  @change="detectNewImage"
                />
              </v-col>
            </v-row>
            <v-file-input
              v-if="episode.hasCustomScreenshot"
              ref="screenshot"
              accept="image/*"
              label="Select a Custom Image"
              outlined
              @change="screenshotSelected"
            />
          </v-card-text>
          <v-card-text v-if="false">
            <UploaderMain />
          </v-card-text>
          <v-card-actions>
            <v-btn
              class="mr-4 primary rounded-xl"
              large
              block
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="createEpisode"
            >
              submit
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card
          class="rounded-xl elevation-0"
          style="box-shadow: #7b1fa2 2px 2px 0px 1px !important;"
        >
          <v-card-title>
            Player Information
          </v-card-title>
          <v-container>
            <TemplatePlayerInput
              v-for="(player, index) in episode.players"
              :id="'container'+index"
              :key="index"
              :index="index"
            >
              <v-select
                :id="'list'+index"
                slot="playerList"
                v-model="player.name"
                :items="players"
                item-text="name"
                label="Player Select"
                hide-details
                solo
              />
              <v-text-field
                :id="'code'+index"
                slot="playerCode"
                v-model="player.code"
                label="Player Code"
                hide-details
                solo
                @change="createPlayerUrl(player.name, player.code, index)"
              />
              <v-btn
                slot="playerDeleteItem"
                @click="removePlayerSlot(index)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </TemplatePlayerInput>
            <v-btn class="mr-4 primary rounded-xl" large @click="addPlayerSlot">
              Add Player
            </v-btn>
            <v-btn class="mr-4 green darken-4 rounded-xl" large @click="playerListModel">
              Airing Model
            </v-btn>
            <v-btn class="mr-4 grey darken-4 rounded-xl" large @click="resetPlayerList">
              Clear Fields
            </v-btn>
          </v-container>
        </v-card>
        <v-card
          class="mt-4 rounded-xl elevation-0"
          style="box-shadow: #7b1fa2 2px 2px 0px 1px !important;"
        >
          <v-card-title>
            Download Links
          </v-card-title>
          <v-container>
            <TemplateDownloadInput
              v-for="(download, index) in episode.downloads"
              :id="'container'+index"
              :key="index"
              :index="index"
            >
              <v-text-field
                :id="'code'+index"
                slot="downloadCode"
                v-model="download.url"
                label="Download URL"
                hide-details
                solo
              />
              <v-btn
                slot="downloadDeleteItem"
                class="rounded-xl"
                @click="removeDownloadSlot(index)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </TemplateDownloadInput>
            <v-btn
              class="mr-4 primary rounded-xl"
              large
              @click="addDownloadSlot"
            >
              Add Download
            </v-btn>
          </v-container>
        </v-card>
        <v-card class="mt-4 rounded-xl elevation-0">
          <v-card-title>
            {{ episode.hasCustomScreenshot ? 'Using custom image' : 'Using Default Screenshot Image' }}
          </v-card-title>
          <v-container v-if="!episode.hasCustomScreenshot">
            <v-row>
              <v-img
                :src="`${$config.SCREENSHOT_ENDPOINT}${serie.images.find((image) => image.image_type.name === 'screenshot').path}`"
                class="rounded-xl"
                style="box-shadow: #7b1fa2 0px -5px 0px 0px !important;"
              />
            </v-row>
          </v-container>
          <v-container v-if="episode.customScreenshot.length > 0 && episode.hasCustomScreenshot">
            <v-row>
              <v-img
                :src="screenshotPreview"
              />
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'CreateEpisode',
  data: () => ({
    episode: {
      serie: null,
      episode_number: 1,
      visible: true,
      isNew: false,
      language: null,
      hasCustomScreenshot: false,
      image: null,
      customScreenshot: [],
      players: [],
      downloads: []
    },
    serie: null,
    languageList: null,
    CDN: process.env.CDN_URI,
    currentCounter: 0,
    sendNotification: false,
    screenshotPreview: '',
    alertBox: false,
    alertBoxColor: '',
    errorMessage: '',
    isSubmitting: false,
    headers: [
      { text: 'Player', value: 'name' },
      { text: 'Progress', value: 'progress' }
    ],
    uploader: [
      { name: 'Cloud', progress: 0 },
      { name: 'Yourupload', progress: 0 },
      { name: 'TERA', progress: 0 },
      { name: 'Stream2', progress: 0 },
      { name: 'mp4uplo', progress: 0 },
      { name: 'BR', progress: 0 },
      { name: 'Mega', progress: 0 }
    ]
  }),
  computed: {
    players () {
      return this.$store.state.players.players
    }
  },
  async mounted () {
    await this.getPlayers()
    await this.getSerie()
  },
  methods: {
    async createEpisode () {
      this.isSubmitting = !this.isSubmitting
      if (this.serie.episodes.find(episode => episode.episode_number === this.episode.episode_number)) {
        this.alertBox = true
        this.alertBoxColor = 'red'
        this.errorMessage = 'Episode number already exists'
        this.isSubmitting = !this.isSubmitting
        return
      }
      this.episode.players = JSON.stringify(this.episode.players)
      this.episode.downloads = JSON.stringify(this.episode.downloads)
      this.episode.serie = this.serie.id
      this.episode.image = this.serie.images.find(image => image.image_type.name === 'screenshot').id
      await this.$store.dispatch('episodes/createEpisode', {
        episode: this.episode,
        token: this.$store.state.auth.token
      })
    },
    async getSerie () {
      await this.$store.dispatch('series/getSerie', {
        serieId: this.$route.params.id,
        populate: [
          'episodes',
          'language',
          'images',
          'images.image_type'
        ]
      })
      this.serie = { ...this.$store.state.series.currentSerie }
      this.episode.episode_number = this.serie.episodes.length === 0 ? 1 : this.serie.episodes.length + 1
    },
    async getPlayers () {
      await this.$store.dispatch('players/getPlayers', {
        token: this.$store.state.auth.token
      })
    },
    createPlayerUrl (player, code, index) {
      const playername = player
      const playerFromList = this.players.filter(player => player.name === playername)
      const playerUrl = playerFromList[0].player_code.replace('codigo', code)
      this.episode.players[index].url = playerUrl
    },
    screenshotSelected () {
      this.episode.customScreenshot = []
      this.episode.customScreenshot.push(this.$refs.screenshot.$refs.input.files[0])
      this.episode.customScreenshot.push(this.episode.serie_title)
      this.episode.customScreenshot.push(this.episode.episode_number)
      this.screenshotPreview = URL.createObjectURL(this.$refs.screenshot.$refs.input.files[0])
    },
    detectNewImage () {
      if (this.episode.hasCustomScreenshot) {
        this.episode.customScreenshot = []
      } else {
        this.episode.customScreenshot = []
      }
    },
    addPlayerSlot () {
      this.episode.players.push({
        name: '',
        url: ''
      })
    },
    addDownloadSlot () {
      this.episode.downloads.push({
        url: ''
      })
    },
    removePlayerSlot (slot) {
      this.episode.players.splice(slot, 1)
    },
    removeDownloadSlot (slot) {
      this.episode.downloads.splice(slot, 1)
    },
    resetPlayerList () {
      this.episode.players = []
    },
    playerListModel () {
      this.episode.players = []
      this.episode.players.push(
        { name: 'Cloud', url: '' },
        { name: 'Yourupload', url: '' },
        { name: 'Stream2', url: '' },
        { name: 'mp4uplo', url: '' },
        { name: 'BR', url: '' },
        { name: 'Mega', url: '' },
        { name: 'TERA', url: '' }
      )
    }
  }
}
</script>

<style>

</style>

<template>
  <v-container v-if="serie">
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
          elevation
        >
          <v-card-title>
            Create Episode for: {{ serie.title }}
          </v-card-title>
          <v-container>
            <v-switch
              v-model="sendNotification"
              label="Send Episode Notification?"
              prepend-icon="mdi-bell"
            />
            <v-text-field
              v-model.number="episode.episode_number"
              label="Episode Number"
              type="number"
              required
              outlined
            />
            <v-switch
              v-model="episode.visible"
              label="Is Visible?"
              outlined
            />
            <v-switch
              v-model="episode.hasCustomScreenshot"
              label="Use Custom Image?"
              prepend-icon="mdi-image"
              @change="detectNewImage"
            />
            <v-file-input
              v-if="episode.hasCustomScreenshot"
              ref="screenshot"
              accept="image/*"
              label="Select a Custom Image"
              outlined
              @change="screenshotSelected"
            />
            <v-btn class="mr-4 primary" large @click="createEpisode">
              submit
            </v-btn>
          </v-container>
          <v-container v-if="!episode.hasCustomScreenshot">
            <v-row>
              <h2>Default Screenshot Image</h2>
            </v-row>
            <v-row>
              <v-img
                :src="`${$config.SCREENSHOT_ENDPOINT}${serie.images.find((image) => image.image_type.name === 'screenshot').path}`"
              />
            </v-row>
          </v-container>
          <v-container v-if="episode.customScreenshot.length > 0 && episode.hasCustomScreenshot">
            <h2>Custom Screenshot Image</h2>
            <v-row>
              <v-img
                :src="screenshotPreview"
              />
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card
          elevation
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
            <v-btn class="mr-4 primary" large @click="addPlayerSlot">
              Add Player
            </v-btn>
            <v-btn class="mr-4 green darken-4" large @click="playerListModel">
              Airing Model
            </v-btn>
            <v-btn class="mr-4 grey darken-4" large @click="resetPlayerList">
              Clear Fields
            </v-btn>
          </v-container>
        </v-card>
        <v-card
          elevation
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
                @click="removeDownloadSlot(index)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </TemplateDownloadInput>
            <v-btn
              class="mr-4 primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              large
              @click="addDownloadSlot"
            >
              Add Download
            </v-btn>
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
    isSubmitting: false
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
          'language',
          'images',
          'images.image_type'
        ]
      })
      this.serie = { ...this.$store.state.series.currentSerie }
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
        { name: 'Clip', url: '' },
        { name: 'Fembed', url: '' },
        { name: 'Amazon', url: '' },
        { name: 'mp4uplo', url: '' },
        { name: 'Senvid', url: '' },
        { name: 'Yourupload', url: '' },
        { name: 'Mega', url: '' }
      )
    }
  }
}
</script>

<style>

</style>

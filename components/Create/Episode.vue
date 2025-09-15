<template>
  <v-card class="glass-card pa-6 ma-4" elevation="10">
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
        <v-col cols="12" md="6">
          <v-card-title class="headline font-weight-bold mb-4">
            <v-icon left color="primary">
              mdi-plus-box
            </v-icon>
            Create Episode for: {{ serie.title }}
          </v-card-title>
          <v-form>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model.number="episode.episode_number"
                  label="Episode Number"
                  type="number"
                  required
                  prepend-inner-icon="mdi-numeric"
                  dense
                  outlined
                  class="mb-3"
                />
              </v-col>
              <v-col cols="6">
                <v-switch
                  v-model="episode.visible"
                  label="Is Visible?"
                  inset
                  color="primary"
                  class="mb-3"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <v-switch
                  v-model="episode.isNew"
                  label="Is Premiere?"
                  inset
                  color="deep-purple accent-4"
                  class="mb-3"
                />
              </v-col>
              <v-col cols="6">
                <v-switch
                  v-model="episode.hasCustomScreenshot"
                  label="Use Custom Image?"
                  prepend-icon="mdi-image"
                  class="mb-3"
                  @change="detectNewImage"
                />
              </v-col>
            </v-row>
            <v-file-input
              v-if="episode.hasCustomScreenshot"
              ref="screenshot"
              label="Select a Custom Image"
              prepend-icon="mdi-image"
              accept="image/jpg, image/jpeg, image/png"
              outlined
              @change="screenshotSelected"
            />
            <v-btn
              class="mt-4 primary rounded-xl"
              large
              block
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="createEpisode"
            >
              <v-icon left>
                mdi-content-save
              </v-icon>
              Create Episode
            </v-btn>
          </v-form>
        </v-col>
        <v-col cols="12" md="6">
          <v-card class="glass-card pa-4 mb-4" elevation="6">
            <v-card-title class="subtitle-1 font-weight-bold mb-2">
              <v-icon left color="primary">
                mdi-play-circle
              </v-icon>
              Player Information
            </v-card-title>
            <v-container>
              <draggable
                v-model="episode.players"
                tag="div"
                :options="{ handle: '.drag-handle', animation: 200 }"
              >
                <div v-for="(player, index) in episode.players" :key="player.id || index">
                  <TemplatePlayerInput :index="index">
                    <template #dragHandle>
                      <v-icon class="drag-handle" style="cursor: move;">
                        mdi-drag
                      </v-icon>
                    </template>
                    <template #playerList>
                      <v-select
                        :id="'list' + index"
                        v-model="player.name"
                        :items="players"
                        item-text="name"
                        label="Player Select"
                        prepend-inner-icon="mdi-play-circle"
                        hide-details
                        solo
                      />
                    </template>
                    <template #playerCode>
                      <v-text-field
                        :id="'code' + index"
                        v-model="player.code"
                        label="Player Code"
                        prepend-inner-icon="mdi-code-tags"
                        hide-details
                        solo
                        @change="createPlayerUrl(player.name, player.code, index)"
                      />
                    </template>
                    <template #playerDeleteItem>
                      <v-btn @click="removePlayerSlot(index)">
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                  </TemplatePlayerInput>
                </div>
              </draggable>
              <v-btn class="mr-4 primary rounded-xl mt-2" large @click="addPlayerSlot">
                <v-icon left>
                  mdi-plus
                </v-icon>
                Add Player
              </v-btn>
              <v-btn class="mr-4 green darken-4 rounded-xl mt-2" large @click="playerListModel">
                <v-icon left>
                  mdi-rocket-launch
                </v-icon>
                Airing Model
              </v-btn>
              <v-btn class="mr-4 grey darken-4 rounded-xl mt-2" large @click="resetPlayerList">
                <v-icon left>
                  mdi-broom
                </v-icon>
                Clear Fields
              </v-btn>
            </v-container>
          </v-card>
          <v-card class="glass-card pa-4 mb-4" elevation="6">
            <v-card-title class="subtitle-1 font-weight-bold mb-2">
              <v-icon left color="primary">
                mdi-download
              </v-icon>
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
                  prepend-inner-icon="mdi-link"
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
                class="mr-4 primary rounded-xl mt-2"
                large
                @click="addDownloadSlot"
              >
                <v-icon left>
                  mdi-plus
                </v-icon>
                Add Download
              </v-btn>
            </v-container>
          </v-card>
          <v-card class="glass-card pa-4" elevation="6">
            <v-card-title class="subtitle-1 font-weight-bold mb-2">
              <v-icon left color="primary">
                mdi-image
              </v-icon>
              {{ episode.hasCustomScreenshot ? 'Using custom image' : 'Using Default Screenshot Image' }}
            </v-card-title>
            <v-container v-if="!episode.hasCustomScreenshot">
              <v-row>
                <v-img
                  :src="getScreenshotPath()"
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

    <!-- Toast Notifications -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type === 'success' ? 'success' : notification.type === 'error' ? 'error' : notification.type === 'warning' ? 'warning' : 'info'"
      :timeout="5000"
      top
      right
    >
      <strong>{{ notification.title }}</strong><br>
      {{ notification.message }}
      <template #action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="hideNotification"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'CreateEpisode',
  components: { draggable },
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
    notification: {
      show: false,
      type: 'info',
      title: '',
      message: ''
    }
  }),
  computed: {
    players () {
      return this.$store.state.players.players
    }
  },
  async mounted () {
    await this.getPlayers()
    await this.getPlayersWithAccounts()
    await this.getSerie()
    setTimeout(() => {
      this.getSerie()
    }, 2000)
    this.populateFromQuery()
  },
  methods: {
    populateFromQuery () {
      const { episodeNumber, players: playersJson } = this.$route.query

      if (episodeNumber) {
        this.episode.episode_number = parseInt(episodeNumber, 10)
      }

      if (playersJson) {
        try {
          const uploadedPlayers = JSON.parse(playersJson)
          const newPlayers = uploadedPlayers.map((p) => {
            const playerInfo = this.players.find(player => player.name === p.service)
            if (playerInfo) {
              return {
                name: p.service,
                code: p.result,
                url: playerInfo.player_code.replaceAll('codigo', p.result)
              }
            }
            return null
          }).filter(p => p !== null)

          this.episode.players = newPlayers
        } catch (error) {
          console.error('Error parsing players from query:', error)
          this.alertBox = true
          this.alertBoxColor = 'red'
          this.errorMessage = 'Could not load player data from uploader.'
        }
      }
    },
    async createEpisode () {
      this.isSubmitting = !this.isSubmitting
      if (this.serie.episodes.find(episode => episode.episode_number === this.episode.episode_number)) {
        this.alertBox = true
        this.alertBoxColor = 'red'
        this.errorMessage = 'Episode number already exists'
        this.isSubmitting = !this.isSubmitting
        return
      }

      try {
        // Convertimos los arrays a JSON para enviarlos
        this.episode.players = JSON.stringify(this.episode.players)
        this.episode.downloads = JSON.stringify(this.episode.downloads)
        this.episode.serie = this.serie.id
        this.episode.image = this.serie.images.find(image => image.image_type.name === 'screenshot').id

        const { data: createdEpisode } = await this.$store.dispatch('episodes/createEpisode', {
          episode: this.episode,
          token: this.$store.state.auth.token
        })
        console.log('Created episode:', createdEpisode)
        // Si tiene imagen personalizada, primero subimos la imagen
        if (this.episode.hasCustomScreenshot && this.episode.customScreenshot.length > 0) {
          await this.uploadImageToStrapi(
            this.episode.customScreenshot[0],
            this.serie.title,
            'screenshot',
            this.episode.episode_number,
            createdEpisode.id
          )
        }
        this.$router.push({ path: `/panel/serie/${this.serie.id}/episodes`, query: { created: true } })
      } catch (error) {
        this.alertBox = true
        this.alertBoxColor = 'red'
        this.errorMessage = 'Error creating episode: ' + error.message
        this.isSubmitting = !this.isSubmitting
      }
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
    async getPlayersWithAccounts () {
      await this.$store.dispatch('players/getPlayersWithAccounts', {
        token: this.$store.state.auth.token
      })
    },
    createPlayerUrl (player, code, index) {
      const playerFromList = this.players.filter(p => p.name === player)
      if (playerFromList.length) {
        const playerUrl = playerFromList[0].player_code.replaceAll('codigo', code)
        this.episode.players[index].url = playerUrl
      }
    },
    screenshotSelected () {
      this.episode.customScreenshot = []
      this.episode.customScreenshot.push(this.$refs.screenshot.$refs.input.files[0])
      this.episode.customScreenshot.push(this.serie.title)
      this.episode.customScreenshot.push(this.episode.episode_number)
      this.screenshotPreview = URL.createObjectURL(this.$refs.screenshot.$refs.input.files[0])
    },
    detectNewImage () {
      this.episode.customScreenshot = []
      this.screenshotPreview = ''
    },
    addPlayerSlot () {
      this.episode.players.push({
        name: '',
        code: '',
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
      this.episode.players = [
        { name: 'BR', url: '' },
        { name: 'Mega', url: '' },
        { name: 'PXD', url: '' },
        { name: 'Yourupload', url: '' },
        { name: 'HNI', url: '' },
        { name: 'Stream2', url: '' },
        { name: 'mp4uplo', url: '' }
      ]
    },
    async uploadImageToStrapi (imageBlob, imageName, imageType, episodeNumber, createdEpisodeId) {
      console.log('Uploading image to Strapi:', imageBlob, imageName, imageType, episodeNumber, createdEpisodeId)
      const formData = new FormData()
      formData.append('files', imageBlob, `${imageName}_${imageType}`)

      try {
        const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.$store.state.auth.token}`
          },
          body: formData
        })

        if (response.status === 200) {
          const strapiRes = await response.json()
          // Guardamos el ID del episodio para poder asociarlo con la imagen
          await this.createImageComponent(strapiRes[0], createdEpisodeId)
          return strapiRes[0]
        } else {
          const strapiRes = await response.json()
          console.error('Upload failed:', strapiRes)
          throw new Error('Upload failed', strapiRes)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        throw error
      }
    },
    async createImageComponent (image, createdEpisodeId) {
      try {
        // Usar el endpoint local para subir imágenes
        const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}images/create-local`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({
            data: {
              path: `${image.hash}${image.ext}`,
              placeholder: `${image.formats.thumbnail.hash}${image.formats.thumbnail.ext}`,
              image_type: 2,
              episodes: [createdEpisodeId]
            }
          })
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            console.log('Episode screenshot saved locally successfully')
            this.showNotification('success', 'Éxito', 'Imagen del episodio guardada localmente correctamente')
            return result.data.id
          }
        } else {
          console.error('Failed to save episode screenshot:', response.statusText)
          this.showNotification('error', 'Error de Guardado', 'Error al guardar la imagen del episodio')
          throw new Error('Failed to create image component')
        }
      } catch (error) {
        console.error('Error creating image component:', error)
        this.showNotification('error', 'Error de Guardado', `Error al guardar la imagen del episodio: ${error.message}`)
        throw error
      }
    },
    getScreenshotPath () {
      const screenshotImage = this.serie.images.find(image => image.image_type.name === 'screenshot')
      return screenshotImage && screenshotImage.path
        ? `${this.$config.SCREENSHOT_ENDPOINT}${screenshotImage.path}`
        : 'placeholder.jpg' // Cambia esto a la imagen por defecto
    },
    showNotification (type, title, message) {
      this.notification = {
        show: true,
        type,
        title,
        message
      }
      setTimeout(() => {
        this.hideNotification()
      }, 5000)
    },
    hideNotification () {
      this.notification.show = false
    }
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255,255,255,0.12);
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
}
.drag-handle {
  margin-right: 8px;
}
</style>

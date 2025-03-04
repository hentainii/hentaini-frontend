<template>
  <v-container v-if="episode">
    <v-row v-if="error">
      <v-alert
        type="error"
        dismissible
      >
        {{ errorMessage }}
      </v-alert>
    </v-row>
    <v-row>
      <v-col cols="6">
        <v-card elevation>
          <v-card-title>
            Edit Episode {{ episode.episode_number }} for: {{ episode.serie.title }}
          </v-card-title>
          <v-container>
            <v-text-field
              v-model="episode.serie.id"
              disabled
              label="Episode From"
              readonly
              required
            />
            <v-text-field
              v-model.number="episode.episode_number"
              label="Episode Number"
              type="number"
              required
            />
            <v-switch
              v-model="episode.visible"
              label="Is Visible?"
            />
            <v-switch
              v-model="hasCustomScreenshot"
              label="Change Custom Image?"
              prepend-icon="mdi-image"
              @change="detectNewImage"
            />
            <v-file-input
              v-if="hasCustomScreenshot"
              ref="screenshot"
              accept="image/*"
              label="Select a Custom Image"
              @change="screenshotSelected"
            />
            <v-btn
              class="mr-4 primary"
              large
              @click="editEpisode"
            >
              submit
            </v-btn>
          </v-container>
          <v-container v-if="!hasCustomScreenshot">
            <v-row>
              <h2>Current Screenshot Image</h2>
            </v-row>
            <v-row v-if="episode.image">
              <v-img
                :src="`${$config.SCREENSHOT_ENDPOINT}${episode.image.path}`"
              />
            </v-row>
            <p v-else class="mt-3">
              No Image
            </p>
          </v-container>
          <v-container v-if="hasCustomScreenshot">
            <h2>Custom Screenshot Image</h2>
            <v-row class="mt-2">
              <v-img
                :src="screenshotPreview"
              />
            </v-row>
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card elevation>
          <v-card-title>
            Player Information
          </v-card-title>
          <v-container>
            <!-- Envolvemos la lista de players con draggable -->
            <draggable
              v-model="episode.players"
              tag="div"
              :options="{ handle: '.drag-handle', animation: 200 }"
            >
              <div v-for="(player, index) in episode.players" :key="player.id || index">
                <TemplatePlayerInput :index="index">
                  <!-- Slot para el handle de arrastre -->
                  <template #dragHandle>
                    <v-icon class="drag-handle" style="cursor: move;">
                      mdi-drag
                    </v-icon>
                  </template>
                  <!-- Slot para el selector de player -->
                  <template #playerList>
                    <v-select
                      :id="'list'+index"
                      v-model="player.name"
                      :items="players"
                      :item-text="episode.id > 741 ? 'name' : 'short_name'"
                      label="Player Select"
                      hide-details
                      solo
                      @change="calculatePlayerUrl(episode.id, index)"
                    />
                  </template>
                  <!-- Slot para el campo de código -->
                  <template #playerCode>
                    <v-text-field
                      :id="'code'+index"
                      v-model="player.code"
                      label="Player Code"
                      hide-details
                      solo
                      @input="calculatePlayerUrl(episode.id, index)"
                    />
                  </template>
                  <!-- Slot para el botón de borrar -->
                  <template #playerDeleteItem>
                    <v-btn @click="removePlayerSlot(index)">
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </template>
                </TemplatePlayerInput>
              </div>
            </draggable>
            <v-btn class="mr-4 primary" large @click="addPlayerSlot">
              Add Player
            </v-btn>
          </v-container>
        </v-card>
        <v-card elevation>
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
            <v-btn class="mr-4 primary" large @click="addDownloadSlot">
              Add Download
            </v-btn>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'EditEpisode',
  components: { draggable },
  data: () => ({
    currentCounter: 0,
    episode: null,
    serie: null,
    languageList: null,
    hasCustomScreenshot: false,
    customScreenshot: [],
    screenshot: '',
    screenshotPreview: '',
    CDN: process.env.CDN_URI,
    errorMessage: '',
    error: false
  }),
  computed: {
    players () {
      return this.$store.state.players.players
    }
  },
  async mounted () {
    await this.getPlayers()
    await this.getEpisode()
  },
  methods: {
    async getEpisode () {
      await this.$store.dispatch('episodes/getEpisode', {
        episodeId: this.$route.params.episode,
        token: this.$store.state.auth.token,
        populate: [
          'serie',
          'serie.language',
          'image'
        ]
      }).then((episode) => {
        episode.data.players = JSON.parse(episode.data.players)
        episode.data.downloads = JSON.parse(episode.data.downloads)
        this.episode = episode.data
      })
    },
    async getPlayers () {
      await this.$store.dispatch('players/getPlayers', {
        token: this.$store.state.auth.token
      })
    },
    editEpisode () {
      if (this.hasCustomScreenshot && this.customScreenshot.length > 0) {
        this.uploadImageToStrapi(this.customScreenshot[0], this.customScreenshot[1], 'image/png', this.episode.id)
      } else {
        this.error = true
        this.errorMessage = 'No image selected'
        return
      }
      const players = JSON.stringify(this.episode.players)
      const downloads = JSON.stringify(this.episode.downloads)
      this.$store.dispatch('episodes/editEpisode', {
        episode: { ...this.episode, players, downloads },
        token: this.$store.state.auth.token
      })
    },
    screenshotSelected () {
      this.customScreenshot = []
      this.customScreenshot.push(this.$refs.screenshot.$refs.input.files[0])
      this.customScreenshot.push(this.episode.serie.title)
      this.customScreenshot.push(this.episode_number)
      this.screenshotPreview = URL.createObjectURL(this.$refs.screenshot.$refs.input.files[0])
    },
    async uploadImageToStrapi (imageBlob, imageName, imageType, episodeId) {
      const formData = new FormData()
      formData.append('files', imageBlob, `${imageName}_${imageType}`)
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.$store.state.auth.token}`
        },
        body: formData
      }).then((input) => {
        if (input.status === 200) {
          Promise.resolve(input.json())
            .then((strapiRes) => {
              this.createImageComponent(strapiRes[0], episodeId)
            })
        } else {
          throw new Error('Upload failed')
        }
      }).catch((error) => {
        console.error(error)
      })
    },
    async createImageComponent (image, episodeId) {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}images`, {
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
            episodes: [episodeId]
          }
        })
      })
    },
    detectNewImage () {
      this.screenshotPreview = ''
    },
    addPlayerSlot () {
      this.episode.players.push({
        name: '',
        code: ''
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
    calculatePlayerUrl (episodeId, index) {
      const player = this.episode.players[index]
      let playerUrl
      if (episodeId > 741) {
        playerUrl = this.players.find(p => p.name === player.name).player_code
      } else {
        playerUrl = this.players.find(p => p.short_name === player.name).player_code
      }
      playerUrl = playerUrl.replace('codigo', player.code)
      this.episode.players[index].url = playerUrl
    }
  }
}
</script>

<style>
.drag-handle {
  margin-right: 8px;
}
</style>

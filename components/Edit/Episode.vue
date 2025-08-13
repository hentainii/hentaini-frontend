<template>
  <v-card class="glass-card pa-6 ma-4" elevation="10">
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
        <v-col cols="12" md="6">
          <v-card-title class="headline font-weight-bold mb-4">
            <v-icon left color="primary">
              mdi-pencil
            </v-icon>
            Edit Episode {{ episode.episode_number }} for: {{ episode.serie.title }}
          </v-card-title>
          <v-form>
            <v-text-field
              v-model="episode.serie.id"
              disabled
              label="Episode From"
              readonly
              required
              prepend-inner-icon="mdi-identifier"
              class="mb-3"
            />
            <v-text-field
              v-model.number="episode.episode_number"
              label="Episode Number"
              type="number"
              required
              prepend-inner-icon="mdi-numeric"
              class="mb-3"
            />
            <v-switch
              v-model="episode.visible"
              label="Is Visible?"
              inset
              color="primary"
              class="mb-3"
            />
            <v-switch
              v-model="episode.isNew"
              label="Is Premiere?"
              inset
              color="deep-purple accent-4"
              class="mb-3"
            />
            <v-switch
              v-model="hasCustomScreenshot"
              label="Change Custom Image?"
              prepend-icon="mdi-image"
              class="mb-3"
              @change="detectNewImage"
            />
            <v-file-input
              v-if="hasCustomScreenshot"
              ref="screenshot"
              accept="image/*"
              label="Select a Custom Image"
              prepend-icon="mdi-image"
              @change="screenshotSelected"
            />
            <v-btn
              class="mt-4 primary rounded-xl"
              large
              block
              @click="editEpisode"
            >
              <v-icon left>
                mdi-content-save
              </v-icon>
              Save Changes
            </v-btn>
          </v-form>
          <v-container v-if="!hasCustomScreenshot">
            <v-row>
              <h2>Current Screenshot Image</h2>
            </v-row>
            <v-row v-if="episode.image">
              <v-img
                :src="`${$config.SCREENSHOT_ENDPOINT}${episode.image.path}`"
                class="rounded-xl"
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
                class="rounded-xl"
              />
            </v-row>
          </v-container>
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
                        :id="'list'+index"
                        v-model="player.name"
                        :items="players"
                        :item-text="episode.id > 741 ? 'name' : 'short_name'"
                        label="Player Select"
                        prepend-inner-icon="mdi-play-circle"
                        hide-details
                        solo
                        @change="calculatePlayerUrl(episode.id, index)"
                      />
                    </template>
                    <template #playerCode>
                      <v-text-field
                        :id="'code'+index"
                        v-model="player.code"
                        label="Player Code"
                        prepend-inner-icon="mdi-code-tags"
                        hide-details
                        solo
                        @input="calculatePlayerUrl(episode.id, index)"
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
              <v-btn class="mr-4 primary rounded-xl mt-2" large @click="addDownloadSlot">
                <v-icon left>
                  mdi-plus
                </v-icon>
                Add Download
              </v-btn>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
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
    async editEpisode () {
      if (this.hasCustomScreenshot && this.customScreenshot.length > 0) {
        await this.uploadImageToStrapi(this.customScreenshot[0], this.customScreenshot[1], 'screenshot', this.episode.id)
      }
      const players = JSON.stringify(this.episode.players)
      const downloads = JSON.stringify(this.episode.downloads)
      await this.$store.dispatch('episodes/editEpisode', {
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
          console.log(input)
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
      playerUrl = playerUrl.replaceAll('codigo', player.code)
      this.episode.players[index].url = playerUrl
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

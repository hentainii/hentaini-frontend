<template>
  <v-container v-if="episode">
    <v-row>
      <v-col cols="6">
        <v-card
          elevation
        >
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
              v-model="episode.hasCustomScreenshot"
              label="Change Custom Image?"
              prepend-icon="mdi-image"
              @change="detectNewImage"
            />
            <v-file-input
              v-if="episode.hasCustomScreenshot"
              ref="screenshot"
              accept="image/*"
              label="Select a Custom Image"
              @change="screenshotSelected"
            />
            <v-btn
              class="mr-4 blue darken-4"
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
            <v-row>
              <v-img
                :src="`${$config.SCREENSHOT_ENDPOINT}${episode.image.path}`"
              />
            </v-row>
          </v-container>
          <v-container v-if="hasCustomScreenshot">
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
              />
              <v-btn
                slot="playerDeleteItem"
                @click="removePlayerSlot(index)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </TemplatePlayerInput>
            <v-btn class="mr-4 blue darken-4" large @click="addPlayerSlot">
              Add Player
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
            <v-btn class="mr-4 blue darken-4" large @click="addDownloadSlot">
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
  name: 'EditEpisode',
  data: () => ({
    currentCounter: 0,
    episode: null,
    serie: null,
    languageList: null,
    hasCustomScreenshot: false,
    customScreenshot: [],
    screenshot: '',
    screenshotPreview: '',
    CDN: process.env.CDN_URI
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
      this.episode.players = JSON.stringify(this.episode.players)
      this.episode.downloads = JSON.stringify(this.episode.downloads)
      this.$store.dispatch('episodes/editEpisode', {
        episode: this.episode,
        token: this.$store.state.auth.token
      })
    },
    screenshotSelected () {
      this.customScreenshot = []
      this.customScreenshot.push(this.$refs.screenshot.$refs.input.files[0])
      this.customScreenshot.push(this.serie_title)
      this.customScreenshot.push(this.episode_number)
      this.screenshotPreview = URL.createObjectURL(this.$refs.screenshot.$refs.input.files[0])
    },
    detectNewImage () {
      if (this.hasCustomScreenshot) {
        this.customScreenshot = []
      } else {
        this.customScreenshot = []
      }
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
    }
  }
}
</script>

<style>

</style>
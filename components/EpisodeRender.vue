<template>
  <v-container v-if="episode">
    <v-row>
      <v-col cols="12" xl="8" lg="6" md="12" sm="12">
        <v-container>
          <v-row class="d-none d-md-flex d-lg-flex d-xl-flex">
            <v-col style="padding-top:0">
              <v-breadcrumbs :items="breadcrumb" divider="•" class="pl-0 pb-0" />
            </v-col>
          </v-row>
          <v-row
            class="mb-3"
          >
            <v-col
              cols="12"
              lg="10"
              md="9"
              sm="8"
              xs="12"
              class="d-flex"
            >
              <h1 class="align-self-center text-h6 text-md-h5 text-lg-h5 font-weight-black">
                {{ episode.serie.title }} {{ $t('episode.episode_number') }} {{ episode.episode_number }}
              </h1>
            </v-col>
            <v-col
              cols="12"
              lg="2"
              md="3"
              sm="4"
              sx="12"
            >
              <v-btn-toggle
                rounded
                class="float-right"
              >
                <v-btn
                  v-if="episode.serie.episodes[0].episode_number !== episode.episode_number"
                  :to="`/h/${episode.serie.h_id}/${episode.episode_number - 1}`"
                >
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <v-btn
                  :to="`/h/${episode.serie.h_id}`"
                >
                  <v-icon>mdi-view-list</v-icon>
                </v-btn>
                <v-btn
                  v-if="episode.serie.episodes.slice(-1)[0].episode_number !== episode.episode_number"
                  :to="`/h/${episode.serie.h_id}/${episode.episode_number + 1}`"
                >
                  <v-icon>mdi-arrow-right</v-icon>
                </v-btn>
              </v-btn-toggle>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <VideoElement :src="currentUrl" />
              <v-sheet
                class="mx-auto transparent"
                max-width="100%"
              >
                <v-slide-group
                  show-arrows
                  center-active
                  mandatory
                  class="py-2"
                >
                  <v-slide-item
                    v-for="player in JSON.parse(episode.players)"
                    :key="player.name"
                    v-slot:="{ active, toggle }"
                  >
                    <v-btn
                      class="mx-2"
                      :input-value="active"
                      active-class="primary white--text"
                      depressed
                      rounded
                      @click="toggle"
                      @focus="changeCurrentUrl(player.url)"
                    >
                      {{ player.name }}
                    </v-btn>
                  </v-slide-item>
                </v-slide-group>
              </v-sheet>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-dialog
                v-model="modalDownload"
                width="900"
              >
                <template #activator="{ on, attrs }">
                  <v-btn
                    color="primary"
                    class="mr-2"
                    dark
                    elevation="0"
                    rounded
                    v-bind="attrs"
                    v-on="on"
                    @click="genDownloadName"
                  >
                    <v-icon class="mr-2">
                      mdi-download
                    </v-icon>
                    {{ $t('episode.download_text') }}
                  </v-btn>
                </template>

                <v-card>
                  <v-card-title
                    class="headline primary"
                    primary-title
                  >
                    Download Episode {{ episode.episode_number }}
                  </v-card-title>

                  <v-card-text class="d-flex justify-center mt-4">
                    <v-btn
                      v-for="link in downloadsName"
                      :key="link.name"
                      :href="link.url.url"
                      color="primary mr-2"
                      class="p-3"
                    >
                      {{ link.name }}
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-dialog>
              <v-btn
                color="deep-purple accent-1"
                rounded
                outlined
              >
                <v-icon left>
                  mdi-heart
                </v-icon>
                {{ $t('episode.add_favorite') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-col>
      <v-col cols="12" xl="4" lg="6" md="12" sm="12">
        <v-container>
          <v-row>
            <v-card
              style="z-index:1000;position:relative;"
              class="mx-auto black rounded-xl elevation-0"
              width="100%"
              elevation="0"
              tile
            >
              <!-- <a href="https://tm-offers.gamingadult.com/?offer=47&uid=d1c53b21-f8cb-414d-a456-2f0643c82204">
                <v-img
                  height="auto"
                  class="mb-4"
                  src="/img/animation1.gif"
                />
              </a> -->
              <v-card-text>
                <div>{{ episode.serie.synopsis }}</div>
              </v-card-text>
              <v-divider class="mx-4" />
              <v-card-text>
                <v-chip-group
                  active-class="primary"
                  column
                >
                  <v-chip
                    v-for="genre in JSON.parse(episode.serie.genres)"
                    :key="genre.text ? genre.text : genre"
                    :href="`/explore?genre=${genre.url}`"
                    class="rounded-lg grey darken-4"
                  >
                    {{ genre.text ? genre.text : genre.name }}
                  </v-chip>
                </v-chip-group>
              </v-card-text>
              <v-card-actions class="px-2 ml-2">
                {{ $t('episode.show_episodes') }}
                <v-btn
                  icon
                  @click="show = !show"
                >
                  <v-icon>{{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </v-btn>
              </v-card-actions>
              <v-expand-transition>
                <div v-show="show">
                  <v-divider />
                  <v-list nav>
                    <v-list-item-group color="primary">
                      <v-list-item
                        v-for="episode_item in episode.serie.episodes"
                        :key="episode_item.episode_number"
                      >
                        <v-list-item-content>
                          <nuxt-link :to="`/h/${episode.serie.h_id}/${episode_item.episode_number}`" class="d-flex">
                            <v-list-item-title v-text="episode.serie.title + ' episode ' + episode_item.episode_number" />
                          </nuxt-link>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list-item-group>
                  </v-list>
                </div>
              </v-expand-transition>
              <!-- <a href="https://tm-offers.gamingadult.com/?offer=47&uid=d1c53b21-f8cb-414d-a456-2f0643c82204">
                <v-img
                  height="auto"
                  class="mb-4"
                  src="https://tm-banners.gamingadult.com/5bdc222a9159a.gif"
                />
              </a> -->
            </v-card>
          </v-row>
          <v-divider />
          <v-row class="mt-5">
            <Comments />
          </v-row>
        </v-container>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

import parse from 'url-parse'
import VideoElement from './VideoElement'
import Comments from './Layout/Comments'
export default {
  components: {
    VideoElement,
    Comments
  },
  data () {
    return {
      CDN: process.env.CDN_URI,
      episode: null,
      downloadsName: [],
      areDownloadLinksGenerated: false,
      currentUrl: '',
      nextEpisodeUrl: '',
      episodeCount: [],
      breadcrumb: [
        {
          text: 'Hentaini',
          disabled: false,
          to: '/'
        },
        {
          text: 'Serie',
          to: '/',
          disabled: false
        },
        {
          text: 'Episode',
          disabled: true
        }
      ],
      modalDownload: false,
      rating: 0,
      show: false,
      user_id: ''
    }
  },
  async mounted () {
    await this.getEpisode()
    this.genCurrentUrl()
    this.genBreadcrumb()
    this.setUserId()
  },
  methods: {
    async getEpisode () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          serie: {
            h_id: {
              $eq: this.$route.params.serie
            }
          },
          episode_number: {
            $eq: this.$route.params.episode
          }
        },
        populate: [
          'serie',
          'serie.episodes',
          'serie.status'
        ],
        sort: ['createdAt:desc']
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`)
        .then(res => res.json())
        .then((episode) => {
          this.episode = episode.data[0]
        })
    },
    changeCurrentUrl (currentUrl) {
      this.currentUrl = currentUrl
    },
    genCurrentUrl () {
      if (this.episode.players.length > 0) {
        this.currentUrl = this.episode.players[0].url
      }
    },
    genBreadcrumb () {
      this.breadcrumb[2].text = 'Episode ' + this.episode.episode_number
      this.breadcrumb[1].text = this.episode.serie.title
      this.breadcrumb[1].href = `/h/${this.episode.serie.h_id}`
      this.breadcrumb[1].disabled = false
    },
    genDownloadName () {
      if (!this.areDownloadLinksGenerated) {
        for (let i = 0; i < this.episode.downloads.length; i++) {
          const regex = /([a-z0-9][a-z0-9-]*)?((\.[a-z]{2,6}))$/
          const nameDownload = parse(this.episode.downloads[i].url, true)
          const parsedName = nameDownload.host
          const newName = parsedName.match(regex)
          const newDownloadButtons = {}
          newDownloadButtons.url = this.episode.downloads[i]
          newDownloadButtons.name = newName[1]
          this.downloadsName.push(newDownloadButtons)
          this.areDownloadLinksGenerated = true
        }
      }
    },
    setUserId () {
      if (!this.$store.state.auth) {
        this.user_id = ''
      } else {
        this.user_id = this.$store.state.auth.username
      }
    }
  },
  head () {
    return {
      title: this.episode ? this.episode.serie.title : 'Hentaini',
      meta: this.episode
        ? [
            { hid: 'language', name: 'language', content: 'es' },
            { hid: 'Revisit-After', name: 'Revisit-After', content: '3 days' },
            { hid: 'audience', name: 'audience', content: 'all' },
            { hid: 'rating', name: 'rating', content: 'general' },
            { hid: 'distribution', name: 'distribution', content: 'global' },
            { hid: 'document-type', name: 'document-type', content: 'Public' },
            { hid: 'MSSmartTagsPreventParsing', name: 'MSSmartTagsPreventParsing', content: 'true' },
            { hid: 'robots', name: 'robots', content: 'all' },
            { hid: 'robots', name: 'robots', content: 'all, index, follow' },
            { hid: 'googlebot', name: 'googlebot', content: 'all, index, follow' },
            { hid: 'yahoo-slurp', name: 'yahoo-slurp', content: 'all, index, follow' },
            { hid: 'msnbot', name: 'msnbot', content: 'index, follow' },
            { hid: 'googlebot-image', name: 'googlebot-image', content: 'all' },
            { hid: 'title', name: 'title', content: 'Watch ' + this.episode.serie.title + ' episode ' + this.episode.episode_number + ' free online HD' },
            { hid: 'description', name: 'description', content: 'Watch online ' + this.episode.serie.title + ' in best quality. I mean, its Hentaini, the best place to watch your favourite series' },
            { hid: 'keywords', name: 'keywords', content: 'Watch online hentai, best HD archive of the best of japanese culture for the world, hentaini, ahegao, yuri, yaoi, tentacle, maid, siscon, brocon' },
            { hid: 'og:title', property: 'og:title', content: this.episode.serie.title },
            { hid: 'og:description', property: 'og:description', content: 'Its a Hentai site, what do you expect? a no-girlfriend-depression solution?' },
            { hid: 'og:url', property: 'og:url', content: 'https://hentaini.com' },
            { hid: 'og:image', property: 'og:image', content: 'https://hentaini.com/screenshot/' + this.episode.serie.background_coverUrl },
            { hid: 'author', name: 'author', content: 'hentaini' }
          ]
        : []
    }
  }
}
</script>

<style>

</style>

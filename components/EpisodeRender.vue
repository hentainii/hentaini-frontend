<template>
  <v-container v-if="episode" fluid>
    <v-row>
      <v-col cols="12" xl="8" lg="7" md="12" sm="12">
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
              <h1 class="align-self-center text-h5 text-md-h4 text-lg-h4 font-weight-black">
                {{ serie.title }} {{ $t('episode.episode_number') }} {{ episode.episode_number }}
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
                  v-if="episodeCount[0] !== episode.episode_number"
                  :href="`/h/${episode.serie.data.attributes.h_id}/${episode.episode_number-1}`"
                >
                  <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <v-btn
                  :href="`/h/${episode.serie.data.attributes.h_id}`"
                >
                  <v-icon>mdi-view-list</v-icon>
                </v-btn>
                <v-btn
                  v-if="episodeCount.slice(-1)[0] !== episode.episode_number"
                  :href="`/h/${episode.serie.data.attributes.h_id}/${episode.episode_number+1}`"
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
                class="mx-auto"
                max-width="100%"
              >
                <v-slide-group show-arrows center-active mandatory>
                  <v-slide-item
                    v-for="player in episode.players"
                    :key="player.name"
                    v-slot:="{ active, toggle }"
                  >
                    <v-btn
                      class="mx-2"
                      :input-value="active"
                      active-class="blue darken-4 white--text"
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
                    color="blue darken-4"
                    dark
                    elevation="0"
                    rounded
                    v-bind="attrs"
                    v-on="on"
                    @click="genDownloadName"
                  >
                    {{ $t('episode.download_text') }}
                  </v-btn>
                </template>

                <v-card>
                  <v-card-title
                    class="headline blue darken-2"
                    primary-title
                  >
                    Download Episode {{ episode.episode_number }}
                  </v-card-title>

                  <v-card-text class="d-flex justify-center mt-4">
                    <v-btn
                      v-for="link in downloadsName"
                      :key="link.name"
                      :href="link.url.url"
                      color="blue darken-4 mr-2"
                      class="p-3"
                    >
                      {{ link.name }}
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
          <v-divider class="mt-4" />
          <Comments />
        </v-container>
      </v-col>
      <v-col cols="12" xl="4" lg="5" md="12" sm="12">
        <v-container>
          <v-row>
            <v-card
              class="mx-auto transparent"
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
              <v-img
                height="auto"
                :src="'https://picsum.photos/640/480'"
              />
              <v-card-title>{{ serie.title }}</v-card-title>
              <v-card-text>
                <v-row
                  align="center"
                  class="mx-0"
                >
                  <v-rating
                    v-model="rating"
                    length="5"
                    empty-icon="mdi-heart-outline"
                    full-icon="mdi-heart"
                    half-icon="mdi-heart-half-full"
                    half-increments
                    hover
                    medium
                    :dense="false"
                    color="blue darken-3"
                    background-color="blue"
                  />
                  <span class="font-weight-bold">
                    {{ rating }}
                  </span>
                </v-row>
                <div class="my-4 subtitle-1">
                  <v-btn
                    class=""
                    color="primary"
                    outlined
                    rounded
                  >
                    {{ status.name }}
                    <v-icon right>
                      mdi-youtube-tv
                    </v-icon>
                  </v-btn>
                  <v-btn
                    color="pink darken-1"
                    rounded
                    outlined
                  >
                    <v-icon left>
                      mdi-heart
                    </v-icon>
                    {{ $t('episode.add_favorite') }}
                  </v-btn>
                </div>
                <div>{{ episode.serie.data.attributes.synopsis }}</div>
              </v-card-text>
              <v-divider class="mx-4" />
              <v-card-text>
                <v-chip-group
                  active-class="blue darken-3"
                  column
                >
                  <v-chip
                    v-for="genre in genres"
                    :key="genre.text"
                    :href="`/explore?genre=${genre.url}`"
                  >
                    {{ genre.text }}
                  </v-chip>
                </v-chip-group>
              </v-card-text>
              <v-card-actions>
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
                  <v-list shaped>
                    <v-subheader>Episodes for {{ serie.title }}</v-subheader>
                    <v-list-item-group color="primary">
                      <v-list-item
                        v-for="episode_item in episodes"
                        :key="episode_item.attributes.episode_number"
                      >
                        <v-list-item-icon>
                          <span background-color="blue darken-4">{{ episode_item.attributes.episode_number }}</span>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <a :href="`/h/${serie.h_id}/${episode_item.attributes.episode_number}`"><v-list-item-title v-text="serie.title" /></a>
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
      episodes: null,
      serie: null,
      status: null,
      genres: null,
      downloadsName: [],
      areDownloadLinksGenerated: false,
      currentUrl: '',
      nextEpisodeUrl: '',
      episodeCount: [],
      breadcrumb: [
        {
          text: 'Hentaini',
          disabled: false,
          href: '/'
        },
        {
          text: 'Serie',
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
      await fetch(`${process.env.API_STRAPI_ENDPOINT}episodes?${query}`)
        .then(res => res.json())
        .then((input) => {
          const res = input.data.map((episode) => {
            episode.attributes.downloads = JSON.parse(episode.attributes.downloads)
            episode.attributes.players = JSON.parse(episode.attributes.players)
            episode.attributes.serie.data.attributes.genres = JSON.parse(episode.attributes.serie.data.attributes.genres)
            return {
              ...episode
            }
          })
          const resEpisode = res[0].attributes
          const resSerie = res[0].attributes.serie.data.attributes
          const resStatus = res[0].attributes.serie.data.attributes.status.data.attributes
          const resGenres = res[0].attributes.serie.data.attributes.genres
          const resEpisodes = res[0].attributes.serie.data.attributes.episodes.data
          this.episode = resEpisode
          this.serie = resSerie
          this.status = resStatus
          this.genres = resGenres
          this.episodes = resEpisodes
          for (let i = 0; i < resEpisode.serie.data.attributes.episodes.data.length; i++) {
            this.episodeCount.push(resEpisode.serie.data.attributes.episodes.data[i].attributes.episode_number)
          }
          this.nextEpisodeUrl = resEpisode.episode_number
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
      this.breadcrumb[1].text = this.episode.serie.data.attributes.title
      this.breadcrumb[1].href = `/h/${this.episode.serie.data.attributes.h_id}`
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
  }
  // head () {
  //   return {
  //     title: this.EpisodeByUrlName.serie.title,
  //     meta: [
  //       { hid: 'language', name: 'language', content: 'es' },
  //       { hid: 'Revisit-After', name: 'Revisit-After', content: '3 days' },
  //       { hid: 'audience', name: 'audience', content: 'all' },
  //       { hid: 'rating', name: 'rating', content: 'general' },
  //       { hid: 'distribution', name: 'distribution', content: 'global' },
  //       { hid: 'document-type', name: 'document-type', content: 'Public' },
  //       { hid: 'MSSmartTagsPreventParsing', name: 'MSSmartTagsPreventParsing', content: 'true' },
  //       { hid: 'robots', name: 'robots', content: 'all' },
  //       { hid: 'robots', name: 'robots', content: 'all, index, follow' },
  //       { hid: 'googlebot', name: 'googlebot', content: 'all, index, follow' },
  //       { hid: 'yahoo-slurp', name: 'yahoo-slurp', content: 'all, index, follow' },
  //       { hid: 'msnbot', name: 'msnbot', content: 'index, follow' },
  //       { hid: 'googlebot-image', name: 'googlebot-image', content: 'all' },
  //       { hid: 'title', name: 'title', content: 'Watch ' + this.EpisodeByUrlName.serie.title + ' episode ' + this.EpisodeByUrlName.episode_number + ' free online HD' },
  //       { hid: 'description', name: 'description', content: 'Watch online ' + this.EpisodeByUrlName.serie.title + ' in best quality. I mean, its Hentaini, the best place to watch your favourite series' },
  //       { hid: 'keywords', name: 'keywords', content: 'Watch online hentai, best HD archive of the best of japanese culture for the world, hentaini, ahegao, yuri, yaoi, tentacle, maid, siscon, brocon' },
  //       { hid: 'og:title', property: 'og:title', content: this.EpisodeByUrlName.serie.title },
  //       { hid: 'og:description', property: 'og:description', content: 'Its a Hentai site, what do you expect? a no-girlfriend-depression solution?' },
  //       { hid: 'og:url', property: 'og:url', content: 'https://hentaini.com' },
  //       { hid: 'og:image', property: 'og:image', content: 'https://hentaini.com/screenshot/' + this.EpisodeByUrlName.serie.background_coverUrl },
  //       { hid: 'author', name: 'author', content: 'hentaini' }
  //     ]
  //   }
  // }
}
</script>

<style>

</style>

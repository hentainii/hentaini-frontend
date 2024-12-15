<template>
  <div v-if="serie">
    <v-container fluid class="m0 pa-0">
      <v-img
        :src="`${$config.SCREENSHOT_ENDPOINT}${serie.images.find(image => image.image_type.name === 'screenshot').path}`"
        alt=""
        aspect-ratio="16/9"
        style="position: absolute; top: 0; left: 0; width: 100%; height:100vh;filter:blur(10px);"
        class="background"
      />
    </v-container>
    <v-container style="position:relative;">
      <v-row style="    position: relative;z-index: 10;">
        <v-col>
          <v-breadcrumbs :items="breadcrumb" divider="•" class="pl-0 pb-0" />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          cols="12"
          sm="4"
          md="4"
          lg="2"
        >
          <v-row>
            <v-col cols="12">
              <v-img
                :src="`${$config.COVER_ENDPOINT}${serie.images.find(image => image.image_type.name === 'cover').path}`"
                style="max-height:415px;border-radius:10px;"
              />
            </v-col>
          </v-row>
          <v-row v-if="$store.state.auth">
            <v-col cols="12">
              <v-btn
                block
                color="red accent-1"
                class="elevation-0 rounded-xl"
                :outlined="!serieIsPresentInFavorites"
                @click="serieIsPresentInFavorites ? removeFavorite(serie.id) : setFavorite(serie.id)"
              >
                <v-icon class="mr-2">
                  mdi-heart
                </v-icon>
                {{ serieIsPresentInFavorites ? $t('favorites.remove') : $t('favorites.add') }}
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col cols="12">
              <v-btn
                block
                color="'red accent-1'"
                class="elevation-0 rounded-xl"
                :to="localePath('/login')"
                v-on="on"
              >
                <v-icon class="mr-2">
                  mdi-heart
                </v-icon>
                {{ $t('serie.loginToSave') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
        <v-col
          cols="12"
          sm="8"
          md="8"
          lg="10"
        >
          <v-row class="px-4 py-5">
            <h1>
              {{ serie.title }}
            </h1>
          </v-row>
          <v-row v-if="serie.title_english" class="px-4 py-5">
            English: {{ serie.title_english }}
          </v-row>
          <v-row class="px-4 pb-2">
            <v-alert
              dense
              text
              :color="serie.status.name === 'Airing' ? 'success' : 'red accent-2'"
              :icon="serie.status.name === 'Airing' ? 'mdi-play' : 'mdi-information'"
            >
              <strong>{{ serie.status.name }}</strong>
            </v-alert>
          </v-row>
          <v-row class="px-4">
            <v-alert
              border="left"
              colored-border
              text
              color="primary"
            >
              <strong>{{ $t('serie.synopsis') }}</strong> {{ serie.synopsis }}
            </v-alert>
          </v-row>
          <v-row v-if="serie.genreList.length > 0" class="px-4">
            <span class="mt-2">{{ $t('serie.genres') }}</span>
            <v-chip
              v-for="(genre, index) in serie.genreList"
              :key="index"
              :to="localePath(`/g/${genre.url}`)"
              color="primary ml-2 mt-2"
              text-color="white"
              small
            >
              <v-icon left>
                mdi-play
              </v-icon>
              {{ genre.name }}
            </v-chip>
          </v-row>
          <v-row v-else class="px-4">
            <span class="mt-2">{{ $t('serie.genres') }}</span>
            <v-chip
              v-for="(genre, index) in JSON.parse(serie.genres)"
              :key="index"
              :to="localePath(`/g/${genre.url}`)"
              color="primary ml-2 mt-2"
              text-color="white"
              small
            >
              <v-icon left>
                mdi-play
              </v-icon>
              {{ genre.text ? genre.text : genre.name }}
            </v-chip>
          </v-row>
          <v-row v-if="serie.episodes.length > 0" class="mt-10 mb-5">
            <SerieEpisodeList :serie="serie" :episodes="serie.episodes" />
          </v-row>
          <v-row v-else class="mt-10 mb-5 px-4">
            <h4>{{ $t('serie.noEpísodes') }}</h4>
          </v-row>
        </v-col>
      </v-row>
      <v-row class="justify-center">
        <div>
          <v-img
            width="400px"
            :src="`/img/ads2/${rand}.gif`"
          />
        </div>
      </v-row>
      <v-row>
        <ExploreCluster />
      </v-row>
    </v-container>
  </div>
</template>
<script>
export default {
  data () {
    return {
      serie: null,
      rand: 1,
      head: 'Loading you serie...',
      favorites: [],
      breadcrumb: [
        {
          text: 'Home',
          disabled: false,
          href: '/'
        },
        {
          text: 'Series',
          disabled: true
        }
      ]
    }
  },
  head () {
    return this.head
  },
  computed: {
    serieIsPresentInFavorites () {
      return this.favorites.some(favorite => favorite.url === this.serie.url)
    }
  },
  async mounted () {
    await this.getSerie()
    this.genRandNumber()
  },
  methods: {
    async getSerie () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          url: this.$route.params.serie
        },
        populate: [
          'images',
          'images.image_type',
          'status',
          'episodes',
          'genreList'
        ]
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`)
        .then(res => res.json())
        .then((serie) => {
          this.serie = serie.data[0]
          this.getFavorites()
          this.breadcrumb[1].text = serie.data[0].title
          this.head = {
            title: this.serie.title,
            meta: [
              { hid: 'charset', charset: 'utf-8' },
              { hid: 'viewport', name: 'viewport', content: 'width=device-width, initial-scale=1' },
              { hid: 'description', name: 'description', content: 'Watch online ' + this.serie.title + ' in best quality.' },
              { hid: 'og:title', property: 'og:title', content: 'Watch ' + this.serie.title + ' free online HD' },
              { hid: 'og:description', property: 'og:description', content: 'Watch online ' + this.serie.title + ' in best quality' },
              { hid: 'og:image', property: 'og:image', content: `${this.$config.SCREENSHOT_ENDPOINT}${this.serie.images.find(image => image.image_type.name === 'screenshot').path}` },
              { hid: 'og:image:secure_url', property: 'og:image:secure_url', content: `${this.$config.SCREENSHOT_ENDPOINT}${this.serie.images.find(image => image.image_type.name === 'screenshot').path}` },
              { hid: 'og:image:alt', property: 'og:image:alt', content: this.serie.title },
              { hid: 'og:image:type', property: 'og:image:type', content: 'image/jpeg' },
              { hid: 'og:image:width', property: 'og:image:width', content: '1200' },
              { hid: 'og:image:height', property: 'og:image:height', content: '630' },
              { hid: 'og:url', property: 'og:url', content: `https://hentaini.com${this.$route.path}` },
              { hid: 'og:type', property: 'og:type', content: 'video.tv_show' },
              { hid: 'og:locale', property: 'og:locale', content: 'en_US' },
              { hid: 'og:site_name', property: 'og:site_name', content: 'Hentaini' },
              { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
              { hid: 'twitter:site', name: 'twitter:site', content: '@hentaini' },
              { hid: 'twitter:creator', name: 'twitter:creator', content: '@hentaini' },
              { hid: 'twitter:title', name: 'twitter:title', content: 'Watch ' + this.serie.title + ' free online HD' },
              { hid: 'twitter:description', name: 'twitter:description', content: 'Watch online ' + this.serie.title + ' in best quality.' },
              { hid: 'twitter:image', name: 'twitter:image', content: `${this.$config.SCREENSHOT_ENDPOINT}${this.serie.images.find(image => image.image_type.name === 'screenshot').path}` },
              { hid: 'twitter:image:alt', name: 'twitter:image:alt', content: this.serie.title },
              { hid: 'language', name: 'language', content: 'en' },
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
              { hid: 'title', name: 'title', content: 'Watch ' + this.serie.title + ' free online HD' },
              { hid: 'description', name: 'description', content: 'Watch online ' + this.serie.title + ' in best quality. I mean, its Hentaini, the best place to watch your favourite series' },
              { hid: 'keywords', name: 'keywords', content: 'Watch online hentai, best HD archive of the best of japanese culture for the world, hentaini, ahegao, yuri, yaoi, tentacle, maid, siscon, brocon' },
              { hid: 'og:url', property: 'og:url', content: `https://hentaini.com${this.$route.path}` },
              { hid: 'og:image', property: 'og:image', content: `${this.$config.SCREENSHOT_ENDPOINT}${this.serie.images.find(image => image.image_type.name === 'screenshot').path}` },
              { hid: 'author', name: 'author', content: 'hentaini' }
            ]
          }
        })
    },
    async getFavorites () {
      this.favorites = await this.$store.dispatch('favorite/getFavorites', {
        user: this.$store.state.auth,
        serie: this.serie,
        token: this.$store.state.auth.token
      })
    },
    async setFavorite () {
      const res = await this.$store.dispatch('favorite/setNewFavorite', {
        user: this.$store.state.auth,
        serie: this.serie,
        token: this.$store.state.auth.token
      })
      this.favorites.push({
        id: res.data.id,
        url: this.serie.url
      })
    },
    removeFavorite () {
      this.$store.dispatch('favorite/removeFavorite', {
        user: this.$store.state.auth,
        favorite: this.favorites.filter(favorite => favorite.url === this.serie.url)[0],
        token: this.$store.state.auth.token
      })
      this.favorites = this.favorites.filter(favorite => favorite.url !== this.serie.url)
    },
    genRandNumber () {
      this.rand = Math.floor(Math.random() * 6)
    }
  }
}
</script>
<style>
  .background::after {
    background: linear-gradient(to bottom,rgb(8 15 40 / 38%) 0%,rgb(18 18 18) 100%);
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    height: 100%;
    pointer-events: none;
  }
</style>

<template>
  <div v-if="serie">
    <v-container fluid class="m0 pa-0">
      <v-img
        :src="`${$config.SCREENSHOT_ENDPOINT}${serie.images.screenshot.path}`"
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
                :src="`${$config.COVER_ENDPOINT}${serie.images.cover.path}`"
                style="max-height:415px;border-radius:10px;"
              />
            </v-col>
          </v-row>
          <v-row v-if="$store.state.auth">
            <v-col cols="12">
              <v-btn
                block
                color="red accent-2"
                elevation="0"
                rounded
              >
                <v-icon>mdi-heart</v-icon>
                Fav
              </v-btn>
              <v-btn
                block
                outlined
                class="mt-4"
                elevation="0"
                rounded
              >
                <v-icon>mdi-clock</v-icon>
                Watch later
              </v-btn>
            </v-col>
          </v-row>
          <v-row v-else>
            <v-col cols="12">
              <v-btn
                block
                color="blue darken-2"
                href="/login"
              >
                <v-icon>mdi-account</v-icon>
                Login to save
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
            <h1 style="border-bottom: 2px solid blue;">
              {{ serie.title }}
            </h1>
          </v-row>
          <v-row v-if="serie.title_english" class="px-4 py-5">
            {{ serie.title_english }}
          </v-row>
          <v-row class="px-4 pb-2">
            <v-alert
              dense
              text
              :color="status === 'Airing' ? 'success' : 'red accent-2'"
              :icon="status === 'Airing' ? 'mdi-play' : 'mdi-information'"
            >
              <strong>{{ status }}</strong>
            </v-alert>
          </v-row>
          <v-row class="px-4">
            <v-alert
              border="left"
              colored-border
              text
              color="blue accent-4"
            >
              <strong>{{ $t('serie.synopsis') }}</strong> {{ serie.synopsis }}
            </v-alert>
          </v-row>
          <v-row class="px-4">
            <span class="mt-2">{{ $t('serie.genres') }}</span>
            <v-chip
              v-for="(genre, index) in genres"
              :key="index"
              :href="`/g/${genre.url}`"
              color="blue darken-3 ml-2 mt-2"
              text-color="white"
              small
            >
              <v-icon left>
                mdi-play
              </v-icon>
              {{ genre.text }}
            </v-chip>
          </v-row>
          <v-row class="mt-10 mb-5">
            <SerieEpisodeList :serie="serie" :episodes="episodes" />
          </v-row>
        </v-col>
      </v-row>
      <v-row>
        <ExploreCluster />
      </v-row>
      <v-row class="mt-10">
        <v-col>
          <LayoutComments />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
export default {
  data () {
    return {
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
      ],
      serie: null,
      episodes: null,
      status: null,
      genres: null,
      cover: null,
      screenshot: null
    }
  },
  async mounted () {
    await this.getSerie()
  },
  methods: {
    async getSerie () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          h_id: {
            $eq: this.$route.params.serie
          }
        },
        populate: [
          'images',
          'images.image_type',
          'status',
          'episodes'
        ]
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${process.env.API_STRAPI_ENDPOINT}series?${query}`)
        .then(res => res.json())
        .then((series) => {
          const resSerie = series.data.map((serie) => {
            serie.attributes.genres = JSON.parse(serie.attributes.genres)
            serie.attributes.images.cover = serie.attributes.images.data.filter(image => image.attributes.image_type.data.attributes.name === 'cover')[0].attributes
            serie.attributes.images.screenshot = serie.attributes.images.data.filter(image => image.attributes.image_type.data.attributes.name === 'screenshot')[0].attributes
            return {
              ...serie
            }
          })
          this.serie = resSerie[0].attributes
          this.genres = resSerie[0].attributes.genres
          this.status = resSerie[0].attributes.status.data.attributes.name
          const episodes = resSerie[0].attributes.episodes.data.map((episode) => {
            return {
              ...episode.attributes
            }
          })
          this.episodes = episodes
          this.breadcrumb[1].text = this.serie.title
        })
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

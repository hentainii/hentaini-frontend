<template>
  <v-container>
    <v-row>
      <v-col>
        <h5>
          <a href="/explore">{{ $t('landpage.latest_episodes_little') }}</a>
        </h5>
        <h1>{{ $t('landpage.latest_episodes') }}</h1>
        <h4 class="grey--text text-body-2 darken-3">
          <v-icon class="grey--text darken-3">
            mdi-clock-outline
          </v-icon>
          {{ $t('landpage.updated_text') }} {{ episodes ? $moment(episodes[1].createdAt).fromNow() : null }}
        </h4>
      </v-col>
    </v-row>
    <v-row v-if="episodes">
      <v-col
        v-for="(episode) in episodes"
        :key="episode._id"
        cols="12"
        lg="3"
        md="4"
        sm="6"
        xs="6"
      >
        <EpisodeCard
          :episode="episode._id"
          :title="episode.serie.title"
          :episodeNumber="episode.episode_number"
          :hid="episode.serie.h_id"
          :screenshot="`${$config.SCREENSHOT_ENDPOINT}${episode.image ? episode.image.path : null}`"
          :created="episode.createdAt"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LatestEpisodes',
  data () {
    return {
      episodes: null
    }
  },
  mounted () {
    this.getLatestEpisodes()
    // this.createEpisodeAd()
  },
  methods: {
    async getLatestEpisodes () {
      const qs = require('qs')
      const query = qs.stringify({
        populate: [
          'serie',
          'image',
          'serie.statuses'
        ],
        sort: ['createdAt:desc'],
        pagination: {
          limit: 16
        }
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${process.env.API_STRAPI_ENDPOINT}episodes?${query}`)
        .then(res => res.json())
        .then((episodes) => {
          this.episodes = episodes.data
        })
    }
    // createEpisodeAd () {
    //   const ad = {
    //     _id: 'ad1',
    //     created_at: '2020-07-10T01:25:22.543Z',
    //     episode_number: 1,
    //     screenshot: 'img/animation2.gif',
    //     urlName: 'https://tm-offers.gamingadult.com/?offer=47&uid=d1c53b21-f8cb-414d-a456-2f0643c82204',
    //     serie: {
    //       title: 'Tentacle Fantasy'
    //     },
    //     isAd: true
    //   }
    //   this.episodes.unshift(ad)
    // }
  }
}
</script>

<style>

</style>

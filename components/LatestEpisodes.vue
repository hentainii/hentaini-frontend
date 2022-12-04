<template>
  <v-container>
    <v-row class="justify-center">
      <client-only>
        <UtilsVueScriptComponent script='<script data-cfasync="false" type="text/javascript" src="//platform.bidgear.com/ads.php?domainid=6413&sizeid=2&zoneid=6905"></script>'/>
      </client-only>
    </v-row>
    <v-row>
      <v-col>
        <h5>
          <nuxt-link :to="localePath('/explore')">
            {{ $t('landpage.latest_episodes_little') }}
          </nuxt-link>
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
        cols="6"
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
          :screenshot="episode.isAd ? episode.screenshot : `${$config.SCREENSHOT_ENDPOINT}${episode.image ? episode.image.path : null}`"
          :placeholder="`${$config.SCREENSHOT_ENDPOINT}${episode.image ? episode.image.placeholder : null}`"
          :created="episode.createdAt"
          :isAd="episode.isAd"
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
          limit: 15
        }
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`)
        .then(res => res.json())
        .then((episodes) => {
          this.episodes = episodes.data
          const rn = Math.floor(Math.random() * 2)
          if (rn === 0) {
            this.createEpisodeAd()
          } else {
            this.createEpisodeAd2()
          }
        })
    },
    createEpisodeAd () {
      const ad = {
        _id: 'ad1',
        created_at: `${new Date()}`,
        episode_number: 1,
        screenshot: `img/${Math.floor(Math.random() * 2)}.gif`,
        urlName: 'https://tm-offers.gamingadult.com/?offer=47&uid=d1c53b21-f8cb-414d-a456-2f0643c82204',
        serie: {
          title: 'Tentacle Fantasy'
        },
        isAd: true
      }
      this.episodes.unshift(ad)
    },
    createEpisodeAd2 () {
      const ad = {
        _id: 'ad2',
        created_at: `${new Date()}`,
        episode_number: 1,
        screenshot: `img/psh${Math.floor(Math.random() * 5)}.gif`,
        urlName: 'https://tm-offers.gamingadult.com/?offer=2565&uid=d1c53b21-f8cb-414d-a456-2f0643c82204',
        serie: {
          title: 'Pornstar Harem RPG'
        },
        isAd: true
      }
      this.episodes.unshift(ad)
    }
  }
}
</script>

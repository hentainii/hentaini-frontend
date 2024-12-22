<template>
  <v-container>
    <v-row class="justify-center">
      <client-only>
        <UtilsVueScriptComponent script='<script data-cfasync="false" type="text/javascript" src="//bullionglidingscuttle.com/lv/esnk/2030947/code.js" async class="__clb-2030947"></script>' />
      </client-only>
    </v-row>
    <v-row>
      <v-col>
        <h5>
          <nuxt-link :to="localePath('/explore')">
            {{ $t('landpage.latest_episodes_little') }}
          </nuxt-link>
        </h5>
        <h2>{{ $t('landpage.latest_episodes') }}</h2>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-for="(episode) in episodes"
        :key="episode.id"
        cols="6"
        lg="3"
        md="4"
        sm="6"
        xs="6"
      >
        <article>
          <EpisodeCard
            :episode="episode.id"
            :title="episode.serie.title"
            :episodeNumber="episode.episode_number"
            :hid="episode.serie.h_id"
            :screenshot="`${$config.SCREENSHOT_ENDPOINT}${episode.image.path}`"
            :placeholder="`${$config.SCREENSHOT_ENDPOINT}${episode.image.placeholder ? episode.image.placeholder : episode.image.path}`"
            :created="episode.createdAt"
            :url="episode.serie.url"
            :isAd="episode.isAd"
          />
        </article>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LatestEpisodes',
  data () {
    return {
      episodes: []
    }
  },
  mounted () {
    this.getLatestEpisodes()
  },
  methods: {
    getLatestEpisodes () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          visible: true
        },
        populate: [
          'serie',
          'image',
          'serie.statuses'
        ],
        sort: ['createdAt:desc'],
        pagination: {
          limit: 23
        }
      },
      {
        encodeValuesOnly: true
      })
      fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`)
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
        id: -1,
        created_at: `${new Date()}`,
        episode_number: 1,
        image: {
          placeholder: 'default.png',
          path: `img/${Math.floor(Math.random() * 2)}.gif`
        },
        url: 'https://tm-offers.gamingadult.com/?offer=47&uid=d1c53b21-f8cb-414d-a456-2f0643c82204',
        serie: {
          title: 'Tentacle Fantasy'
        },
        isAd: true
      }
      this.episodes.unshift(ad)
    },
    createEpisodeAd2 () {
      const ad = {
        id: -2,
        created_at: `${new Date()}`,
        episode_number: 1,
        image: {
          placeholder: 'default.png',
          path: `img/psh${Math.floor(Math.random() * 5)}.gif`
        },
        url: 'https://tm-offers.gamingadult.com/?offer=2565&uid=d1c53b21-f8cb-414d-a456-2f0643c82204',
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

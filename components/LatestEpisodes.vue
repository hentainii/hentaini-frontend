<!-- eslint-disable vue/html-self-closing -->
<!-- eslint-disable vue/html-quotes -->
<template>
  <v-container class="latest-episodes-container">
    <misc-latest-episodes-skeleton v-if="loading" />
    <template v-else>
      <v-row class="justify-center">
        <client-only>
          <UtilsVueScriptComponent script='<script async data-cfasync="false" src="https://platform.pubadx.one/pubadx-ad.js" type="text/javascript"></script>' />
        </client-only>
        <client-only>
          <div id="bg-ssp-10357">
          </div>
          <UtilsVueScriptComponent script='<script data-cfasync="false" src="bg.js" type="text/javascript"></script>' />
        </client-only>
      </v-row>

      <div class="section-header">
        <nuxt-link :to="localePath('/explore')" class="section-link">
          <div class="header-content">
            <h2 class="title">
              {{ $t('landpage.latest_episodes') }}
            </h2>
            <span class="subtitle">
              {{ $t('landpage.latest_episodes_little') }}
            </span>
          </div>
        </nuxt-link>
      </div>

      <v-row class="episodes-grid">
        <v-col
          v-for="(episode) in episodes"
          :key="episode.id"
          cols="6"
          xl="3"
          lg="4"
          md="4"
          sm="6"
          xs="6"
          class="episode-item"
        >
          <article>
            <EpisodeCard
              :episode="episode.id"
              :serie="episode.serie.id"
              :title="episode.serie.title"
              :episodeNumber="episode.episode_number"
              :hid="episode.serie.h_id"
              :image="episode.image"
              :created="episode.createdAt"
              :url="episode.serie.url"
              :isAd="episode.isAd"
              :isNew="episode.isNew"
              :censorship="episode.serie.censorship"
              :watchlaters="watchlaters"
              @refresh="refresh"
            />
          </article>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script>
export default {
  name: 'LatestEpisodes',
  props: {
    watchlaters: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      episodes: [],
      loading: true
    }
  },
  mounted () {
    this.getLatestEpisodes()
  },
  methods: {
    refresh () {
      this.getLatestEpisodes()
      this.$emit('refreshwatchlaters')
    },
    getLatestEpisodes () {
      this.loading = true
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
          limit: 24
        }
      },
      {
        encodeValuesOnly: true
      })
      fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`)
        .then(res => res.json())
        .then((episodes) => {
          this.episodes = episodes.data
          this.loading = false
        })
        .catch((error) => {
          console.error('Error loading latest episodes:', error)
          this.loading = false
        })
    }
  }
}
</script>

<style scoped>
.latest-episodes-container {
  position: relative;
  padding-top: 10px;
  padding-bottom: 20px;
}

.section-header {
  margin-bottom: 20px;
  position: relative;
}

.section-link {
  text-decoration: none;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.subtitle {
  font-size: 0.8rem;
  color: #a4a578;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  background: rgba(var(--v-primary-base), 0.15);
  display: inline-block;
  border-radius: 4px;
  margin-bottom: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: #ffffff;
  opacity: 0;
  animation: fadeIn 0.4s 0.1s forwards;
  line-height: 1.1;
}

.animated-bar {
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #FFC107, #6B66FF);
  border-radius: 3px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  opacity: 0;
  animation: expandWidth 0.4s 0.1s forwards;
}

.animated-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

.episodes-grid {
  margin-top: 12px;
}

.episode-item {
  opacity: 0;
  transform: translateY(15px);
  animation: fadeUp 0.3s forwards;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes expandWidth {
  from {
    width: 0;
    opacity: 1;
  }
  to {
    width: 40px;
    opacity: 1;
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Staggered animation for episode items */
.episode-item:nth-child(1) { animation-delay: 0.05s; }
.episode-item:nth-child(2) { animation-delay: 0.08s; }
.episode-item:nth-child(3) { animation-delay: 0.11s; }
.episode-item:nth-child(4) { animation-delay: 0.14s; }
.episode-item:nth-child(5) { animation-delay: 0.17s; }
.episode-item:nth-child(6) { animation-delay: 0.2s; }
.episode-item:nth-child(7) { animation-delay: 0.23s; }
.episode-item:nth-child(8) { animation-delay: 0.26s; }
.episode-item:nth-child(9) { animation-delay: 0.29s; }
.episode-item:nth-child(10) { animation-delay: 0.32s; }
.episode-item:nth-child(11) { animation-delay: 0.35s; }
.episode-item:nth-child(12) { animation-delay: 0.38s; }
</style>

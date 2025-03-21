<template>
  <div class="episode-card">
    <nuxt-link :to="localePath(`/h/${url}/${episodeNumber}`)" :title="`Watch ${title} Episode ${episodeNumber}`">
      <v-hover v-slot="{ hover }">
        <div class="image-container">
          <v-img
            class="episode-image"
            :aspect-ratio="16/9"
            :src="screenshot"
            :lazy-src="placeholder"
          >
            <!-- Badge para "new" -->
            <div v-if="isNew && lessThan7Days(created)" class="new-badge">
              <v-icon class="text-caption mr-1">
                mdi-star
              </v-icon>{{ $t('episode.new_badge') }}
            </div>
            <!-- Badge para "censorship" -->
            <div v-if="!censorship" class="no-censor-badge">
              <v-icon class="text-caption mr-1">
                mdi-eye
              </v-icon>{{ $t('episode.uncensored') }}
            </div>

            <div :class="hover ? 'overlay overlay-hover' : 'overlay'">
              <div class="play-button-container">
                <div class="play-button">
                  <v-icon>mdi-play</v-icon>
                </div>
              </div>
            </div>
          </v-img>
        </div>
      </v-hover>
    </nuxt-link>

    <div class="card-content">
      <div class="card-details">
        <h2 class="episode-title">
          {{ title }}
        </h2>
        <p class="episode-number">
          {{ $t('episode.episode_number') }} {{ episodeNumber }}
        </p>
      </div>

      <v-tooltip left>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            icon
            small
            class="watchlater-btn"
            v-on="on"
            @click="isLogin ? toggleWatchLater(serie) : $router.push('/login')"
          >
            <v-icon :color="isInWatchLater ? 'primary' : ''">
              {{ isInWatchLater ? 'mdi-eye-off-outline' : 'mdi-eye-plus-outline' }}
            </v-icon>
          </v-btn>
        </template>
        <span>{{ isInWatchLater ? $t('watch_later.remove') : $t('watch_later.add') }}</span>
      </v-tooltip>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NiEpisodeCard',
  props: {
    episode: {
      type: Number,
      default: 0
    },
    serie: {
      type: Number,
      default: 0
    },
    watchlaters: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: 'No Title'
    },
    episodeNumber: {
      type: Number,
      default: 0
    },
    hid: {
      type: String,
      default: '0'
    },
    status: {
      type: String,
      default: 'No Status'
    },
    url: {
      type: String,
      default: ''
    },
    screenshot: {
      type: String,
      default: 'default.jpg'
    },
    placeholder: {
      type: String,
      default: 'default_placeholder.jpg'
    },
    created: {
      type: String,
      default: ''
    },
    isAd: {
      type: Boolean,
      default: false
    },
    isNew: {
      type: Boolean,
      default: false
    },
    censorship: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      CDN: process.env.CDN_URI,
      cacheWatchLater: false
    }
  },
  computed: {
    isInWatchLater () {
      return this.watchlaters.some(watchlater => watchlater.serie.id === this.serie && watchlater.episode_number === this.episodeNumber)
    },
    thisWatchLater () {
      return this.watchlaters.find(watchlater => watchlater.serie.id === this.serie && watchlater.episode_number === this.episodeNumber) || null
    },
    isLogin () {
      return this.$store.state.auth
    }
  },
  methods: {
    lessThan7Days (date) {
      const now = new Date()
      const created = new Date(date)
      const diff = now - created
      return diff < 7 * 24 * 60 * 60 * 1000
    },
    toggleWatchLater (serie) {
      if (this.isInWatchLater) {
        fetch(`${this.$config.API_STRAPI_ENDPOINT}watchlaters/${this.thisWatchLater.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.$store.state.auth.token}`
          }
        }).then((result) => {
          if (result.status === 200) {
            this.$emit('refresh')
          }
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
        })
      } else {
        const user = this.$store.state.auth.id
        fetch(`${this.$config.API_STRAPI_ENDPOINT}watchlaters`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({
            data: {
              user,
              serie,
              episode_number: this.episodeNumber
            }
          })
        }).then((result) => {
          if (result.status === 200) {
            this.$emit('refresh')
          }
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
        })
      }
    }
  }
}
</script>

<style scoped>
.episode-card {
  position: relative;
  transition: all 0.3s ease;
  border-radius: 2px;
  overflow: hidden;
  background: rgba(25, 25, 25, 0.7);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.episode-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.image-container {
  position: relative;
  overflow: hidden;
  border-top-left-radius: 2px;
  border-top-right-radius: 2px;
}

.episode-image {
  transition: transform 0.5s ease;
}

.episode-card:hover .episode-image {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-hover {
  opacity: 1;
}

.play-button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.play-button {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 3px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  transform: scale(0.8);
}

.episode-card:hover .play-button {
  transform: scale(1);
  background: rgba(var(--v-primary-base), 0.8);
}

.play-button i {
  font-size: 2.5rem;
  color: #fff;
}

.card-content {
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-grow: 1;
  background: transparent;
}

.card-details {
  width: 80%;
}

.episode-title {
  color: #fff;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

.episode-number {
  color: #bbb;
  font-size: 0.75rem;
  margin: 0;
}

.watchlater-btn {
  transition: all 0.3s ease;
}

.watchlater-btn:hover {
  transform: scale(1.2);
}

.new-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: #4CAF50;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 2;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  animation: pulse 2s infinite;
}

.no-censor-badge {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(51, 51, 51, 0.85);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 2;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.5);
  }
  70% {
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}
</style>

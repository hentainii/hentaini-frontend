<template>
  <div>
    <nuxt-link :to="localePath(`/h/${url}/${episodeNumber}`)">
      <v-hover v-slot="{ hover }">
        <v-img
          class="white--text lift-image"
          style="position:relative"
          :aspect-ratio="16/9"
          :src="screenshot"
        >
          <!-- Badge para "new" -->
          <div v-if="isNew" class="new-badge">
            <v-icon class="text-caption mr-1">
              mdi-star
            </v-icon>{{ $t('episode.new_badge') }}
          </div>
          <!-- Badge para "new" -->
          <div v-if="!censorship" class="no-censor-badge">
            <v-icon class="text-caption mr-1">
              mdi-eye
            </v-icon>{{ $t('episode.uncensored') }}
          </div>
          <div :class="hover ? 'fill-height gradient gradient-hover' : 'fill-height gradient'" />
          <div
            :class="hover ? 'play-button play-hover' : 'play-button'"
            style="position:absolute;top:50%;left:50%; transform: translate(-50%, -50%)"
          >
            <v-icon style="font-size:4rem">
              mdi-play
            </v-icon>
          </div>
        </v-img>
      </v-hover>
    </nuxt-link>
    <div class="d-flex justify-space-between align-center">
      <div style="display:grid;padding-right:10px;width:90%;">
        <v-card-title class="pb-0 pt-1 mt-1 pl-1" style="white-space:nowrap;line-height:15px;">
          <h2 style="overflow:hidden;text-overflow:ellipsis;font-size:0.8rem;width:240px;" class="pa-0 ma-0 white--text text-weight-bold">
            {{ title }}
          </h2>
        </v-card-title>
        <v-card-text class="py-0 pl-1 grey--text darken-3 text-caption">
          {{ $t('episode.episode_number') }} {{ episodeNumber }}
        </v-card-text>
      </div>
      <v-tooltip left>
        <template #activator="{ on, attrs }">
          <v-btn
            v-bind="attrs"
            icon
            small
            v-on="on"
            @click="isLogin ? toggleWatchLater(serie) : $router.push('/login')"
          >
            <v-icon>{{ isInWatchLater ? 'mdi-eye-off-outline' : 'mdi-eye-plus-outline' }}</v-icon>
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
.play-button {
  transition: all .2s ease-in-out;
}

.play-button:not(.play-hover) {
  opacity: 0;
}
.gradient {
  transition: all .2s ease-in-out;
  background-image: linear-gradient(to top right, rgba(93, 93, 93, 0.33), rgba(26, 26, 26, 0.7));
}
.gradient:not(.gradient-hover){
  opacity: 0;
}

.lift-image {
    transition: all  0.2s;
}
.lift-image:hover {
    transform: translate(1px, -1px);
    box-shadow: #a08227 -2px 2px 0px 1px;
    transition: all  0.1s;
}

.new-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: green;
  color: white;
  padding: 4px 6px;
  border-bottom-left-radius: 4px;
  border-top-right-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}
.censor-badge {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgb(180, 180, 30);
  color: white;
  padding: 2px 4px;
  border-bottom-left-radius: 4px;
  border-top-right-radius: 4px;
  font-size: 0.6rem;
  font-weight: bold;
}
.no-censor-badge {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background-color: #333333bf;
  color: white;
  padding: 2px 4px;
  border-bottom-left-radius: 4px;
  border-top-right-radius: 4px;
  font-size: 0.7rem;
  font-weight: 400;
}
</style>

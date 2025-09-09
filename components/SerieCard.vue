<template>
  <div class="serie-card">
    <nuxt-link :to="localePath(`/h/${serie.url}`)" :title="`Watch ${serie.title}`">
      <v-hover v-slot="{ hover }">
        <div class="card-container">
          <v-img
            :aspect-ratio="9/14"
            :src="getCoverImage(serie).cf_path || getCoverImage(serie).path"
            :lazy-src="getCoverImage(serie).cf_path || getCoverImage(serie).placeholder"
            class="card-image"
          >
            <div v-if="visits" class="visits-chip">
              <v-icon small>
                mdi-eye
              </v-icon>
              <span class="ml-1">{{ serie.visits.toLocaleString() }}</span>
            </div>

            <div class="card-gradient" />

            <div
              v-if="serie.synopsis"
              :class="hover ? 'card-overlay card-overlay-hover' : 'card-overlay'"
            >
              <div class="synopsis-container">
                <p class="synopsis-text">
                  {{ serie.synopsis.substr(0,180) + '...' }}
                </p>
                <div v-if="serie.genreList && serie.genreList.length > 0" class="genres-container">
                  <v-chip
                    v-for="(genre, index) in serie.genreList.slice(0, 3)"
                    :key="index"
                    x-small
                    class="genre-chip mr-1 mb-1"
                    color="rgba(255, 255, 255, 0.1)"
                    text-color="white"
                  >
                    uwu{{ genre.name }}
                  </v-chip>
                </div>
              </div>
            </div>

            <div class="card-title-container">
              <h3 class="card-title">
                {{ serie.title }}
              </h3>
              <div v-if="serie.status" class="status-indicator">
                <span class="status-dot" :class="statusClass" />
                <span class="status-text">{{ serie.status.name }}</span>
              </div>
            </div>
          </v-img>
        </div>
      </v-hover>
    </nuxt-link>
    <v-btn
      v-if="removeTagWl"
      class="remove-btn"
      color="red"
      fab
      small
      @click="removeWatchLaters"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>

    <v-btn
      v-if="removeTagF"
      class="remove-btn"
      color="red"
      fab
      small
      @click="removeFavorites"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </div>
</template>

<script>
export default {
  name: 'NiSerieCard',
  props: {
    serie: {
      type: Object,
      default: () => ({})
    },
    visits: {
      type: Number,
      default: 0
    },
    removeTagWl: {
      type: Boolean,
      default: false
    },
    watchlaterid: {
      type: Number,
      default: 0
    },
    removeTagF: {
      type: Boolean,
      default: false
    },
    favoriteid: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      CDN: process.env.CDN_URI
    }
  },
  computed: {
    statusClass () {
      if (!this.serie.status) { return '' }
      const statusLower = this.serie.status.name.toLowerCase()
      if (statusLower.includes('ongoing') || statusLower.includes('airing')) {
        return 'status-ongoing'
      } else if (statusLower.includes('completed') || statusLower.includes('finished')) {
        return 'status-completed'
      } else if (statusLower.includes('hiatus') || statusLower.includes('paused')) {
        return 'status-hiatus'
      } else {
        return 'status-default'
      }
    }
  },
  methods: {
    getCoverImage (serie) {
      if (!serie.images || !Array.isArray(serie.images)) {
        return {
          path: '',
          placeholder: '',
          cf_path: null,
          cf_placeholder: null
        }
      }
      const coverImage = serie.images.find(image => image.image_type && image.image_type.name === 'cover')
      if (!coverImage) {
        return {
          path: '',
          placeholder: '',
          cf_path: null,
          cf_placeholder: null
        }
      }
      return {
        path: `${this.$config.CDN_ENDPOINT}${coverImage.path || ''}`,
        placeholder: `${this.$config.CDN_ENDPOINT}${coverImage.placeholder || ''}`,
        cf_path: coverImage.cf_path || null,
        cf_placeholder: coverImage.cf_placeholder || null
      }
    },
    removeWatchLaters () {
      fetch(`${this.$config.API_STRAPI_ENDPOINT}watchlaters/${this.watchlaterid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        }
      }).then((result) => {
        if (result.status === 200) {
          this.$emit('refreshwl')
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    },
    removeFavorites () {
      fetch(`${this.$config.API_STRAPI_ENDPOINT}favorites/${this.favoriteid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        }
      }).then((result) => {
        if (result.status === 200) {
          this.$emit('refreshf')
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    }
  }
}
</script>

<style scoped>
.serie-card {
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
}

.serie-card:hover {
  transform: translateY(-8px);
}

.card-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  height: 100%;
}

.card-image {
  transition: transform 0.7s ease;
}

.serie-card:hover .card-image {
  transform: scale(1.03);
}

.card-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 70%;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 100%);
  z-index: 1;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 2;
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
}

.card-overlay-hover {
  opacity: 1;
}

.synopsis-container {
  overflow: hidden;
}

.synopsis-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 12px;
}

.genres-container {
  display: flex;
  flex-wrap: wrap;
  margin-top: auto;
}

.genre-chip {
  background-color: rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.genre-chip:hover {
  background-color: rgba(255, 255, 255, 0.25);
}

.card-title-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  z-index: 2;
}

.card-title {
  color: white;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 5px;
}

.status-ongoing {
  background-color: #4CAF50;
  box-shadow: 0 0 8px #4CAF50;
}

.status-completed {
  background-color: #2196F3;
  box-shadow: 0 0 8px #2196F3;
}

.status-hiatus {
  background-color: #FFC107;
  box-shadow: 0 0 8px #FFC107;
}

.status-default {
  background-color: #9E9E9E;
}

.status-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.visits-chip {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  z-index: 3;
}

.remove-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 4;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  transform: scale(1.1);
}
</style>

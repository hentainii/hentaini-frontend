<template>
  <div style="position:relative;">
    <nuxt-link :to="localePath(`/h/${url}`)">
      <v-hover v-slot="{ hover }">
        <v-card
          class="mx-auto elevation-4 rounded-lg"
        >
          <v-img
            :aspect-ratio="9/14"
            :src="screenshot"
            style="position:relative;"
            gradient="0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,.6) 15%, rgba(255,255,255,0)"
          >
            <v-chip v-if="visits" style="position:absolte;top:10px;float:right;right:10px;" color="grey darken-4 white--text" small>
              <v-icon small>mdi-eye</v-icon> <strong class="ml-1">{{ visits.toLocaleString() }}</strong>
            </v-chip>
            <v-expand-transition>
              <div
                v-if="hover"
                class="d-flex transition-fast-in-fast-out grey darken-3 v-card--reveal display-3 white--text px-3"
                style="height: 100%;"
              >
                <v-container>
                  <v-row>
                    <v-card-text style="font-size:0.9rem">
                      {{ synopsis.substr(0,180) + '...' }}
                    </v-card-text>
                  </v-row>
                </v-container>
              </div>
            </v-expand-transition>
            <v-card-title style="position:absolute;bottom:0;width:100%;" class="text-body-2 font-weight-bold text-center d-flex justify-center">
              {{ title }}
            </v-card-title>
          </v-img>
        </v-card>
      </v-hover>
    </nuxt-link>
    <v-btn
      v-if="removeTagWl"
      class="elevation-4"
      color="red"
      fab
      small
      style="position:absolute;right:10px;top:10px;"
      @click="removeWatchLaters"
    >
      <v-icon>mdi-close</v-icon>
    </v-btn>
    <v-btn
      v-if="removeTagF"
      class="elevation-4"
      color="red"
      fab
      small
      style="position:absolute;right:10px;top:10px;"
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
    title: {
      type: String,
      default: 'No Title'
    },
    synopsis: {
      type: String,
      default: ''
    },
    genres: {
      type: Array,
      default: () => [
        {
          text: ''
        }
      ]
    },
    componentgenres: {
      type: Array,
      default: () => [
        {
          name: ''
        }
      ]
    },
    status: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    screenshot: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: ''
    },
    visits: {
      type: Number,
      default: null
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
  methods: {
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

<style>
.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: .9;
  position: absolute;
  width: 100%;
}
</style>

<template>
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
    }
  },
  data () {
    return {
      CDN: process.env.CDN_URI
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

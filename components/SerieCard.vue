<template>
  <nuxt-link :to="localePath(`/h/${url}`)">
    <v-hover v-slot="{ hover }">
      <v-card
        class="mx-auto elevation-4 rounded-xl"
      >
        <v-img
          :aspect-ratio="9/14"
          :src="screenshot"
          :lazy-src="placeholder ? placeholder : screenshot"
        >
          <v-expand-transition>
            <div
              v-if="hover"
              class="d-flex transition-fast-in-fast-out grey darken-3 v-card--reveal display-3 white--text px-3"
              style="height: 100%;"
            >
              <v-container>
                <v-row>
                  <v-card-title
                    class="text-body-2 text-sm-h5 text-md-h5 text-lg-body-1"
                  >
                    {{ title }}
                  </v-card-title>
                </v-row>
                <v-row>
                  <v-card-text style="font-size:0.7rem">
                    {{ synopsis.substr(0,200) + '...' }}
                  </v-card-text>
                </v-row>
                <v-row v-if="componentgenres.length > 0">
                  <v-chip
                    v-for="genre in componentgenres"
                    :key="genre.url"
                    color="primary"
                    text-color="white"
                    small
                    class="mx-auto my-2 rounded-lg"
                    :to="localePath(`/explore?genre=${genre.url}`)"
                    style="font-size:0.7rem"
                  >
                    {{ genre.name }}
                  </v-chip>
                </v-row>
                <v-row v-else>
                  <v-chip
                    v-for="genre in genres"
                    :key="genre.text"
                    color="primary"
                    text-color="white"
                    small
                    class="mx-auto my-2 rounded-lg"
                    :to="localePath(`/explore?genre=${genre.url}`)"
                    style="font-size:0.7rem"
                  >
                    {{ genre.text }}
                  </v-chip>
                </v-row>
              </v-container>
            </div>
          </v-expand-transition>
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
      default: 'No Status'
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

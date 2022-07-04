<template>
  <a v-if="!isAd" :href="'/h/' + hid + '/' + episodeNumber">
    <v-card
      class="mx-auto"
      flat
      tile
      color="#111"
    >
      <v-hover v-slot:default="{ hover }">
        <v-img
          class="white--text"
          style="position:relative"
          :aspect-ratio="16/9"
          :src="screenshot"
        >
          <div
            :class="hover ? 'fill-height gradient gradient-hover' : 'fill-height gradient'"
          />
          <div
            :class="hover ? 'play-button play-hover' : 'play-button'"
            style="position:absolute;top:50%;left:50%; transform: translate(-50%, -50%)"
          >
            <v-icon style="font-size:4rem">
              mdi-play
            </v-icon>
          </div>
          <v-card-text
            class="align-self-end text--primary"
            style="position:absolute;bottom:0"
          >
            <v-chip
              color="blue darken-3"
              text-color="white"
              small
            >
              <v-icon left>
                mdi-play
              </v-icon>
              Episode: {{ episodeNumber }}
            </v-chip>
          </v-card-text>
        </v-img>
      </v-hover>
      <v-card-title class="pb-0 pt-2 pl-0" style="font-size:1rem">
        {{ title }}
      </v-card-title>
      <v-card-text class="py-0 pl-0 grey--text darken-3">
        {{ $moment(created).fromNow() }}
      </v-card-text>
    </v-card>
  </a>
  <a
    v-else
    :href="url"
  >
    <v-card
      class="mx-auto"
      flat
      tile
      color="#111"
    >
      <v-img
        class="white--text"
        style="position:relative"
        :aspect-ratio="16/9"
        :src="screenshot"
      />
      <v-card-title class="pb-0 pt-2 pl-0" style="font-size:1rem">
        {{ title }}
      </v-card-title>
    </v-card>
  </a>
</template>

<script>
export default {
  name: 'NiEpisodeCard',
  props: {
    episode: {
      type: String,
      default: '0'
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
      default: ''
    },
    created: {
      type: String,
      default: ''
    },
    isAd: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      CDN: process.env.CDN_URI
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
  background-image: linear-gradient(to top right, rgba(100,115,201,.33), rgba(25,32,72,.7));
}
.gradient:not(.gradient-hover){
  opacity: 0;
}
</style>

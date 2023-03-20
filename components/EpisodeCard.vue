<template>
  <nuxt-link v-if="!isAd" :to="localePath(`/h/${hid}/${episodeNumber}`)">
    <v-hover v-slot="{ hover }">
      <v-img
        class="white--text rounded-xl lift-image"
        style="position:relative"
        :aspect-ratio="16/9"
        :src="screenshot"
        :lazy-src="placeholder"
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
          class="align-self-end text--primary pl-0 pb-1"
          style="position:absolute;bottom:0"
        >
          <v-chip
            color="primary"
            text-color="white"
            small
            style="border-radius:0 10px 10px 0;"
          >
            <v-icon left>
              mdi-play
            </v-icon>
            Episode: {{ episodeNumber }}
          </v-chip>
        </v-card-text>
      </v-img>
    </v-hover>
    <v-card-title class="pb-0 pt-1 mt-2 pl-2" style="overflow:hidden;white-space:nowrap;line-height:15px;">
      <p style="text-overflow:ellipsis;font-size:0.9rem;" class="pa-0 ma-0 white--text text-weight-bold">
        {{ title }}
      </p>
    </v-card-title>
    <v-card-text class="py-0 pl-2 grey--text darken-3 text-caption">
      {{ $moment(created).fromNow() }}
    </v-card-text>
  </nuxt-link>
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
        class="white--text rounded-xl"
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
      type: Number,
      default: 0
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

.lift-image {
    transition: all  0.2s;
}
.lift-image:hover {
    transform: translate(2px, -2px);
    box-shadow: #4527A0 -4px 4px 0px 1px;
    transition: all  0.2s;
}
</style>

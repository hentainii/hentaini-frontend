<template>
  <nuxt-link v-if="!isAd" :to="localePath(`/h/${url}/${episodeNumber}`)">
    <v-hover v-slot="{ hover }">
      <v-img
        class="white--text rounded-lg lift-image"
        style="position:relative"
        :aspect-ratio="16/9"
        :src="screenshot"
      >
        <!-- Badge para "new" -->
        <div v-if="isNew" class="new-badge">{{ $t('episode.new_badge') }}</div>
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
    <v-card-title class="pb-0 pt-1 mt-2 pl-2" style="overflow:hidden;white-space:nowrap;line-height:15px;">
      <h2 style="text-overflow:ellipsis;font-size:0.9rem;" class="pa-0 ma-0 white--text text-weight-bold">
        {{ title }}
      </h2>
    </v-card-title>
    <v-card-text class="py-0 pl-2 yellow--text darken-3 text-caption">
      Episode {{ episodeNumber }}
    </v-card-text>
  </nuxt-link>
  <a v-else :href="url">
    <v-card class="mx-auto" flat tile color="#111">
      <v-img
        class="white--text rounded-lg"
        style="position:relative"
        :aspect-ratio="16/9"
        :src="screenshot"
      >
        <!-- Badge para "new" -->
        <div v-if="isNew" class="new-badge">New</div>
      </v-img>
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
    },
    isNew: {
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
    box-shadow: #a08227 -4px 4px 0px 1px;
    transition: all  0.2s;
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
</style>

<template>
  <v-col
    cols="6"
    md="3"
    class="pa-0"
  >
    <v-hover v-slot="{ hover }">
      <nuxt-link :to="`${$route.path}${data.url}`">
        <v-img
          :src="`${$config.CDN_ENDPOINT}${data.image.path}`"
          class="align-end justify-center text-center"
          gradient="0deg, rgba(0,0,0,1) 0%, rgba(153,153,153,0) 25%, rgba(255,255,255,0) 100%"
          :style="hover ? 'transform:scale(1.03);transition: all 0.3s;z-index:100;' : 'transform:scale(1);transition: all 0.3s;'"
        >
          <v-icon class="text-h2">
            mdi-{{ data.icon }}
          </v-icon>
          <h3 class="text-h4 text-md-h2 font-weight-black mb-2">
            {{ data.name }}
          </h3>
          <p>{{ data.description }}</p>
        </v-img>
      </nuxt-link>
    </v-hover>
  </v-col>
</template>
<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
    }
  }
}
</script>

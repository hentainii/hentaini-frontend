<template>
  <v-bottom-navigation
    grow
    color="blue"
    fixed
    class="sticky-bottom"
  >
    <v-btn :to="localePath('/')" large style="height: inherit !important;">
      <span>{{ $t('mobile.home') }}</span>
      <v-icon>mdi-home</v-icon>
    </v-btn>

    <v-btn :to="localePath('/explore?filter=airing')" large style="height: inherit !important;">
      <span>{{ $t('mobile.explore') }}</span>
      <v-icon>mdi-plus-thick</v-icon>
    </v-btn>

    <v-btn v-if="$store.state.auth" :to="localePath('/favorites')" large style="height: inherit !important;">
      <span>{{ $t('favorites.title') }}</span>
      <v-icon>mdi-heart</v-icon>
    </v-btn>
    <v-btn v-else :to="localePath('/login')" large style="height: inherit !important;">
      <span>{{ $t('favorites.title') }}</span>
      <v-icon>mdi-login</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script>
export default {
  name: 'NiMobileHeader',
  data () {
    return {
      windowWidth: ''
    }
  },
  mounted () {
    this.windowWidth = window.innerWidth
  }
}
</script>

<style scoped>
.sticky-bottom {
  position: sticky;
  bottom: 0;
  z-index: 1000;
}
</style>

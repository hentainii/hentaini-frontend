<template>
  <v-app dark class="overflow-hidden" style="height:100svh;">
    <a
      href="/"
    >
      <v-img
        :src="src404"
        position="center"
        contain
      />
    </a>
  </v-app>
</template>

<script>
export default {
  layout: 'empty',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      src404: 'img/404.jpg'
    }
  },
  head () {
    const title = '404 not Found, Son.'
    return {
      title
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>

<template>
  <div>
    <h1>Redirecting...</h1>
  </div>
</template>

<script>
export default {
  name: 'IndexPage',
  data () {
    return {
      title: 'hentaini',
      isDesktop: false
    }
  },
  head () {
    return {
      title: this.title,
      meta: [
        { hid: 'description', name: 'description', content: 'Watch and save your favorite Hentai in the interwebs, just the best quality for you' },
        { hid: 'keywords', name: 'keywords', content: 'hentai, hentaini, anime' },
        { hid: 'language', name: 'language', content: 'en' },
        { hid: 'audience', name: 'audience', content: 'all' },
        { hid: 'rating', name: 'rating', content: 'general' },
        { hid: 'distribution', name: 'distribution', content: 'global' },
        { hid: 'document-type', name: 'document-type', content: 'Public' },
        { hid: 'MSSmartTagsPreventParsing', name: 'MSSmartTagsPreventParsing', content: 'true' },
        { hid: 'robots', name: 'robots', content: 'all' },
        { hid: 'robots', name: 'robots', content: 'all, index, follow' },
        { hid: 'googlebot', name: 'googlebot', content: 'all, index, follow' },
        { hid: 'yahoo-slurp', name: 'yahoo-slurp', content: 'all, index, follow' },
        { hid: 'msnbot', name: 'msnbot', content: 'index, follow' },
        { hid: 'googlebot-image', name: 'googlebot-image', content: 'all' },
        { hid: 'title', name: 'title', content: this.title },
        { hid: 'og:title', property: 'og:title', content: this.title },
        { hid: 'og:description', property: 'og:description', content: 'Watch and save your favorite Hentai in the interwebs, just the best quality for you' },
        { hid: 'og:url', property: 'og:url', content: 'https://hentaini.com' },
        { hid: 'og:image', property: 'og:image', content: 'https://hentaini.com/hentaini.jpg' },
        { hid: 'author', name: 'author', content: 'hentaini' }
      ]
    }
  },
  mounted () {
    window.addEventListener('resize', this.isDesktopScreen)
    this.isDesktopScreen()
    this.$router.push('/home')
  },
  methods: {
    isDesktopScreen () {
      const res = document.body.clientWidth
      if (res < 960) {
        this.isDesktop = false
      } else {
        this.isDesktop = true
      }
      this.$store.commit('isDesktop', this.isDesktop)
    }
  }
}
</script>

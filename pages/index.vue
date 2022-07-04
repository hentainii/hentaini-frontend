<template>
  <div>
    <Header />
    <Carousel />
    <TagCloud />
    <LatestSeries />
    <v-container><v-divider /></v-container>
    <LatestEpisodes />
    <MobileHeader />
  </div>
</template>

<script>
export default {
  name: 'Index',
  data () {
    return {
      title: 'hentaini | its hentai, thats all.'
    }
  },
  head () {
    return {
      title: this.title,
      meta: [
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
        { hid: 'og:description', property: 'og:description', content: 'Its a Hentai site, what do you expect? a no-girlfriend-depression solution?' },
        { hid: 'og:url', property: 'og:url', content: 'https://hentaini.com' },
        { hid: 'og:image', property: 'og:image', content: 'https://hentaini.com/hentaini.jpg' },
        { hid: 'author', name: 'author', content: 'hentaini' }
      ]
    }
  }
}
</script>

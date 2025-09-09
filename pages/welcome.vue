<template>
  <section style="max-width: 1400px; margin: 0 auto;">
    <Header />
    <Carousel />
    <TextHeader />
    <LatestEpisodes :watchlaters="watchlaters" @refreshwatchlaters="getWatchLaters" />
    <LatestSeries />
    <LayoutPreFooter />
  </section>
</template>

<script>
export default {
  name: 'Index',
  data () {
    return {
      title: 'Hentaini 🔥 - Watch and download the best Hentai for free',
      isDesktop: false,
      watchlaters: []
    }
  },
  head () {
    return {
      title: this.title,
      meta: [
        { hid: 'description', name: 'description', content: 'Watch and save your favorite Hentai in the interwebs, just the best quality for you. Download episodes airing and finalized.' },
        { hid: 'keywords', name: 'keywords', content: 'hentai, hentaini, anime' },
        { hid: 'canonical', rel: 'canonical', href: this.$config.CANONICAL_URL },
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
      ],
      script: [
        {
          hid: 'schema-org',
          type: 'application/ld+json',
          json: {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            url: 'https://hentaini.com',
            name: 'Hentaini',
            description: 'Watch and save your favorite Hentai in the interwebs, just the best quality for you',
            publisher: {
              '@type': 'Organization',
              name: 'Hentaini',
              logo: {
                '@type': 'ImageObject',
                url: 'https://hentaini.com/hentaini.jpg'
              }
            }
          }
        }
      ]
    }
  },
  mounted () {
    window.addEventListener('resize', this.isDesktopScreen)
    this.isDesktopScreen()
    if (this.$store.state.auth) {
      this.getWatchLaters()
    }

    /**
     * Google Analytics
     */
    if (process.browser) {
      this.$gtag('config', 'G-CC7E5GXL8F', {
        page_title: this.$metaInfo?.title,
        page_path: this.$route.fullPath
      })
    }
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
    },
    getWatchLaters () {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          user: {
            id: this.$store.state.auth.id
          }
        },
        populate: ['serie']
      },
      {
        encodeValuesOnly: true
      })
      fetch(`${this.$config.API_STRAPI_ENDPOINT}watchlaters?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        }
      })
        .then(res => res.json())
        .then(({ data: watchLaters }) => {
          this.watchlaters = watchLaters
        })
    }
  }
}
</script>

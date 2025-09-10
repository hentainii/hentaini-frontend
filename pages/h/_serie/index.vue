<template>
  <main style="max-width: 1400px; margin: 0 auto;">
    <Header />
    <SerieRender :serie="serie" />
  </main>
</template>
<script>
export default {
  async asyncData ({ params, $config, $axios }) {
    const qs = require('qs')
    const query = qs.stringify({
      filters: {
        url: params.serie
      },
      populate: [
        'images',
        'images.image_type',
        'status',
        'episodes',
        'genreList',
        'studio',
        'producer'
      ]
    },
    {
      encodeValuesOnly: true
    })
    const { data: series } = await $axios.$get(`${$config.API_STRAPI_ENDPOINT}series?${query}`)
    return { serie: series[0] }
  },
  head () {
    return {
      title: `Watch ${this.serie.title} online free - Hentaini`,
      meta: [
        { hid: 'charset', charset: 'utf-8' },
        { hid: 'viewport', name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Watch online ' + this.serie.title + ' in best quality.' },
        { hid: 'og:title', property: 'og:title', content: 'Watch ' + this.serie.title + ' free online HD' },
        { hid: 'og:description', property: 'og:description', content: 'Watch online ' + this.serie.title + ' in best quality' },
        { hid: 'og:image', property: 'og:image', content: `${this.$config.SCREENSHOT_ENDPOINT}${this.serie.images.find(image => image.image_type.name === 'screenshot').path}` },
        { hid: 'og:image:secure_url', property: 'og:image:secure_url', content: `${this.$config.SCREENSHOT_ENDPOINT}${this.serie.images.find(image => image.image_type.name === 'screenshot').path}` },
        { hid: 'og:image:alt', property: 'og:image:alt', content: this.serie.title },
        { hid: 'og:image:type', property: 'og:image:type', content: 'image/jpeg' },
        { hid: 'og:image:width', property: 'og:image:width', content: '1200' },
        { hid: 'og:image:height', property: 'og:image:height', content: '630' },
        { hid: 'og:url', property: 'og:url', content: `https://hentaini.com${this.$route.path}` },
        { hid: 'og:type', property: 'og:type', content: 'video.tv_show' },
        { hid: 'og:locale', property: 'og:locale', content: 'en_US' },
        { hid: 'og:site_name', property: 'og:site_name', content: 'Hentaini' },
        { hid: 'twitter:card', name: 'twitter:card', content: 'summary_large_image' },
        { hid: 'twitter:site', name: 'twitter:site', content: '@hentaini' },
        { hid: 'twitter:creator', name: 'twitter:creator', content: '@hentaini' },
        { hid: 'twitter:title', name: 'twitter:title', content: 'Watch ' + this.serie.title + ' free online HD' },
        { hid: 'twitter:description', name: 'twitter:description', content: 'Watch online ' + this.serie.title + ' in best quality.' },
        { hid: 'twitter:image', name: 'twitter:image', content: `${this.$config.SCREENSHOT_ENDPOINT}${this.serie.images.find(image => image.image_type.name === 'screenshot').path}` },
        { hid: 'twitter:image:alt', name: 'twitter:image:alt', content: this.serie.title },
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
        { hid: 'title', name: 'title', content: 'Watch ' + this.serie.title + ' free online HD' },
        { hid: 'description', name: 'description', content: 'Watch online ' + this.serie.title + ' in best quality. I mean, its Hentaini, the best place to watch your favourite series' },
        { hid: 'keywords', name: 'keywords', content: 'Watch online hentai, best HD archive of the best of japanese culture for the world, hentaini, ahegao, yuri, yaoi, tentacle, maid, siscon, brocon' },
        { hid: 'og:url', property: 'og:url', content: `https://hentaini.com${this.$route.path}` },
        { hid: 'og:image', property: 'og:image', content: `${this.$config.SCREENSHOT_ENDPOINT}${this.serie.images.find(image => image.image_type.name === 'screenshot').path}` },
        { hid: 'author', name: 'author', content: 'hentaini' }
      ]
    }
  }
}
</script>

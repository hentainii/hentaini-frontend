<template>
  <div style="max-width: 1400px; margin: 0 auto;">
    <Header />
    <EpisodeRender :episode="episode" />
  </div>
</template>

<script>
export default {
  async asyncData ({ params, $config, $axios }) {
    const qs = require('qs')
    const query = qs.stringify({
      filters: {
        serie: {
          url: {
            $eq: params.serie
          }
        },
        episode_number: {
          $eq: params.episode
        }
      },
      populate: [
        'serie',
        'serie.images',
        'serie.images.image_type',
        'serie.genreList',
        'serie.episodes',
        'serie.status',
        'image'
      ],
      sort: ['createdAt:desc']
    },
    {
      encodeValuesOnly: true
    })
    const { data: episodes } = await $axios.$get(`${$config.API_STRAPI_ENDPOINT}episodes?${query}`)
    episodes.players = JSON.parse
    return { episode: episodes[0] }
  },
  head () {
    return {
      title: `${this.episode ? this.episode.serie.title : 'Hentaini'} episode ${this.episode ? this.episode.episode_number ? this.episode.episode_number : '' : ''} free online - Hentaini`,
      meta: this.episode
        ? [
            { hid: 'description', name: 'description', content: 'Watch online ' + this.episode.serie.title + ' in best quality' },
            { hid: 'keywords', name: 'keywords', content: 'Watch online' },
            { hid: 'canonical', rel: 'canonical', href: this.$config.CANONICAL_URL + '/h/' + this.episode.serie.url + '/' + this.episode.episode_number },
            { hid: 'language', name: 'language', content: 'en' },
            { hid: 'Revisit-After', name: 'Revisit-After', content: '3 days' },
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
            { hid: 'title', name: 'title', content: 'Watch ' + this.episode.serie.title + ' episode ' + this.episode.episode_number + ' free online HD' },
            { hid: 'description', name: 'description', content: 'Watch online ' + this.episode.serie.title + ' in best quality. I mean, its Hentaini, the best place to watch your favourite series' },
            { hid: 'keywords', name: 'keywords', content: 'Watch online hentai, best HD archive of the best of japanese culture for the world, hentaini, ahegao, yuri, yaoi, tentacle, maid, siscon, brocon' },
            { hid: 'og:title', property: 'og:title', content: this.episode.serie.title },
            { hid: 'og:description', property: 'og:description', content: 'Its a Hentai site, what do you expect? a no-girlfriend-depression solution?' },
            { hid: 'og:url', property: 'og:url', content: `https://hentaini.com/h/${this.episode.serie.url}/${this.episode.episode_number}` },
            { hid: 'og:image', property: 'og:image', content: 'https://hentaini.com/screenshot/' + this.episode.serie.background_coverUrl },
            { hid: 'author', name: 'author', content: 'hentaini' }
          ]
        : []
    }
  }
}
</script>

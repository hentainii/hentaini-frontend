<template>
  <div>
    <Header />
    <Explore />
  </div>
</template>

<script setup>
const title = 'Hentaini | Explore our catalog'

useHead({
  title,
  meta: [
    { name: 'description', content: 'Explore our catalog of Hentai series and episodes' },
    { name: 'keywords', content: 'hentai, hentaini, anime' },
    { name: 'language', content: 'en' },
    { name: 'audience', content: 'all' },
    { name: 'rating', content: 'general' },
    { name: 'distribution', content: 'global' },
    { name: 'document-type', content: 'Public' },
    { name: 'MSSmartTagsPreventParsing', content: 'true' },
    { name: 'robots', content: 'all' },
    { name: 'robots', content: 'all, index, follow' },
    { name: 'googlebot', content: 'all, index, follow' },
    { name: 'yahoo-slurp', content: 'all, index, follow' },
    { name: 'msnbot', content: 'index, follow' },
    { name: 'googlebot-image', content: 'all' },
    { name: 'title', content: title },
    { property: 'og:title', content: title },
    { property: 'og:description', content: 'Its a Hentai site, what do you expect? a no-girlfriend-depression solution?' },
    { property: 'og:url', content: 'https://hentaini.com' },
    { property: 'og:image', content: 'https://hentaini.com/hentaini.jpg' },
    { name: 'author', content: 'hentaini' }
  ]
})
</script>

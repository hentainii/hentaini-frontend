<template>
    <div>
      <h1>Redirecting...</h1>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router'
  import { useHead } from '#imports'
  import { onMounted } from 'vue'

  const router = useRouter()

  useHead({
    title: 'hentaini',
    meta: [
      { name: 'description', content: 'Watch and save your favorite Hentai in the interwebs, just the best quality for you' },
      { name: 'keywords', content: 'hentai, hentaini, anime' },
      { name: 'language', content: 'en' },
      { name: 'audience', content: 'all' },
      { name: 'rating', content: 'general' },
      { name: 'distribution', content: 'global' },
      { name: 'document-type', content: 'Public' },
      { name: 'MSSmartTagsPreventParsing', content: 'true' },
      { name: 'robots', content: 'all, index, follow' },
      { name: 'googlebot', content: 'all, index, follow' },
      { name: 'yahoo-slurp', content: 'all, index, follow' },
      { name: 'msnbot', content: 'index, follow' },
      { name: 'googlebot-image', content: 'all' },
      { name: 'title', content: 'hentaini' },
      { property: 'og:title', content: 'hentaini' },
      { property: 'og:description', content: 'Watch and save your favorite Hentai in the interwebs, just the best quality for you' },
      { property: 'og:url', content: 'https://hentaini.com' },
      { property: 'og:image', content: 'https://hentaini.com/hentaini.jpg' },
      { name: 'author', content: 'hentaini' }
    ]
  })

  onMounted(() => {
    navigateTo('/home')
  })
  </script>
  
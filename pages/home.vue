<template>
    <section class="pb-5">
      <Header />
      <Carousel />
      <TextHeader />
      <ClientOnly>
        <LatestEpisodes :watchlaters="watchlaters" @refreshwatchlaters="getWatchLaters" />
        <template #fallback>
          <div class="w-full max-w-[calc(100%-32px)] mx-auto px-2 md:px-6 pt-2 pb-5">
            <MiscLatestEpisodesSkeleton />
          </div>
        </template>
      </ClientOnly>
      <div class="my-4"><hr class="border-neutral-700" /></div>
      <ClientOnly>
        <LatestSeries />
        <template #fallback>
          <div class="w-full max-w-[calc(100%-32px)] mx-auto px-2 md:px-6 pt-2 pb-5">
            <MiscLatestSeriesSkeleton />
          </div>
        </template>
      </ClientOnly>
      <!-- <LayoutPreFooter /> -->
      <!-- <MobileHeader /> -->
    </section>
  </template>
  
  <script setup>
  import { ref, computed, watchEffect } from 'vue'
  import { useHead, useRuntimeConfig } from '#imports'
  import qs from 'qs'

  // SEO
  useHead({
    title: 'hentaini',
    meta: [
      { name: 'description', content: 'Watch and save your favorite Hentai in the interwebs, just the best quality for you' },
      { name: 'keywords', content: 'hentai, hentaini, anime' },
      { name: 'canonical', content: 'https://hentaini.com' },
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
      { property: 'og:description', content: 'Its a Hentai site, what do you expect? a no-girlfriend-depression solution?' },
      { property: 'og:url', content: 'https://hentaini.com' },
      { property: 'og:image', content: 'https://hentaini.com/hentaini.jpg' },
      { name: 'author', content: 'hentaini' }
    ],
    script: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
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
        })
      }
    ]
  })

  const config = useRuntimeConfig()
  const watchlaters = ref([])
  const user = ref({ id: 1, token: 'demo-token' })

  const query = computed(() => qs.stringify({
    filters: { user: { id: user.value.id } },
    populate: ['serie']
  }, { encodeValuesOnly: true }))

  const { data, status, refresh } = useFetch(
    () => user.value?.id && user.value?.token
      ? `${config.public.API_STRAPI_ENDPOINT}watchlaters?${query.value}`
      : null,
    {
      headers: computed(() => ({
        'Content-Type': 'application/json',
        Authorization: user.value?.token ? `Bearer ${user.value.token}` : ''
      })),
      key: 'home-watchlaters',
      default: () => ({ data: [] })
    }
  )

  watchEffect(() => {
    if (data.value && data.value.data) {
      watchlaters.value = data.value.data
    }
  })

  function getWatchLaters() {
    refresh()
  }
  </script>
  
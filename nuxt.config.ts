import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  app: {
    head: {
      titleTemplate: '%s - its hentai, that it.',
      title: 'hentaini',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
  runtimeConfig: {
    public: {
      COVER_ENDPOINT: process.env.NUXT_PUBLIC_CDN_COVER_ENDPOINT || 'http://localhost:1337/uploads/',
      SCREENSHOT_ENDPOINT: process.env.NUXT_PUBLIC_CDN_SCREENSHOT_ENDPOINT || 'http://localhost:1337/uploads/',
      CDN_ENDPOINT: process.env.NUXT_PUBLIC_CDN_ENDPOINT || 'http://localhost:1337/uploads/',
      API_STRAPI_ENDPOINT: process.env.NUXT_PUBLIC_STRAPI_ENDPOINT || 'http://localhost:1337/'
    }
  },
  modules: [
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxtjs/i18n',
    'nuxt-gtag',
    '@pinia/nuxt',
    '@nuxt/eslint'
  ],
  i18n: {
    lazy: true,
    langDir: 'lang/',
    defaultLocale: 'en',
    strategy: 'prefix_and_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieDomain: null,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: true,
      fallbackLocale: 'en'
    },
    locales: [
      { code: 'en', name: 'English', iso: 'en-US', file: 'en.js' },
      { code: 'es', name: 'Español', iso: 'es-ES', file: 'es.js' },
      { code: 'fr', name: 'Français', iso: 'fr-FR', file: 'fr.js' },
      { code: 'th', name: 'ไทย', iso: 'th-TH', file: 'th.js' },
      { code: 'id', name: 'Bahasa Indonesia', iso: 'id-ID', file: 'id.js' },
      { code: 'ms', name: 'Bahasa Melayu', iso: 'ms', file: 'ms.js' },
      { code: 'tl', name: 'Tagalog', iso: 'tl', file: 'tl.js' },
      { code: 'hi', name: 'Hindi', iso: 'hi', file: 'hi.js' },
      { code: 'bn', name: 'Bengali', iso: 'bn', file: 'bn.js' },
      { code: 'mr', name: 'Marathi', iso: 'mr', file: 'mr.js' },
      { code: 'vi', name: 'Tiếng Việt', iso: 'vi-VN', file: 'vi.js' },
      { code: 'fil', name: 'Filipino', iso: 'fil', file: 'fil.js' }
    ]
  }
})
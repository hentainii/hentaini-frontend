import colors from 'vuetify/es5/util/colors'
require('dotenv').config()
export default {
  server: {
    port: 3001 // default: 3000
  },
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - its hentai, that it.',
    title: 'hentaini',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: 'https://hentaini.com/favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    { src: '~/plugins/gtag.js' }
  ],

  publicRuntimeConfig: {
    COVER_ENDPOINT: process.env.CDN_COVER_ENDPOINT || 'http://localhost:1337/uploads/',
    SCREENSHOT_ENDPOINT: process.env.CDN_SCREENSHOT_ENDPOINT || 'http://localhost:1337/uploads/',
    CDN_ENDPOINT: process.env.CDN_ENDPOINT || 'http://localhost:1337/uploads/',
    API_STRAPI_ENDPOINT: process.env.API_STRAPI_ENDPOINT || 'http://localhost:1337/',
    // Cloudflare R2 Configuration
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || '',
    R2_ENDPOINT: process.env.R2_ENDPOINT || ''
  },

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    '@nuxtjs/eslint-module',
    '@nuxtjs/vuetify',
    '@nuxtjs/moment'
  ],

  moment: {
    timezone: true,
    locales: ['es']
  },
  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/i18n'
  ],

  strapi: {
    url: process.env.API_STRAPI_ENDPOINT,
    key: 'authToken',
    expires: '7d'
  },

  i18n: {
    lazy: true,
    locales: [
      {
        code: 'en',
        name: 'English',
        iso: 'en-US',
        file: 'en.js'
      },
      {
        code: 'es',
        name: 'Español',
        iso: 'es-ES',
        file: 'es.js'
      },
      {
        code: 'fr',
        name: 'Français',
        iso: 'fr-FR',
        file: 'fr.js'
      },
      {
        code: 'th',
        name: 'ไทย',
        iso: 'th-TH',
        file: 'th.js'
      },
      {
        code: 'id',
        name: 'Bahasa Indonesia',
        iso: 'id-ID',
        file: 'id.js'
      },
      {
        code: 'ms',
        name: 'Bahasa Melayu',
        iso: 'ms',
        file: 'ms.js'
      },
      {
        code: 'tl',
        name: 'Tagalog',
        iso: 'tl',
        file: 'tl.js'
      },
      {
        code: 'hi',
        name: 'Hindi',
        iso: 'hi',
        file: 'hi.js'
      },
      {
        code: 'bn',
        name: 'Bengali',
        iso: 'bn',
        file: 'bn.js'
      },
      {
        code: 'mr',
        name: 'Marathi',
        iso: 'mr',
        file: 'mr.js'
      },
      {
        code: 'vi',
        name: 'Tiếng Việt',
        iso: 'vi-VN',
        file: 'vi.js'
      },
      {
        code: 'fil',
        name: 'Filipino',
        iso: 'fil',
        file: 'fil.js'
      },
      {
        code: 'pt',
        name: 'Português',
        iso: 'pt-PT',
        file: 'pt.js'
      }
    ],
    defaultLocale: 'en',
    strategy: 'prefix_and_default',
    langDir: 'lang/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieDomain: null,
      cookieKey: 'i18n_redirected',
      alwaysRedirect: true,
      fallbackLocale: 'en'
    }
  },

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.yellow.darken3,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  }
}

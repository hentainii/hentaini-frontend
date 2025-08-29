<template>
  <v-container
    class="transparent"
    fluid
    style="position:relative; z-index:9999;"
  >
    <v-row>
      <v-col class="d-flex align-center justify-space-between" style="height:72px;">
        <div class="d-flex align-center">
          <v-toolbar-title>
            <nuxt-link :to="localePath('/')">
              <LogoMini class="d-md-none" />
              <LayoutLogo class="d-none d-md-block" />
            </nuxt-link>
          </v-toolbar-title>
        </div>
        <ul class="d-none d-md-flex d-lg-flex">
          <li class="mr-2">
            <nuxt-link :to="localePath('/explore')" style="color:white">
              <v-btn elevation="0" text>
                <v-icon class="mr-2">
                  mdi-book-outline
                </v-icon>
                <span class="d-none d-md-none d-lg-block d-lx-block">
                  {{ $t('menu.explore') }}
                </span>
              </v-btn>
            </nuxt-link>
          </li>
          <li class="mr-2">
            <nuxt-link :to="$store.state.auth ? localePath('/watchlater') : localePath('/login')" style="color:white">
              <v-btn elevation="0" text>
                <v-icon class="mr-2">
                  mdi-history
                </v-icon>
                <span class="d-none d-md-none d-lg-block d-lx-block">
                  {{ $t('watch_later.title') }}
                </span>
              </v-btn>
            </nuxt-link>
          </li>
          <li class="mr-2">
            <nuxt-link :to="$store.state.auth ? localePath('/favorites') : localePath('/login')" style="color:white">
              <v-btn elevation="0" color="red lighten-1" text>
                <v-icon class="mr-2">
                  mdi-heart
                </v-icon>
                <span class="d-none d-md-none d-lg-block d-lx-block">
                  {{ $t('favorites.title') }}
                </span>
              </v-btn>
            </nuxt-link>
          </li>
        </ul>
        <v-row class="mr-2 d-none d-md-flex d-lg-flex d-lx-flex">
          <UtilsSearch />
        </v-row>
        <div class="d-flex align-center">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                large
                href="https://discord.gg/PPkkEuRfyz"
                target="_blank"
                v-bind="attrs"
                v-on="on"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt --><g fill="currentColor" fill-opacity="0"><circle cx="9" cy="12" r="1.5"><animate fill="freeze" attributeName="fill-opacity" begin="1.3s" dur="0.15s" values="0;1" /></circle><circle cx="15" cy="12" r="1.5"><animate fill="freeze" attributeName="fill-opacity" begin="1.45s" dur="0.15s" values="0;1" /></circle></g><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="32" stroke-dashoffset="32" d="M12 6h2l1 -2c0 0 2.5 0.5 4 1.5c3.53 2.35 3 9.5 3 10.5c-1.33 2.17 -5.5 3.5 -5.5 3.5l-1 -2M12 6h-2l-0.97 -2c0 0 -2.5 0.5 -4 1.5c-3.53 2.35 -3 9.5 -3 10.5c1.33 2.17 5.5 3.5 5.5 3.5l1 -2"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.7s" values="32;0" /></path><path stroke-dasharray="16" stroke-dashoffset="16" d="M5.5 16c5 2.5 8 2.5 13 0"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.4s" values="16;0" /></path></g></svg>
              </v-btn>
            </template>
            <span>Join our Discord</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                large
                href="https://x.com/realHentaini"
                target="_blank"
                v-bind="attrs"
                v-on="on"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Material Line Icons by Vjacheslav Trushkin - https://github.com/cyberalien/line-md/blob/master/license.txt --><g fill="currentColor"><path d="M1 2h2.5L3.5 2h-2.5zM5.5 2h2.5L7.2 2h-2.5z"><animate fill="freeze" attributeName="d" dur="0.4s" values="M1 2h2.5L3.5 2h-2.5zM5.5 2h2.5L7.2 2h-2.5z;M1 2h2.5L18.5 22h-2.5zM5.5 2h2.5L23 22h-2.5z" /></path><path d="M3 2h5v0h-5zM16 22h5v0h-5z"><animate fill="freeze" attributeName="d" begin="0.4s" dur="0.4s" values="M3 2h5v0h-5zM16 22h5v0h-5z;M3 2h5v2h-5zM16 22h5v-2h-5z" /></path><path d="M18.5 2h3.5L22 2h-3.5z"><animate fill="freeze" attributeName="d" begin="0.5s" dur="0.4s" values="M18.5 2h3.5L22 2h-3.5z;M18.5 2h3.5L5 22h-3.5z" /></path></g></svg>
              </v-btn>
            </template>
            <span>Follow us on X for news and updates</span>
          </v-tooltip>
          <v-menu offset-y :close-on-click="true">
            <template #activator="{ on: onMenu }">
              <v-tooltip bottom>
                <template #activator="{ on: onTooltip }">
                  <v-btn
                    icon
                    large
                    dark
                    v-on="{ ...onMenu, ...onTooltip }"
                  >
                    <v-icon>
                      mdi-translate
                    </v-icon>
                  </v-btn>
                </template>
                <span>{{ $t('menu.change_language') }}</span>
              </v-tooltip>
            </template>
            <v-list>
              <v-list-item
                v-for="lang in availableLocales"
                :key="lang.code"
                :to="switchLocalePath(lang.code)"
              >
                <v-list-item-title>{{ lang.name }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <v-tooltip v-if="!$store.state.auth" bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                large
                to="/login"
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-account</v-icon>
              </v-btn>
            </template>
            <span>Login</span>
          </v-tooltip>
          <div v-else class="d-none d-sm-flex d-md-flex d-lg-flex">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  large
                  color="blue"
                  v-bind="attrs"
                  :to="localePath('/favorites')"
                  v-on="on"
                >
                  <v-icon>mdi-account</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('menu.user_profile') }}</span>
            </v-tooltip>
            <v-tooltip v-if="$store.state.auth.level === 2" bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  large
                  v-bind="attrs"
                  to="/panel"
                  v-on="on"
                >
                  <v-icon>mdi-cog</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('menu.admin_panel_button') }}</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  large
                  v-bind="attrs"
                  v-on="on"
                  @click="logout"
                >
                  <v-icon>mdi-exit-to-app</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('menu.logout_text') }}</span>
            </v-tooltip>
          </div>
          <v-app-bar-nav-icon
            class="d-flex d-md-none d-lg-none d-lx-flex primary--text"
            large
            @click="nav = !nav"
          />
        </div>
      </v-col>
    </v-row>
    <v-navigation-drawer
      v-model="nav"
      app
      mobile-breakpoint="960"
      disable-resize-watcher
      width="260"
      style="background-color:rgba(0,0,0,0.3)!important;backdrop-filter: blur(10px);max-height: 70%!important;"
      bottom
      max-height="500px"
    >
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-img src="/img/user_default.jpg" />
        </v-list-item-avatar>
      </v-list-item>

      <v-list-item v-if="$store.state.auth" link>
        <v-list-item-content>
          <v-list-item-title class="title">
            {{ $store.state.auth.username }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-else link to="/login">
        <v-list-item-content>
          <v-list-item-title class="title">
            {{ $t('menu.login_register_nav') }}
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list-item class="px-2">
        <UtilsSearch />
      </v-list-item>

      <v-list>
        <v-list-item-group>
          <v-list-item
            v-for="link in navs"
            :key="link.id"
            :to="link.url"
          >
            <v-list-item-icon>
              <v-icon v-text="link.icon" />
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title v-text="link.name" />
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
      <LayoutLogo class="ml-4" />
    </v-navigation-drawer>
  </v-container>
</template>

<script>
import Cookie from 'js-cookie'
export default {
  name: 'Header',
  components: {
    LogoMini: () => import('~/components/Layout/Logo-mini.vue')
  },
  data () {
    return {
      nav: false,
      search: '',
      focus: false,
      navs: [
        { id: 1, name: this.$t('menu.explore'), url: '/explore', icon: 'mdi-home' },
        { id: 2, name: this.$t('favorites.title'), url: '/favorites', icon: 'mdi-heart' },
        { id: 3, name: this.$t('watch_later.title'), url: '/watchlater', icon: 'mdi-history' }
      ]
    }
  },
  computed: {
    availableLocales () {
      return this.$i18n.locales.filter(i => i.code !== this.$i18n.locale)
    }
  },
  methods: {
    logout () {
      Cookie.remove('auth')
      this.$store.commit('setAuth', null)
    }
  }
}
</script>

<style>
.hnibg {
  background-color: rgba(0,0,0,0)!important;
}
.hnibg::after {
  content: '';
  z-index: -1;
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  pointer-events: none;
  transition: .2s;
  height: 160px!important;
  opacity: .9;
  background: linear-gradient(to bottom,rgb(36, 29, 39) 1%,rgba(31, 14, 35, 0) 100%)!important;
  box-shadow: none;
}
</style>

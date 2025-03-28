<template>
  <v-container
    class="transparent"
    fluid
    style="position:relative; z-index:9999;"
  >
    <v-row>
      <v-col class="d-flex align-center justify-space-between" style="height:72px;">
        <div class="d-flex align-center">
          <v-app-bar-nav-icon
            class="d-flex d-md-none d-lg-none d-lx-flex"
            @click="nav = !nav"
          />
          <v-toolbar-title>
            <nuxt-link :to="localePath('/')">
              <LayoutLogo />
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
                {{ $t('menu.explore') }}
              </v-btn>
            </nuxt-link>
          </li>
          <li class="mr-2">
            <nuxt-link :to="$store.state.auth ? localePath('/watchlater') : localePath('/login')" style="color:white">
              <v-btn elevation="0" text>
                <v-icon class="mr-2">
                  mdi-history
                </v-icon>
                {{ $t('watch_later.title') }}
              </v-btn>
            </nuxt-link>
          </li>
          <li class="mr-2">
            <nuxt-link :to="$store.state.auth ? localePath('/favorites') : localePath('/login')" style="color:white">
              <v-btn elevation="0" color="red lighten-1" text>
                <v-icon class="mr-2">
                  mdi-heart
                </v-icon>
                {{ $t('favorites.title') }}
              </v-btn>
            </nuxt-link>
          </li>
          <li v-if="rrss" class="mr-2">
            <v-tooltip
              v-for="rs in rrss"
              :key="rs.name"
              bottom
            >
              <template #activator="{ on, attrs }">
                <v-btn
                  icon
                  large
                  :href="rs.url"
                  target="_blank"
                  v-bind="attrs"
                  v-on="on"
                >
                  <v-icon>mdi-{{ rs.name.toLowerCase() }}</v-icon>
                </v-btn>
              </template>
              <span>{{ $t('menu.rrss') }} {{ rs.name }}</span>
            </v-tooltip>
          </li>
        </ul>
        <v-row class="mr-2 d-none d-md-flex d-lg-flex d-lx-flex">
          <UtilsSearch />
        </v-row>
        <div class="d-flex align-center">
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
        </div>
      </v-col>
    </v-row>
    <v-navigation-drawer
      v-model="nav"
      app
      dark
      floating
      mobile-breakpoint="960"
      disable-resize-watcher
      width="260"
      absolute
      style="z-index:2!important"
    >
      <v-img
        src="/img/nav-bg.jpg"
        height="100%"
      >
        <v-layout
          tag="v-list"
          column
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

          <v-divider />
          <v-row class="px-4 d-flex d-sm-flex d-sx-flex d-md-none d-lg-none d-lx-none">
            <UtilsSearch />
          </v-row>
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
        </v-layout>
      </v-img>
    </v-navigation-drawer>
  </v-container>
</template>

<script>
import Cookie from 'js-cookie'
export default {
  name: 'Header',
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
    },
    rrss () {
      return this.$store.state.rrss.rrss
    }
  },
  mounted () {
    // this.getRrss()
  },
  methods: {
    async getRrss () {
      await this.$store.dispatch('rrss/getRrss', {
        token: this.$store.state.auth.token
      })
    },
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

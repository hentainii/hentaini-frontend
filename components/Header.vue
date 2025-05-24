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
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><!-- Icon from Google Material Icons by Material Design Authors - https://github.com/material-icons/material-icons/blob/master/LICENSE --><path fill="#fff" d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.1.1 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.1 16.1 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12" /></svg>
              </v-btn>
            </template>
            <span>Join our Discord</span>
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

<template>
  <nav>
    <v-app-bar
      app
      dark
      dense
      flat
    >
      <div class="v-toolbar-title">
        <v-toolbar-title class="font-weight-light text-general">
          <v-btn
            v-if="responsive"
            class="default v-btn--simple"
            icon
            @click.stop="onClickBtn"
          >
            <v-icon>mdi-view-list</v-icon>
          </v-btn>
          {{ header }}
          {{ serie }}
        </v-toolbar-title>
      </div>

      <v-spacer />
      <v-toolbar-items>
        <v-flex
          align-center
          layout
          py-2
        >
          <v-btn
            to="/"
            text
            class="mr-2"
          >
            <v-icon
              class="toolbar-items"
              color
              to="/"
            >
              mdi-home
            </v-icon>
          </v-btn>
          <v-icon
            class="toolbar-items"
            color
          >
            mdi-power
          </v-icon>
        </v-flex>
      </v-toolbar-items>
    </v-app-bar>
    <v-navigation-drawer
      v-model="nav"
      app
      expand-on-hover
      mini-variant
    >
      <v-layout
        class=""
        tag="v-list"
        column
      >
        <v-list-item link>
          <v-list-item-content>
            <v-list-item-title class="title">
              {{ $store.state.auth.username }}
            </v-list-item-title>
            <v-list-item-subtitle>Back to home</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>

        <v-divider />
        <v-list nav>
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
      </v-layout>
    </v-navigation-drawer>
  </nav>
</template>

<script>
export default {
  name: 'ToolBar',
  props: {
    header: {
      type: String,
      default: 'Hentaini Panel'
    },
    serie: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    title: 'I got a digital dash -Future Hendrixx',
    responsive: false,
    responsiveInput: false,
    nav: true,
    navs: [
      { id: 1, name: 'Panel Home', url: '/panel/', icon: 'mdi-home' },
      { id: 2, name: 'Create Serie', url: '/panel/serie/create', icon: 'mdi-plus-circle' },
      { id: 3, name: 'List Series', url: '/panel/serie', icon: 'mdi-format-list-bulleted-square' },
      { id: 4, name: 'Studio-Producer Linking', url: '/panel/linking', icon: 'mdi-link-variant' },
      { id: 5, name: 'Studio Management', url: '/panel/studio', icon: 'mdi-camera-outline' },
      { id: 6, name: 'Producer Management', url: '/panel/producer', icon: 'mdi-office-building' },
      { id: 7, name: 'Create Genre', url: '/panel/genre/create', icon: 'mdi-account-circle' },
      { id: 8, name: 'Create Player', url: '/panel/player/create', icon: 'mdi-play-circle' },
      { id: 9, name: 'Episode Reports', url: '/panel/reports', icon: 'mdi-flag' },
      { id: 10, name: 'Users', url: '/panel/user', icon: 'mdi-account' },
      { id: 11, name: 'Sitemap', url: '/panel/sitemap', icon: 'mdi-sitemap' }
    ]
  })
}
</script>

<style>

</style>

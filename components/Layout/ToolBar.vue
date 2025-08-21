<template>
  <nav>
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
        <v-list-item link to="/">
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
      { id: 7, name: 'Create Genre', url: '/panel/genre/create', icon: 'mdi-account-circle' },
      { id: 8, name: 'Create Player', url: '/panel/player/create', icon: 'mdi-play-circle' },
      { id: 9, name: 'Episode Reports', url: '/panel/reports', icon: 'mdi-flag' },
      { id: 10, name: 'Users', url: '/panel/user', icon: 'mdi-account' },
      { id: 11, name: 'Comentarios', url: '/panel/comments', icon: 'mdi-comment' },
      { id: 12, name: 'Sitemap', url: '/panel/sitemap', icon: 'mdi-sitemap' },
      { id: 13, name: 'Uploader', url: '/panel/uploader', icon: 'mdi-cloud-upload' }
    ]
  })
}
</script>

<style>

</style>

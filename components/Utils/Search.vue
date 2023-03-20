<template>
  <v-container>
    <v-row style="position:relative" class="justify-center mx-auto">
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        class="rounded-xl elevation-0 transparent"
        :label="$t('menu.search_bar_text')"
        outlined
        dense
        filled
        hide-details="auto"
        @focus="focus = true"
        @blur="blurFocus"
      />
      <v-sheet
        v-if="search"
        width="100%"
        style="position:absolute;top:2.7rem;left:0;z-index:999!important;;background-color:rgba(32,18,36,0.8);backdrop-filter:blur(10px)"
        class="elevation-0 rounded-xl"
        tile
      >
        <nuxt-link
          v-for="serie in searchResult"
          :key="serie.id"
          :to="localePath(`/h/${serie.h_id}`)"
          class="my-3"
          style="color:inherit;"
        >
          <v-card
            class="py-4 transparent elevation-0"
          >
            <ul>
              <li class="d-flex">
                <div>
                  <v-img
                    :src="`${$config.COVER_ENDPOINT}${serie.images.find(image => image.image_type.name === 'cover').path}`"
                    width="76px"
                    height="76px"
                    class="mr-3 rounded-lg"
                    style="display:inline-block;vertical-align:middle;"
                  />
                </div>
                <div class="d-flex flex-column">
                  <span
                    class=""
                  >
                    {{ serie.title }}
                  </span>
                  <caption class="caption grey--text text-truncate text-left" style="width:600px;">
                    {{ serie.synopsis }}
                  </caption>
                </div>
              </li>
            </ul>
          </v-card>
        </nuxt-link>
      </v-sheet>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => {
    return {
      search: '',
      searchResult: [],
      focus: false,
      CDN: process.env.CDN_URI
    }
  },
  watch: {
    // eslint-disable-next-line object-shorthand
    search: function (searchQuery) {
      if (searchQuery.length > 2) {
        const query = `filters[title][$containsi]=${searchQuery}&populate[0]=images&populate[1]=images.image_type&pagination[limit]=5`
        fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`)
          .then(res => res.json())
          .then((seach) => {
            this.searchResult = seach.data
          })
      }
    }
  },
  methods: {
    // eslint-disable-next-line object-shorthand
    blurFocus: function () {
      setTimeout(() => { this.focus = false }, 100)
    }
  }
}
</script>

<style scoped>
</style>

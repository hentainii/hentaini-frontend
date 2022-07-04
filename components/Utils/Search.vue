<template>
  <v-container>
    <v-row style="position:relative">
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        :label="$t('menu.search_bar_text')"
        solo
        filled
        dense
        hide-details
        @focus="focus = true"
        @blur="blurFocus"
      />
      <v-sheet
        v-if="search && focus"
        width="100%"
        height="auto"
        style="position:absolute;top:2.7rem;left:0;z-index:999!important"
        elevation="4"
        color="grey darken-4"
        tile
      >
        <v-hover
          v-for="serie in searchResult"
          v-slot:default="{ hover }"
          :key="serie.attributes._id"
          class="my-3"
        >
          <a :href="`/h/${serie.attributes.h_id}`">
            <v-card
              :color="hover ? 'grey darken-3' : 'grey darken-4'"
              class="py-4"
            >
              <ul>
                <li>
                  <v-img
                    src="https://picsum.photos/200/300"
                    width="76px"
                    height="76px"
                    class="mr-3"
                    style="display:inline-block;vertical-align:middle"
                  />
                  <span
                    :class="hover ? 'blue--text darken-3' : 'white--text'"
                  >
                    {{ serie.attributes.title }}
                  </span>
                </li>
              </ul>
            </v-card>
          </a>
        </v-hover>
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
        const query = `filters[title][$containsi]=${searchQuery}`
        fetch(`${process.env.API_STRAPI_ENDPOINT}series?${query}`)
          .then(res => res.json())
          .then((res) => {
            console.log(res)
            this.searchResult = res.data
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

<style>

</style>

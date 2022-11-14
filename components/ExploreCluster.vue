<template>
  <v-container v-if="categories">
    <v-row class="justify-center mb-5">
      <h2 class="text-h4 text-md-h2 font-weight-black">
        Explore our catalog
      </h2>
    </v-row>
    <v-row class="justify-center">
      <UtilsImgCard
        v-for="category in categories"
        :key="category.name"
        :data="category"
      />
    </v-row>
  </v-container>
</template>
<script>
export default {
  data () {
    return {
      categories: null
    }
  },
  mounted () {
    this.getCategories()
  },
  methods: {
    async getCategories () {
      const qs = require('qs')
      const query = qs.stringify({
        populate: [
          'image'
        ]
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}categories?${query}`)
        .then(res => res.json())
        .then((categories) => {
          console.log(categories)
          this.categories = categories.data
        })
    }
  }
}
</script>

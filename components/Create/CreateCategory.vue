<template>
  <v-container>
    <v-alert
      v-if="alertBox"
      type="info"
      :class="alertBoxColor"
      tile
      dismissible
    >
      {{ createdMessage }}
    </v-alert>
    <form>
      <v-container>
        <v-row>
          <v-col>
            <v-container>
              <v-text-field
                v-model="name"
                label="Category Name"
                :hint="hint"
                persistent-hint
                required
              />
              <v-btn
                class="mr-4 blue darken-4"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                @click="createCategory"
              >
                submit
              </v-btn>
            </v-container>
          </v-col>
          <v-col>
            <v-card
              tile
            >
              <v-card-title class="blue darken-3">
                Available Categories
              </v-card-title>
              <v-list
                rounded
                shaped
              >
                <v-list-item
                  v-for="category in categories"
                  :key="category.id"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ category.name }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </form>
  </v-container>
</template>

<script>

export default {
  name: 'CreateCategory',
  data: () => ({
    name: '',
    hint: '',
    categories: '',
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false
  }),
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Category Created Successfully.'
    }
    this.$apollo.query({
      query: `query ($limit: Int){
        Categories(limit: $limit){
          _id
          name
        }
      }`,
      variables: {
        limit: 1000
      }
    }).then((input) => {
      this.categories = input.data.Categories
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    createCategory () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gql`mutation ($input: CategoryInput){
          createCategory(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            name: this.name
          }
        }
      }).then((input) => {
        if (input.data.createCategory.success) {
          this.$router.push({ path: '/panel/category/create', query: { created: true } }, () => { window.location.reload(true) }, () => { window.location.reload(true) })
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createCategory.errors[0].message
          this.isSubmitting = false
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    }
  }
}
</script>

<style>

</style>

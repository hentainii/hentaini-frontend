<template>
  <v-container>
    <form>
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
        <v-row>
          <v-col>
            <v-container>
              <v-text-field
                v-model="text"
                label="Genre Name"
                :hint="hint"
                persistent-hint
                required
              />
              <v-btn
                class="mr-4 primary"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                @click="createGenre"
              >
                submit
              </v-btn>
            </v-container>
          </v-col>
          <v-col>
            <v-card
              tile
              style="height:80vh;overflow-y:scroll;"
            >
              <v-card-title class="primary">
                Available Genres
              </v-card-title>
              <v-list
                rounded
                shaped
              >
                <v-list-item
                  v-for="genre in genres"
                  :key="genre.id"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ genre.name }}</v-list-item-title>
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
  name: 'CreateGenre',
  data: () => ({
    text: '',
    hint: '',
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false
  }),
  computed: {
    genres () {
      return this.$store.state.genres.genres
    }
  },
  mounted () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'primary'
      this.createdMessage = 'Genre Created Successfully.'
    }
    this.getGenres()
  },
  methods: {
    async getGenres () {
      await this.$store.dispatch('genres/getGenres', {
        token: this.$store.state.auth.token
      })
    },
    async createGenre () {
      this.isSubmitting = !this.isSubmitting
      await this.$store.dispatch('genres/createGenre', {
        token: this.$store.state.auth.token,
        genre: {
          name: this.text,
          url: encodeURIComponent(this.text.toLowerCase()).replaceAll('%20', '-')
        }
      })
      this.isSubmitting = !this.isSubmitting
    }
  }
}
</script>

<style>

</style>

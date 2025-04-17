<template>
  <v-card class="glass-card pa-6 ma-4" elevation="10" @click.self="clearSelection">
    <v-row>
      <v-col cols="12" md="6">
        <v-card-title class="headline font-weight-bold mb-4">
          <v-icon left color="primary">
            mdi-shape-plus
          </v-icon>
          Create or Edit Genre
        </v-card-title>
        <v-alert
          type="info"
          color="primary"
          border="left"
          class="mb-4"
          icon="mdi-information"
          dense
        >
          <span>
            <strong>Tip:</strong> Click on a genre in the list to edit or delete it. You can also create a new genre using the form.
          </span>
        </v-alert>
        <v-form>
          <v-text-field
            v-model="text"
            label="Genre Name"
            :hint="hint"
            persistent-hint
            required
            prepend-inner-icon="mdi-tag"
            outlined
            dense
            class="mb-3"
          />
          <v-row>
            <v-col cols="6">
              <v-btn
                class="mt-2 primary rounded-xl"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                large
                block
                @click="createOrEditGenre"
              >
                <v-icon left>
                  mdi-content-save
                </v-icon>
                {{ selectedGenre ? 'Save Changes' : 'Create Genre' }}
              </v-btn>
            </v-col>
            <v-col v-if="selectedGenre" cols="6">
              <v-btn
                class="mt-2 red darken-2 rounded-xl"
                :loading="isDeleting"
                :disabled="isDeleting"
                large
                block
                @click="deleteGenre"
              >
                <v-icon left>
                  mdi-delete
                </v-icon>
                Delete
              </v-btn>
              <v-btn
                class="mt-2 ml-2 grey lighten-1 rounded-xl"
                large
                block
                @click="clearSelection"
              >
                <v-icon left>
                  mdi-close-circle
                </v-icon>
                Cancel
              </v-btn>
            </v-col>
          </v-row>
          <v-alert
            v-if="alertBox"
            type="info"
            :class="alertBoxColor"
            tile
            dismissible
            class="mt-4"
          >
            {{ createdMessage }}
          </v-alert>
        </v-form>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="glass-card pa-4" elevation="6" style="height:80vh;overflow-y:scroll;">
          <v-card-title class="primary">
            <v-icon left color="primary">
              mdi-tag-multiple
            </v-icon>
            Available Genres
          </v-card-title>
          <div class="mb-2 genre-list-tip">
            <v-icon left small color="primary">
              mdi-information
            </v-icon>
            <span>Click a genre to edit or delete it</span>
          </div>
          <v-list rounded shaped>
            <v-list-item
              v-for="genre in genres"
              :key="genre.id"
              :class="{'selected-genre': selectedGenre && selectedGenre.id === genre.id}"
              style="cursor:pointer;"
              @click="toggleGenreSelection(genre)"
            >
              <v-list-item-content>
                <v-list-item-title>
                  <v-icon left small color="primary">
                    mdi-tag
                  </v-icon>
                  {{ genre.name }}
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action v-if="selectedGenre && selectedGenre.id === genre.id">
                <v-icon color="primary">
                  mdi-pencil
                </v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
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
    isSubmitting: false,
    isDeleting: false,
    selectedGenre: null
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
    async createOrEditGenre () {
      this.isSubmitting = true
      if (this.selectedGenre) {
        // Editar
        await this.$store.dispatch('genres/editGenre', {
          token: this.$store.state.auth.token,
          id: this.selectedGenre.id,
          genre: {
            name: this.text,
            url: encodeURIComponent(this.text.toLowerCase()).replaceAll('%20', '-')
          }
        })
        this.createdMessage = 'Genre Edited Successfully.'
        this.alertBoxColor = 'yellow darken-4'
      } else {
        // Crear
        await this.$store.dispatch('genres/createGenre', {
          token: this.$store.state.auth.token,
          genre: {
            name: this.text,
            url: encodeURIComponent(this.text.toLowerCase()).replaceAll('%20', '-')
          }
        })
        this.createdMessage = 'Genre Created Successfully.'
        this.alertBoxColor = 'primary'
      }
      this.isSubmitting = false
      this.text = ''
      this.selectedGenre = null
      this.alertBox = true
      await this.getGenres()
    },
    toggleGenreSelection (genre) {
      if (this.selectedGenre && this.selectedGenre.id === genre.id) {
        this.clearSelection()
      } else {
        this.selectedGenre = genre
        this.text = genre.name
        this.alertBox = false
      }
    },
    clearSelection () {
      this.selectedGenre = null
      this.text = ''
      this.alertBox = false
    },
    async deleteGenre () {
      if (!this.selectedGenre) { return }
      this.isDeleting = true
      await this.$store.dispatch('genres/deleteGenre', {
        token: this.$store.state.auth.token,
        id: this.selectedGenre.id
      })
      this.isDeleting = false
      this.text = ''
      this.selectedGenre = null
      this.createdMessage = 'Genre Deleted Successfully.'
      this.alertBoxColor = 'red darken-4'
      this.alertBox = true
      await this.getGenres()
    }
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255,255,255,0.12);
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
}
.selected-genre {
  background: rgba(103, 58, 183, 0.12) !important;
}
.genre-list-tip {
  color: #6c63ff;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  opacity: 0.85;
}
</style>

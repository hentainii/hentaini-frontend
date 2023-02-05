<template>
  <v-container>
    <v-alert
      v-if="alert"
      :type="alertType"
      tile
      dismissible
      outlined
    >
      {{ alertMessage }}
    </v-alert>
    <v-row>
      <v-col cols="6">
        <v-card
          elevation
        >
          <v-card-title>
            Initial information of {{ serie.h_id }}
          </v-card-title>
          <v-container>
            <v-text-field
              v-model="serie.title"
              label="Hentai Title"
              required
              outlined
            />
            <v-text-field
              v-model="serie.title_english"
              label="Hentai English Title"
              outlined
            />
            <v-textarea
              v-model="serie.synopsis"
              name="synopsis"
              label="Synopsis"
              value="Como comenzo con el que tenia el peinado follador..."
              hint="Describe the Hentai"
              outlined
            />
            <v-autocomplete
              v-model="serie.genreList"
              :items="genreList"
              label="Hentai Genres"
              item-text="name"
              item-value="id"
              multiple
              clearable
              deletable-chips
              outlined
              chips
              :return-object="false"
            />
            <v-select
              v-model="serie.serie_type"
              :items="serie_typeList"
              outlined
              item-text="name"
              item-value="id"
              label="Serie Type"
            />
            <v-select
              v-model="serie.status"
              :items="statusList"
              item-text="name"
              item-value="id"
              outlined
              label="Status"
            />
            <v-select
              v-model="serie.language"
              :items="languageList"
              item-text="name"
              item-value="id"
              outlined
              label="Language"
            />
            <v-switch
              v-model="serie.censorship"
              outlined
              label="Censorship"
            />
          </v-container>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card
          elevation
        >
          <v-card-title>
            Image Settings
          </v-card-title>
          <v-container>
            <v-file-input
              ref="cover"
              show-size
              :error="error"
              label="Cover Image"
              :clearable="false"
              @change="coverSelected"
              @click="initialCoverClear"
            />
            <v-file-input
              ref="background_cover"
              show-size
              :error="error"
              label="Screenshot Image"
              :clearable="false"
              @change="background_coverSelected"
              @click="initialScreenshotClear"
            />
            <v-menu
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field
                  v-model="serie.next_episode"
                  label="Next episode on"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="serie.next_episode" />
            </v-menu>
            <v-btn
              class="mr-4 primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              large
              @click="createSerie"
            >
              submit
            </v-btn>
          </v-container>
          <v-container>
            <v-row>
              <v-col
                v-if="coverPreview"
                cols="6"
              >
                <v-img :src="coverPreview" />
              </v-col>
              <v-col
                v-if="screenshotPreview"
                cols="6"
              >
                <v-img :src="screenshotPreview" />
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'CreateSerie',
  data: () => ({
    serie: {
      title: '',
      title_english: '',
      synopsis: '',
      censorship: false,
      next_episode: null,
      visits: 0,
      featured: false,
      hasEpisodes: false,
      h_id: null,
      genreList: null,
      status: null,
      language: null,
      serie_type: null
    },
    cover: [],
    background_cover: [],
    categories: [],
    genreError: false,
    error: false,
    coverPreview: '',
    screenshotPreview: '',
    alert: false,
    alertMessage: '',
    alertType: '',
    isSubmitting: false
  }),
  computed: {
    genreList () {
      return this.$store.state.genres.genres
    },
    serie_typeList () {
      return this.$store.state.serietypes.serieTypes
    },
    languageList () {
      return this.$store.state.language.languageList
    },
    statusList () {
      return this.$store.state.statuses.statuses
    }
  },
  mounted () {
    this.getGenres()
    this.getSerie_Types()
    this.getLanguageList()
    this.getStatuses()
    this.serie.h_id = Math.floor(Math.random() * (666666 - 333333) + 333333).toString()
  },
  methods: {
    async createSerie () {
      const images = [
        this.cover,
        this.background_cover
      ]
      this.isSubmitting = !this.isSubmitting
      if (!this.coverPreview || !this.screenshotPreview) {
        this.alert = true
        this.alertMessage = 'You must define an cover and screenshot image.'
        this.alertType = 'error'
        this.isSubmitting = false
        return
      }
      if (this.serie.genreList.length < 1) {
        this.alert = true
        this.alertMessage = 'You must select one or more genres.'
        this.alertType = 'error'
        this.isSubmitting = false
        return
      }

      await fetch(`${this.$config.API_STRAPI_ENDPOINT}series`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        },
        body: JSON.stringify({
          data: this.serie
        })
      }).then((input) => {
        if (input.status === 200) {
          Promise.resolve(input.json())
            .then((res) => {
              images.forEach((image) => {
                this.uploadImageToStrapi(image.blob, this.serie.title, image.type, res.data.id)
              })
            })
          this.isSubmitting = !this.isSubmitting
          this.alert = true
          this.alertType = 'info'
          this.alertMessage = 'Serie created successfully.'
          this.$router.replace('/panel/serie')
        } else {
          throw new Error('Error creating serie')
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    },
    async uploadImageToStrapi (imageBlob, imageName, imageType, serieId) {
      const formData = new FormData()
      formData.append('files', imageBlob, `${imageName}_${imageType}`)
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.$store.state.auth.token}`
        },
        body: formData
      }).then((input) => {
        if (input.status === 200) {
          Promise.resolve(input.json())
            .then((strapiRes) => {
              this.createImageComponent(strapiRes[0], imageType, serieId)
            })
        } else {
          throw new Error('Upload failed')
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    },
    async createImageComponent (image, imageType, serieId) {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        },
        body: JSON.stringify({
          data: {
            path: `medium_${image.hash}${image.ext}`,
            placeholder: `${image.formats.thumbnail.hash}${image.formats.thumbnail.ext}`,
            image_type: imageType === 'cover' ? 1 : 2,
            series: serieId
          }
        })
      })
    },
    async getGenres () {
      await this.$store.dispatch('genres/getGenres', {
        token: this.$store.state.auth.token
      })
    },
    async getSerie_Types () {
      await this.$store.dispatch('serietypes/getSerieTypes', {
        token: this.$store.state.auth.token
      })
    },
    async getLanguageList () {
      await this.$store.dispatch('language/getLanguages', {
        token: this.$store.state.auth.token
      })
    },
    async getStatuses () {
      await this.$store.dispatch('statuses/getStatuses', {
        token: this.$store.state.auth.token
      })
    },
    coverSelected (e) {
      this.alert = false
      this.cover.blob = this.$refs.cover.$refs.input.files[0]
      this.cover.type = 'cover'
      if (this.cover !== undefined) {
        this.coverPreview = URL.createObjectURL(this.$refs.cover.$refs.input.files[0])
      }
    },
    background_coverSelected (e) {
      this.alert = false
      this.background_cover.blob = this.$refs.background_cover.$refs.input.files[0]
      this.background_cover.type = 'screenshot'
      this.screenshotPreview = URL.createObjectURL(this.$refs.background_cover.$refs.input.files[0])
    },
    initialCoverClear () {
      this.cover = []
      this.error = false
      this.isSubmitting = false
    },
    initialScreenshotClear () {
      this.background_cover = []
      this.error = false
      this.isSubmitting = false
    }
  }
}
</script>

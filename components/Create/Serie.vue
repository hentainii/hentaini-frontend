<template>
  <v-card class="glass-card pa-6 ma-4" elevation="10">
    <v-row>
      <v-card-title class="headline font-weight-bold mb-4">
        <v-icon left color="primary">
          mdi-plus-box
        </v-icon>
        Create New Hentai Serie
      </v-card-title>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-form>
          <v-row>
            <v-col>
              <v-text-field
                v-model="serie.title"
                label="Title"
                prepend-inner-icon="mdi-format-title"
                outlined
                dense
                class="mb-3"
              />
            </v-col>
            <v-col>
              <v-text-field
                v-model="serie.title_english"
                label="English Title"
                prepend-inner-icon="mdi-translate"
                outlined
                dense
                class="mb-3"
              />
            </v-col>
          </v-row>
          <v-textarea
            v-model="serie.synopsis"
            label="Synopsis"
            prepend-inner-icon="mdi-text"
            outlined
            dense
            class="mb-3"
          />
          <v-autocomplete
            v-model="serie.genreList"
            :items="genreList"
            label="Genres"
            item-text="name"
            item-value="id"
            multiple
            chips
            deletable-chips
            outlined
            dense
            prepend-inner-icon="mdi-tag-multiple"
            class="mb-3"
            :return-object="false"
          />
          <v-row>
            <v-col>
              <StudioAutocomplete v-model="serie.studio" class="mb-3" />
            </v-col>
            <v-col>
              <ProducerAutocomplete v-model="serie.producer" class="mb-3" />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                v-model="serie.serie_type"
                :items="serie_typeList"
                label="Type"
                item-text="name"
                item-value="id"
                outlined
                dense
                prepend-inner-icon="mdi-shape"
              />
            </v-col>
            <v-col>
              <v-select
                v-model="serie.status"
                :items="statusList"
                label="Status"
                item-text="name"
                item-value="id"
                outlined
                dense
                prepend-inner-icon="mdi-check-circle"
              />
            </v-col>
            <v-col>
              <v-select
                v-model="serie.language"
                :items="languageList"
                label="Language"
                item-text="name"
                item-value="id"
                outlined
                dense
                prepend-inner-icon="mdi-earth"
              />
            </v-col>
            <v-col class="d-flex align-center">
              <v-switch
                v-model="serie.censorship"
                label="Censorship"
                inset
                color="red"
                class="ml-2"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="glass-card pa-4" elevation="6">
          <v-card-title class="subtitle-1 font-weight-bold mb-2">
            <v-icon left color="primary">
              mdi-image
            </v-icon>
            Images
          </v-card-title>
          <v-file-input
            ref="cover"
            show-size
            :error="error"
            label="Cover Image"
            prepend-icon="mdi-image"
            outlined
            dense
            class="mb-3"
            @change="coverSelected"
            @click="initialCoverClear"
          />
          <v-file-input
            ref="background_cover"
            show-size
            :error="error"
            label="Screenshot Image"
            prepend-icon="mdi-image-multiple"
            outlined
            dense
            class="mb-3"
            @change="background_coverSelected"
            @click="initialScreenshotClear"
          />
          <v-row>
            <v-col v-if="coverPreview" cols="6">
              <v-img :src="coverPreview" class="rounded-lg" max-width="100%" />
              <v-chip class="mt-2" color="primary" text-color="white" small>
                <v-icon left>
                  mdi-image
                </v-icon> Cover
              </v-chip>
            </v-col>
            <v-col v-if="screenshotPreview" cols="6">
              <v-img :src="screenshotPreview" class="rounded-lg" max-width="100%" />
              <v-chip class="mt-2" color="primary" text-color="white" small>
                <v-icon left>
                  mdi-image-multiple
                </v-icon> Screenshot
              </v-chip>
            </v-col>
          </v-row>
        </v-card>
        <v-btn
          class="mt-6 primary rounded-xl"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          large
          block
          @click="createSerie"
        >
          <v-icon left>
            mdi-content-save
          </v-icon>
          Create Serie
        </v-btn>
      </v-col>
    </v-row>

    <!-- Toast Notifications -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type === 'success' ? 'success' : notification.type === 'error' ? 'error' : notification.type === 'warning' ? 'warning' : 'info'"
      :timeout="5000"
      top
      right
    >
      <strong>{{ notification.title }}</strong><br>
      {{ notification.message }}
      <template #action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="hideNotification"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script>
import StudioAutocomplete from '../StudioAutocomplete.vue'
import ProducerAutocomplete from '../ProducerAutocomplete.vue'

export default {
  name: 'CreateSerie',
  components: {
    StudioAutocomplete,
    ProducerAutocomplete
  },
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
      genreList: [],
      status: 1,
      language: 1,
      serie_type: 1,
      studio: null,
      producer: null
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
    isSubmitting: false,
    studioSearch: '',
    studioToCreate: null,
    producerSearch: '',
    producerToCreate: null,
    notification: {
      show: false,
      type: 'info',
      title: '',
      message: ''
    }
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
    },
    hiphenated_name () {
      return this.serie.title.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    },
    studioList () {
      return this.$store.state.studios.studioList || this.$store.state.studios.studios || []
    },
    studioOptions () {
      const input = this.studioSearch && this.studioSearch.trim()
      const exists = this.studioList.some(
        s => s.name.toLowerCase() === input?.toLowerCase()
      )
      const options = [...this.studioList]
      if (input && !exists) {
        options.unshift({
          id: '__create__',
          name: `Crear nuevo estudio: "${input}"`
        })
      }
      return options
    },
    producerList () {
      return this.$store.state.producers.producerList || this.$store.state.producers.producers || []
    },
    producerOptions () {
      const input = this.producerSearch && this.producerSearch.trim()
      const exists = this.producerList.some(
        s => s.name.toLowerCase() === input?.toLowerCase()
      )
      const options = [...this.producerList]
      if (input && !exists) {
        options.unshift({
          id: '__create__',
          name: `Crear nueva productora: "${input}"`
        })
      }
      return options
    }
  },
  mounted () {
    this.getGenres()
    this.getSerie_Types()
    this.getLanguageList()
    this.getStatuses()
    this.getStudios()
    this.getProducers()
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
        this.notification.show = true
        this.notification.message = 'You must define an cover and screenshot image.'
        this.notification.type = 'error'
        this.notification.title = 'Error'
        this.isSubmitting = false
        return
      }
      if (this.serie.genreList.length < 1) {
        this.notification.show = true
        this.notification.message = 'You must select one or more genres.'
        this.notification.type = 'error'
        this.notification.title = 'Error'
        this.isSubmitting = false
        return
      }
      if (this.serie.status === null || this.serie.title === '' || this.serie.synopsis === '') {
        this.notification.show = true
        this.notification.message = 'You must select a status, a title and a synopsis.'
        this.notification.title = 'Error'
        this.notification.type = 'error'
        this.isSubmitting = false
        return
      }
      this.serie.synopsis = this.removeNoUTFCharacters(this.serie.synopsis)
      let studioId = this.serie.studio
      let producerId = this.serie.producer
      if (typeof studioId === 'object' && studioId !== null && studioId.id) {
        studioId = studioId.id
      }
      if (typeof producerId === 'object' && producerId !== null && producerId.id) {
        producerId = producerId.id
      }
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}series`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        },
        body: JSON.stringify({
          data: {
            ...this.serie,
            studio: studioId || null,
            producer: producerId || null,
            url: this.hiphenated_name
          }
        })
      }).then((input) => {
        if (input.status === 200) {
          Promise.resolve(input.json())
            .then((res) => {
              images.forEach((image) => {
                this.uploadImageToStrapi(image.blob, this.allowOnlyNumbersAndLetters(this.serie.title), image.type, res.data.id)
              })
              const serieId = res.data.id
              this.$router.replace(`/panel/serie/${serieId}/episode/create`)
            })
          this.alert = true
          this.alertType = 'info'
          this.alertMessage = 'Serie created successfully.'
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
    allowOnlyNumbersAndLetters (str) {
      return str.replace(/[^a-zA-Z0-9]/g, '')
    },
    async createImageComponent (image, imageType, serieId) {
      try {
        // Usar el nuevo endpoint que sube automáticamente a Cloudflare
        const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}images/create-with-cloudflare`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.$store.state.auth.token}`
          },
          body: JSON.stringify({
            data: {
              path: `${image.hash}${image.ext}`,
              placeholder: `${image.formats.thumbnail.hash}${image.formats.thumbnail.ext}`,
              image_type: imageType === 'cover' ? 1 : 2,
              series: serieId
            }
          })
        })

        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Manejar la respuesta según el estado de subida a Cloudflare
            if (result.data.cloudflare_uploaded === true) {
              console.log(`Image ${imageType} uploaded successfully to Cloudflare:`, result.data.cf_path)
              // Mostrar notificación de éxito si está disponible
              if (this.showNotification) {
                this.showNotification('success', 'Éxito', `Imagen ${imageType} guardada localmente y subida a Cloudflare correctamente`)
              }
            } else if (result.data.cloudflare_uploaded === false && result.data.cloudflare_error) {
              console.log(`Image ${imageType} saved locally (Cloudflare upload failed but image was created)`)
              if (this.showNotification) {
                this.showNotification('warning', 'Guardado Local', `Imagen ${imageType} guardada localmente (fallback), pero falló la subida a Cloudflare`)
              }
            } else {
              this.showNotification('success', 'Éxito', `Imagen ${imageType} guardada localmente correctamente`)
            }
          }
        } else {
          console.error(`Failed to upload ${imageType} image:`, response.statusText)
          if (this.showNotification) {
            this.showNotification('error', 'Upload Error', `Failed to upload ${imageType} image`)
          }
        }
      } catch (error) {
        console.error(`Error uploading ${imageType} image:`, error)
        if (this.showNotification) {
          this.showNotification('error', 'Upload Error', `Error uploading ${imageType} image: ${error.message}`)
        }
      }
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
    async getStudios () {
      await this.$store.dispatch('studios/getStudios', {
        token: this.$store.state.auth.token
      })
    },
    async getProducers () {
      await this.$store.dispatch('producers/getProducers', {
        token: this.$store.state.auth.token
      })
    },
    removeNoUTFCharacters (str) {
      let output = ''
      for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) <= 127) {
          output += str.charAt(i)
        }
      }
      return output
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
    },
    onStudioSelect (val) {
      if (val === '__create__' || (val && val.id === '__create__')) {
        const name = this.studioSearch.trim()
        this.createStudio(name)
        this.studioSearch = ''
      } else {
        this.serie.studio = val && val.id ? val.id : val
      }
    },
    showNotification (type, title, message) {
      this.notification = {
        show: true,
        type,
        title,
        message
      }
      setTimeout(() => {
        this.hideNotification()
      }, 5000)
    },
    hideNotification () {
      this.notification.show = false
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
</style>

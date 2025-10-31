<template>
  <v-card v-if="serieData" class="glass-card pa-6 ma-4" elevation="10">
    <v-row>
      <v-col cols="12" md="6">
        <v-card-title class="headline font-weight-bold mb-4">
          <v-icon left color="primary">
            mdi-pencil
          </v-icon>
          Edit Hentai Serie
        </v-card-title>
        <v-form>
          <v-text-field
            v-model="serieData.title"
            label="Title"
            prepend-inner-icon="mdi-format-title"
            outlined
            dense
            class="mb-3"
          />
          <v-text-field
            v-model="serieData.title_english"
            label="English Title"
            prepend-inner-icon="mdi-translate"
            outlined
            dense
            class="mb-3"
          />
          <v-textarea
            v-model="serieData.synopsis"
            label="Synopsis"
            prepend-inner-icon="mdi-text"
            outlined
            dense
            class="mb-3"
          />
          <v-autocomplete
            v-model="serieData.genreList"
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
            :return-object="true"
          />
          <StudioAutocomplete v-model="serieData.studio" class="mb-3" />
          <ProducerAutocomplete v-model="serieData.producer" class="mb-3" />
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="serieData.serie_type"
                :items="serie_typeList"
                label="Type"
                item-text="name"
                item-value="id"
                outlined
                dense
                prepend-inner-icon="mdi-shape"
                return-object
              />
            </v-col>
            <v-col cols="6">
              <v-select
                v-model="serieData.status"
                :items="statusList"
                label="Status"
                item-text="name"
                item-value="id"
                outlined
                dense
                prepend-inner-icon="mdi-check-circle"
                return-object
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="6">
              <v-select
                v-model="serieData.language"
                :items="languageList"
                label="Language"
                item-text="name"
                item-value="id"
                outlined
                dense
                prepend-inner-icon="mdi-earth"
              />
            </v-col>
            <v-col cols="6" class="d-flex align-center">
              <v-switch
                v-model="serieData.censorship"
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
            label="Cover Image"
            prepend-icon="mdi-image"
            accept="image/jpg, image/jpeg, image/png"
            outlined
            dense
            class="mb-3"
            @change="coverSelected"
            @click="initialCoverClear"
          />
          <v-file-input
            ref="screenshot"
            show-size
            label="Screenshot Image"
            prepend-icon="mdi-image-multiple"
            accept="image/jpg, image/jpeg, image/png"
            outlined
            dense
            class="mb-3"
            @change="screenshotSelected"
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
          :loading="loading"
          :disabled="loading"
          large
          block
          @click.once="editSerie"
        >
          <v-icon left>
            mdi-content-save
          </v-icon>
          Save Changes
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
  name: 'EditSerie',
  components: {
    StudioAutocomplete,
    ProducerAutocomplete
  },
  data: () => ({
    serieData: null,
    cover: {}, // objeto para la imagen cover seleccionada
    screenshot: {}, // objeto para la imagen screenshot seleccionada
    coverPreview: '', // preview local de cover
    screenshotPreview: '', // preview local de screenshot
    loading: false,
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
    }
  },
  mounted () {
    this.getGenres()
    this.getSerie_Types()
    this.getLanguageList()
    this.getStatuses()
    this.getSerie()
  },
  methods: {
    async getSerie () {
      await this.$store.dispatch('series/getSerie', {
        serieId: this.$route.params.id,
        populate: [
          'genreList', 'status', 'language', 'serie_type', 'images', 'images.image_type', 'studio', 'producer'
        ]
      })
      const serie = { ...this.$store.state.series.currentSerie }
      this.serieData = serie
      // Asumimos que la imagen actual se guarda en serieData.images:
      // el primer elemento es cover y el segundo (si existe) es screenshot
      if (this.serieData.images && this.serieData.images.length) {
        this.coverPreview = `${this.$config.CDN_ENDPOINT}${this.serieData.images[0].path}`
        if (this.serieData.images.length > 1) {
          this.screenshotPreview = `${this.$config.CDN_ENDPOINT}${this.serieData.images[1].path}`
        }
      }
    },
    async editSerie () {
      this.loading = true
      await this.$store.dispatch('series/editSerie', {
        serieData: this.serieData,
        token: this.$store.state.auth.token
      })
      // Si se seleccionó una nueva imagen cover, se sube a Strapi
      if (this.cover && this.cover.blob) {
        const existingCover = this.serieData.images?.find(image => image.image_type?.id === 1)
        await this.uploadImageToStrapi(
          this.cover.blob,
          this.allowOnlyNumbersAndLetters(this.serieData.title),
          this.cover.type,
          existingCover ? existingCover.id : null
        )
      }
      // Si se seleccionó una nueva imagen screenshot, se sube a Strapi
      if (this.screenshot && this.screenshot.blob) {
        const existingScreenshot = this.serieData.images?.find(image => image.image_type?.id === 2)
        await this.uploadImageToStrapi(
          this.screenshot.blob,
          this.allowOnlyNumbersAndLetters(this.serieData.title),
          this.screenshot.type,
          existingScreenshot ? existingScreenshot.id : null
        )
      }
      this.loading = false
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
    // Función para seleccionar imagen cover
    coverSelected () {
      const file = this.$refs.cover.$refs.input.files[0]
      if (file) {
        this.cover = { blob: file, type: 'cover' }
        this.coverPreview = URL.createObjectURL(file)
      }
    },
    // Función para limpiar selección de cover
    initialCoverClear () {
      this.cover = {}
      // Si no se selecciona nueva imagen, se conserva la preview actual
      // o se limpia si se desea reiniciar la selección:
      // this.coverPreview = ''
    },
    // Función para seleccionar imagen screenshot
    screenshotSelected () {
      const file = this.$refs.screenshot.$refs.input.files[0]
      if (file) {
        this.screenshot = { blob: file, type: 'screenshot' }
        this.screenshotPreview = URL.createObjectURL(file)
      }
    },
    // Función para limpiar selección de screenshot
    initialScreenshotClear () {
      this.screenshot = {}
      // De igual forma, se puede limpiar la preview o mantener la actual:
      // this.screenshotPreview = ''
    },
    // Función para subir imagen a Strapi
    async uploadImageToStrapi (imageBlob, imageName, imageType, imageId) {
      const formData = new FormData()
      formData.append('files', imageBlob, `${imageName}_${imageType}`)
      try {
        const input = await fetch(`${this.$config.API_STRAPI_ENDPOINT}upload`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.$store.state.auth.token}`
          },
          body: formData
        })
        if (!input.ok) {
          throw new Error('Upload failed')
        }
        const strapiRes = await input.json()
        await this.modifyImageComponent(strapiRes[0], imageType, imageId)
      } catch (error) {
        console.error(error)
        this.showNotification('error', 'Error de Subida', `No se pudo subir la imagen ${imageType}`)
      }
    },
    // Función para modificar el componente de imagen con almacenamiento local
    async modifyImageComponent (image, imageType, imageId) {
      try {
        // Preparar el payload base
        const payloadData = {
          path: `${image.hash}${image.ext}`,
          placeholder: `${image.formats.thumbnail.hash}${image.formats.thumbnail.ext}`,
          image_type: imageType === 'cover' ? 1 : 2
        }

        const isScreenshot = imageType === 'screenshot'

        // Si existe imageId, actualizar. Si no, crear nueva imagen local.
        if (imageId) {
          const payload = {
            data: payloadData
          }
          if (isScreenshot && this.serieData && this.serieData.id) {
            payload.serieId = this.serieData.id
          }
          const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}images/update-local/${imageId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.$store.state.auth.token}`
            },
            body: JSON.stringify(payload)
          })
          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              console.log(`Image ${imageType} updated locally successfully`)
              this.showNotification('success', 'Éxito', `Imagen ${imageType} actualizada localmente correctamente`)
            }
          } else {
            console.error(`Failed to update ${imageType} image:`, response.statusText)
            this.showNotification('error', 'Error de Actualización', `Error al actualizar la imagen ${imageType}`)
          }
        } else {
          // Crear nueva imagen local asociada a la serie
          const createPayload = {
            data: {
              ...payloadData,
              series: [this.serieData?.id]
            }
          }
          const createRes = await fetch(`${this.$config.API_STRAPI_ENDPOINT}images/create-local`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.$store.state.auth.token}`
            },
            body: JSON.stringify(createPayload)
          })
          if (createRes.ok) {
            const result = await createRes.json()
            const newImage = result.data
            // Actualizar estado local para coherencia en la sesión
            if (!this.serieData.images) { this.serieData.images = [] }
            const typeId = payloadData.image_type
            const existingIndex = this.serieData.images.findIndex(img => (img.image_type?.id || img.image_type) === typeId)
            const newImageStub = {
              id: newImage.id,
              path: payloadData.path,
              placeholder: payloadData.placeholder,
              image_type: { id: typeId }
            }
            if (existingIndex >= 0) {
              this.serieData.images.splice(existingIndex, 1, newImageStub)
            } else {
              this.serieData.images.push(newImageStub)
            }
            this.showNotification('success', 'Éxito', `Imagen ${imageType} creada correctamente`)

            // Si es screenshot, disparar actualización de referencias en episodios
            if (isScreenshot && this.serieData && this.serieData.id) {
              await fetch(`${this.$config.API_STRAPI_ENDPOINT}images/update-local/${newImage.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${this.$store.state.auth.token}`
                },
                body: JSON.stringify({ data: payloadData, serieId: this.serieData.id })
              })
            }
          } else {
            console.error(`Failed to create ${imageType} image`)
            this.showNotification('error', 'Error de Creación', `Error al crear la imagen ${imageType}`)
          }
        }
      } catch (error) {
        console.error(`Error updating/creating ${imageType} image:`, error)
        this.showNotification('error', 'Error de Imagen', `Error al procesar imagen ${imageType}: ${error.message}`)
      }
    },
    allowOnlyNumbersAndLetters (str) {
      return str.replace(/[^a-zA-Z0-9]/g, '')
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

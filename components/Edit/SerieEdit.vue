<template>
  <v-container v-if="serieData" fluid>
    <v-row>
      <!-- Sección de información básica -->
      <v-col cols="6">
        <v-card class="rounded-xl elevation-0" style="box-shadow: #7b1fa2 2px 2px 0px 1px !important;">
          <v-card-title>Edit basic Hentai information</v-card-title>
          <v-container>
            <v-text-field
              v-model="serieData.id"
              label="Serie ID"
              readonly
              disabled
              dense
              outlined
              rounded
            />
            <v-text-field
              v-model="serieData.title"
              label="Serie Name"
              required
              outlined
              dense
            />
            <v-text-field
              v-model="serieData.title_english"
              label="Serie English Name"
              required
              dense
              outlined
            />
            <v-textarea
              v-model="serieData.synopsis"
              name="synopsis"
              label="Synopsis"
              hint="Describe the Hentai"
              outlined
              dense
            />
            <v-autocomplete
              v-model="serieData.genreList"
              :items="genreList"
              label="Hentai Genres"
              item-text="name"
              item-value="id"
              multiple
              outlined
              dense
              clearable
              deletable-chips
              chips
              :return-object="true"
            />
            <v-select
              v-model="serieData.language"
              :items="languageList"
              item-text="name"
              item-value="id"
              outlined
              dense
              label="Language"
            />
            <v-select
              v-model="serieData.serie_type"
              :items="serie_typeList"
              outlined
              dense
              label="Serie Type"
              item-text="name"
              item-value="id"
              return-object
            />
            <v-select
              v-model="serieData.status"
              :items="statusList"
              outlined
              dense
              label="Status"
              item-text="name"
              item-value="id"
              return-object
            />
            <v-switch
              v-model="serieData.censorship"
              label="Censorship"
            />
          </v-container>
        </v-card>
      </v-col>
      <!-- Sección de imágenes -->
      <v-col cols="6">
        <v-card class="rounded-xl elevation-0" style="box-shadow: #7b1fa2 2px 2px 0px 1px !important;">
          <v-card-title>Image Settings</v-card-title>
          <v-container>
            <!-- Input para actualizar la imagen cover -->
            <v-file-input
              ref="cover"
              show-size
              label="Cover Image"
              outlined
              dense
              @change="coverSelected"
              @click="initialCoverClear"
            />
            <!-- Input para actualizar la imagen screenshot -->
            <v-file-input
              ref="screenshot"
              show-size
              label="Screenshot Image"
              outlined
              dense
              @change="screenshotSelected"
              @click="initialScreenshotClear"
            />
          </v-container>
          <v-container>
            <v-menu
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="290px"
            >
              <template #activator="{ on }">
                <v-text-field
                  v-model="serieData.next_episode"
                  label="Next episode on"
                  prepend-icon="mdi-calendar"
                  readonly
                  outlined
                  dense
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="serieData.next_episode" />
            </v-menu>
          </v-container>
          <v-container>
            <v-btn
              class="mr-4 primary rounded-xl"
              large
              block
              :loading="loading"
              @click.once="editSerie"
            >
              submit
            </v-btn>
          </v-container>
          <v-container>
            <v-row>
              <!-- Preview para cover -->
              <v-col v-if="coverPreview" cols="6">
                <v-img :src="`${coverPreview}`" />
              </v-col>
              <!-- Preview para screenshot -->
              <v-col v-if="screenshotPreview" cols="6">
                <v-img :src="`${screenshotPreview}`" />
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
  name: 'EditSerie',
  data: () => ({
    serieData: null,
    cover: {}, // objeto para la imagen cover seleccionada
    screenshot: {}, // objeto para la imagen screenshot seleccionada
    coverPreview: '', // preview local de cover
    screenshotPreview: '', // preview local de screenshot
    loading: false
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
        populate: ['genreList', 'status', 'language', 'serie_type', 'images', 'images.image_type']
      })
      this.serieData = { ...this.$store.state.series.currentSerie }
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
        await this.uploadImageToStrapi(
          this.cover.blob,
          this.allowOnlyNumbersAndLetters(this.serieData.title),
          this.cover.type,
          this.serieData.images.find(image => image.image_type.id === 1).id
        )
      }
      // Si se seleccionó una nueva imagen screenshot, se sube a Strapi
      if (this.screenshot && this.screenshot.blob) {
        await this.uploadImageToStrapi(
          this.screenshot.blob,
          this.allowOnlyNumbersAndLetters(this.serieData.title),
          this.screenshot.type,
          this.serieData.images.find(image => image.image_type.id === 2).id
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
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.$store.state.auth.token}`
        },
        body: formData
      })
        .then((input) => {
          if (input.status === 200) {
            Promise.resolve(input.json())
              .then((strapiRes) => {
                this.modifyImageComponent(strapiRes[0], imageType, imageId)
              })
          } else {
            throw new Error('Upload failed')
          }
        })
        .catch((error) => {
          console.error(error)
        })
    },
    // Función para crear el componente de imagen en Strapi
    async modifyImageComponent (image, imageType, imageId) {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.token}`
        },
        body: JSON.stringify({
          data: {
            path: `${image.hash}${image.ext}`,
            placeholder: `${image.formats.thumbnail.hash}${image.formats.thumbnail.ext}`,
            image_type: imageType === 'cover' ? 1 : 2
          }
        })
      })
    },
    allowOnlyNumbersAndLetters (str) {
      return str.replace(/[^a-zA-Z0-9]/g, '')
    }
  }
}
</script>

<style>
/* Estilos personalizados si se requieren */
</style>

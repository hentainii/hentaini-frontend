<template>
  <v-container v-if="serie">
    <v-row>
      <v-col cols="6">
        <v-card
          elevation
        >
          <v-card-title>
            Initial information
          </v-card-title>
          <v-container>
            <v-text-field
              v-model="serie.id"
              label="Serie ID"
              readonly
              disabled
              dense
              outlined
              rounded
            />
            <v-text-field
              v-model="serie.title"
              label="Serie Name"
              required
              outlined
            />
            <v-text-field
              v-model="serie.title_english"
              label="Serie English Name"
              required
              outlined
            />
            <v-textarea
              v-model="serie.synopsis"
              name="synopsis"
              label="Synopsis"
              value="Todo comenzo con el que tenia el peinado follador..."
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
              outlined
              clearable
              deletable-chips
              chips
              :return-object="true"
            />
            <v-select
              v-model="serie.language"
              :items="languageList"
              item-text="name"
              item-value="id"
              outlined
              label="Language"
            />
            <v-select
              v-model="serie.serie_type"
              :items="serie_typeList"
              outlined
              label="Serie Type"
              item-text="name"
              item-value="id"
              return-object
            />
            <v-select
              v-model="serie.status"
              :items="statusList"
              outlined
              label="Status"
              item-text="name"
              item-value="id"
              return-object
            />
            <v-switch
              v-model="serie.censorship"
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
          <v-card-title>
            Si, la imagen no se puede actualizar aun :v, paciencia.
          </v-card-title>
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
                  v-model="serie.next_episode"
                  label="Next episode on"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="serie.next_episode" />
            </v-menu>
            <v-btn class="mr-4 blue darken-4" large @click.once="editSerie">
              submit
            </v-btn>
          </v-container>
          <v-container>
            <v-row>
              <v-col
                v-if="coverPreview"
                cols="6"
              >
                <v-img :src="`${CDN}/cover/${coverPreview}`" />
              </v-col>
              <v-col
                v-if="screenshotPreview"
                cols="6"
              >
                <v-img :src="`${CDN}/screenshot/${screenshotPreview}`" />
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
    serie: null,
    coverPreview: '',
    screenshotPreview: '',
    genreList: [],
    statusList: [],
    languageList: [],
    serie_typeList: []
  }),
  mounted () {
    this.getGenres()
    this.getSerie_Types()
    this.getLanguageList()
    this.getStatuses()
    this.getSerie()
  },
  methods: {
    async getSerie () {
      const qs = require('qs')
      const query = qs.stringify({
        populate: [
          'genreList',
          'status',
          'language',
          'serie_type'
        ]
      },
      {
        encodeValuesOnly: true
      })
      await fetch(`${process.env.API_STRAPI_ENDPOINT}series/${this.$route.params.id}?${query}`)
        .then(res => res.json())
        .then((input) => {
          const res = []
          res.push(input)
          const loop = res.map((res) => {
            res.data.attributes.id = res.data.id
            res.data.attributes.status.data.attributes.id = res.data.attributes.status.data.id
            res.data.attributes.status = res.data.attributes.status.data.attributes
            res.data.attributes.language.data.attributes.id = res.data.attributes.language.data.id
            res.data.attributes.language = res.data.attributes.language.data.attributes
            res.data.attributes.serie_type.data.attributes.id = res.data.attributes.serie_type.data.id
            res.data.attributes.serie_type = res.data.attributes.serie_type.data.attributes
            res.data.attributes.genreList = res.data.attributes.genreList.data.map((genre) => {
              genre.attributes.id = genre.id
              return genre.attributes
            })
            return {
              ...res.data.attributes
            }
          })
          this.serie = loop[0]
        })
    },
    async editSerie () {
      await fetch(`${process.env.API_STRAPI_ENDPOINT}series/${this.serie.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.$store.state.auth.accessToken}`
        },
        body: JSON.stringify({
          data: this.serie
        })
      }).then((input) => {
        if (input.status === 200) {
          this.snack = true
          this.snackColor = 'info'
          this.snackText = 'Serie edited successfully!'
          this.$router.replace('/panel/serie')
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    },
    async getGenres () {
      await fetch(`${process.env.API_STRAPI_ENDPOINT}genres`)
        .then(res => res.json())
        .then((input) => {
          const res = input.data.map((genre) => {
            genre.attributes.id = genre.id
            return {
              ...genre.attributes
            }
          })
          this.genreList = res
        })
    },
    async getSerie_Types () {
      await fetch(`${process.env.API_STRAPI_ENDPOINT}serie-types`)
        .then(res => res.json())
        .then((input) => {
          const res = input.data.map((serietype) => {
            serietype.attributes.id = serietype.id
            return {
              ...serietype.attributes
            }
          })
          this.serie_typeList = res
        })
    },
    async getLanguageList () {
      await fetch(`${process.env.API_STRAPI_ENDPOINT}languages`)
        .then(res => res.json())
        .then((input) => {
          const res = input.data.map((language) => {
            language.attributes.id = language.id
            return {
              ...language.attributes
            }
          })
          this.languageList = res
        })
    },
    async getStatuses () {
      await fetch(`${process.env.API_STRAPI_ENDPOINT}statuses`)
        .then(res => res.json())
        .then((input) => {
          const res = input.data.map((status) => {
            status.attributes.id = status.id
            return {
              ...status.attributes
            }
          })
          this.statusList = res
        })
    }
  }
}
</script>

<style>

</style>

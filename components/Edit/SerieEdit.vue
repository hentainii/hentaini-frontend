<template>
  <v-container v-if="serieData">
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
            />
            <v-text-field
              v-model="serieData.title_english"
              label="Serie English Name"
              required
              outlined
            />
            <v-textarea
              v-model="serieData.synopsis"
              name="synopsis"
              label="Synopsis"
              value="Todo comenzo con el que tenia el peinado follador..."
              hint="Describe the Hentai"
              outlined
            />
            <v-autocomplete
              v-model="serieData.genreList"
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
              v-model="serieData.language"
              :items="languageList"
              item-text="name"
              item-value="id"
              outlined
              label="Language"
            />
            <v-select
              v-model="serieData.serie_type"
              :items="serie_typeList"
              outlined
              label="Serie Type"
              item-text="name"
              item-value="id"
              return-object
            />
            <v-select
              v-model="serieData.status"
              :items="statusList"
              outlined
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
                  v-model="serieData.next_episode"
                  label="Next episode on"
                  prepend-icon="mdi-calendar"
                  readonly
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="serieData.next_episode" />
            </v-menu>
            <v-btn class="mr-4 primary" large :loading="loading" @click.once="editSerie">
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
    serieData: null,
    coverPreview: '',
    screenshotPreview: '',
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
        populate: [
          'genreList',
          'status',
          'language',
          'serie_type'
        ]
      })
      this.serieData = { ...this.$store.state.series.currentSerie }
    },
    async editSerie () {
      this.loading = true
      await this.$store.dispatch('series/editSerie', {
        serieData: this.serieData,
        token: this.$store.state.auth.token
      })
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
    }
  }
}
</script>

<style>

</style>

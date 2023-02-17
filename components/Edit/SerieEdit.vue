<template>
  <v-container v-if="serieData" fluid>
    <v-row>
      <v-col cols="6">
        <v-card
          class="rounded-xl elevation-0"
          style="box-shadow: #7b1fa2 2px 2px 0px 1px !important;"
        >
          <v-card-title>
            Edit basic Hentai information
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
              value="Todo comenzo con el que tenia el peinado follador..."
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
      <v-col cols="6">
        <v-card
          class="rounded-xl elevation-0"
          style="box-shadow: #7b1fa2 2px 2px 0px 1px !important;"
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
                  outlined
                  dense
                  v-on="on"
                />
              </template>
              <v-date-picker v-model="serieData.next_episode" />
            </v-menu>
          </v-container>
          <v-container>
            <v-btn class="mr-4 primary rounded-xl" large block :loading="loading" @click.once="editSerie">
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

<template>
  <v-container>
    <v-row style="position:relative" class="justify-center mx-auto">
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        class="rounded-lg elevation-0 transparent"
        :label="$t('menu.search_bar_text')"
        outlined
        dense
        filled
        hide-details="auto"
        :maxlength="maxSearchLength"
        :counter="search.length > maxSearchLength * 0.8"
        @focus="focus = true"
        @blur="blurFocus"
      />
      <v-sheet
        v-if="search && searchResult.length > 0"
        width="100%"
        style="position:absolute;top:2.7rem;left:0;z-index:999!important;;background-color:rgba(32,18,36,0.8);backdrop-filter:blur(10px)"
        class="elevation-0 rounded-xl"
        tile
      >
        <nuxt-link
          v-for="serie in searchResult"
          :key="serie.id"
          :to="localePath(`/h/${serie.url}`)"
          class="my-3"
          style="color:inherit;"
        >
          <v-card
            class="py-4 transparent elevation-0"
          >
            <ul>
              <li class="d-flex">
                <div>
                  <v-img
                    :src="`${$config.COVER_ENDPOINT}${serie.images.find(image => image.image_type.name === 'cover').path}`"
                    width="76px"
                    height="76px"
                    class="mr-3 rounded-lg"
                    style="display:inline-block;vertical-align:middle;"
                  />
                </div>
                <div class="d-flex flex-column">
                  <span
                    class=""
                  >
                    {{ serie.title }}
                  </span>
                  <caption class="caption grey--text text-truncate text-left" style="width:600px;">
                    {{ serie.synopsis }}
                  </caption>
                </div>
              </li>
            </ul>
          </v-card>
        </nuxt-link>
      </v-sheet>

      <!-- Indicador de búsqueda activa -->
      <v-sheet
        v-if="isSearching && search && search.length > 2"
        width="100%"
        style="position:absolute;top:2.7rem;left:0;z-index:999!important;;background-color:rgba(32,18,36,0.8);backdrop-filter:blur(10px)"
        class="elevation-0 rounded-xl pa-3"
        tile
      >
        <v-card class="transparent elevation-0">
          <v-card-text class="text-center">
            <v-progress-circular
              indeterminate
              size="20"
              width="2"
              color="primary"
              class="mr-2"
            />
            <span class="grey--text">
              {{ $t('search.searching') || 'Buscando...' }}
            </span>
          </v-card-text>
        </v-card>
      </v-sheet>

      <!-- Mostrar mensaje si la búsqueda es muy corta -->
      <v-sheet
        v-if="search && search.length > 0 && search.length <= 2"
        width="100%"
        style="position:absolute;top:2.7rem;left:0;z-index:999!important;;background-color:rgba(32,18,36,0.8);backdrop-filter:blur(10px)"
        class="elevation-0 rounded-xl pa-3"
        tile
      >
        <v-card class="transparent elevation-0">
          <v-card-text class="text-center grey--text">
            {{ $t('search.min_characters') || 'Mínimo 3 caracteres para buscar' }}
          </v-card-text>
        </v-card>
      </v-sheet>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => {
    return {
      search: '',
      searchResult: [],
      focus: false,
      CDN: process.env.CDN_URI,
      maxSearchLength: 50, // Límite máximo de caracteres
      searchTimeout: null, // Para debouncing
      lastSearchTime: 0, // Control de rate limiting
      minSearchInterval: 500, // Mínimo 0.5 segundos entre búsquedas
      isSearching: false // Estado de búsqueda activa
    }
  },
  watch: {
    // eslint-disable-next-line object-shorthand
    search: function (searchQuery) {
      // Limpiar timeout anterior
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      // Validaciones de seguridad
      if (!searchQuery || searchQuery.length <= 2) {
        this.searchResult = []
        this.isSearching = false
        return
      }

      // Límite de longitud
      if (searchQuery.length > this.maxSearchLength) {
        this.search = searchQuery.substring(0, this.maxSearchLength)
        return
      }

      // Sanitizar entrada (remover caracteres peligrosos)
      const sanitizedQuery = this.sanitizeSearchQuery(searchQuery)
      if (sanitizedQuery !== searchQuery) {
        this.search = sanitizedQuery
        return
      }

      // Activar indicador de búsqueda
      this.isSearching = true

      // Debouncing - esperar 1 segundo antes de hacer la búsqueda
      this.searchTimeout = setTimeout(() => {
        this.performSearch(sanitizedQuery)
      }, this.minSearchInterval)
    }
  },

  // Limpiar timeouts al destruir el componente
  beforeDestroy () {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
    this.isSearching = false
  },
  methods: {
    // eslint-disable-next-line object-shorthand
    blurFocus: function () {
      setTimeout(() => { this.focus = false }, 100)
    },

    // eslint-disable-next-line object-shorthand
    sanitizeSearchQuery: function (query) {
      // Remover caracteres peligrosos y limitar a caracteres alfanuméricos, espacios y algunos símbolos básicos
      return query.replace(/[^\w\s\-áéíóúñü]/gi, '').trim()
    },

    // eslint-disable-next-line object-shorthand
    performSearch: function (searchQuery) {
      const currentTime = Date.now()

      // Rate limiting - no permitir más de 1 búsqueda por segundo
      if (currentTime - this.lastSearchTime < this.minSearchInterval) {
        this.isSearching = false
        return
      }

      this.lastSearchTime = currentTime

      try {
        const query = `filters[title][$containsi]=${encodeURIComponent(searchQuery)}&populate[0]=images&populate[1]=images.image_type&pagination[limit]=5`

        // Agregar timeout a la petición
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos timeout

        fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`, {
          signal: controller.signal
        })
          .then((res) => {
            clearTimeout(timeoutId)
            if (!res.ok) {
              throw new Error(`HTTP error! status: ${res.status}`)
            }
            return res.json()
          })
          .then((search) => {
            if (search && search.data) {
              this.searchResult = search.data
            } else {
              this.searchResult = []
            }
            this.isSearching = false
          })
          .catch((error) => {
            console.warn('Error en búsqueda:', error.message)
            this.searchResult = []
            this.isSearching = false
          })
      } catch (error) {
        console.error('Error al realizar búsqueda:', error)
        this.searchResult = []
        this.isSearching = false
      }
    }
  }
}
</script>

<style scoped>
</style>

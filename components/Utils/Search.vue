<template>
  <v-container>
    <v-row class="justify-center mx-auto">
      <v-menu
        v-model="menu"
        bottom
        offset-y
        :close-on-content-click="false"
        :close-on-click="false"
        transition="fade-transition"
        content-class="search-menu-background"
        style="z-index: 9999 !important;height:300px;"
      >
        <template #activator="{ on, attrs }">
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
            v-bind="attrs"
            v-on="on"
            @focus="onFocus"
            @blur="blurFocus"
          />
        </template>

        <div
          class="search-menu-content"
        >
          <template v-if="search && search.length > 0 && search.length <= 2">
            <v-card class="transparent elevation-0">
              <v-card-text class="text-center grey--text">
                {{ $t('search.min_characters') || 'Mínimo 3 caracteres para buscar' }}
              </v-card-text>
            </v-card>
          </template>

          <template v-else-if="isSearching && search && search.length > 2">
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
          </template>

          <template v-else-if="search && searchResult.length > 0">
            <nuxt-link
              v-for="serie in searchResult"
              :key="serie.id"
              :to="localePath(`/h/${serie.url}`)"
              class="my-1 search-result-link"
              style="color:inherit;display:block;"
              @click.native="menu = false"
            >
              <v-card class="transparent elevation-0 search-result-item">
                <div class="search-result-row">
                  <v-img
                    :src="`${$config.COVER_ENDPOINT}${serie.images.find(image => image.image_type.name === 'cover').path}`"
                    width="50"
                    height="50"
                    class="thumb rounded-lg"
                  />
                  <div class="search-result-text">
                    <div class="search-result-title">
                      {{ serie.title }}
                    </div>
                  </div>
                </div>
              </v-card>
            </nuxt-link>
          </template>
        </div>
      </v-menu>
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
      isSearching: false, // Estado de búsqueda activa
      menu: false // Control del overlay de resultados
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

      // Abrir overlay y activar indicador de búsqueda
      this.menu = !!sanitizedQuery
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
    this.menu = false
  },
  methods: {
    // eslint-disable-next-line object-shorthand
    blurFocus: function () {
      setTimeout(() => {
        this.focus = false
        this.menu = false
      }, 100)
    },

    // eslint-disable-next-line object-shorthand
    onFocus: function () {
      this.focus = true
      this.menu = !!this.search
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
        const query = `filters[title][$containsi]=${encodeURIComponent(searchQuery)}&populate[0]=images&populate[1]=images.image_type&pagination[limit]=50`

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
            // Mantener abierto si aún hay texto
            this.menu = !!this.search
          })
          .catch((error) => {
            console.warn('Error en búsqueda:', error.message)
            this.searchResult = []
            this.isSearching = false
            this.menu = !!this.search
          })
      } catch (error) {
        console.error('Error al realizar búsqueda:', error)
        this.searchResult = []
        this.isSearching = false
        this.menu = !!this.search
      }
    }
  }
}
</script>

<style>
/* El contenido del v-menu se monta en body, por eso estas clases no pueden ser scoped */
.search-menu-overlay {
  z-index: 9999 !important;
  bottom: 150px !important;
}
.search-menu-background {
  background-color: rgba(32, 18, 36, 0.52);
  backdrop-filter: blur(10px);
}
.search-menu-content {
  height: 300px;
  width: 100%;
  border-radius: 12px;
  padding: 8px 12px;
  z-index: 9999 !important;
}
.search-result-item {
  padding: 8px 0;
}
.search-result-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  align-items: center;
  gap: 12px;
}
.search-result-row .thumb {
  flex: 0 0 50px;
}
.search-result-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 0; /* permite truncado/wrap correcto */
}
.search-result-title {
  font-weight: 500;
}
.search-synopsis {
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3; /* limita a 3 líneas dentro de 400px */
  -webkit-box-orient: vertical;
  line-clamp: 3;
}
</style>

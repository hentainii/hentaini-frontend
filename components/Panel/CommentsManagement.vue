<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>
              mdi-comment
            </v-icon>
            Administración de Comentarios
            <v-spacer />
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar comentarios..."
              single-line
              hide-details
              class="mr-4"
              style="max-width: 300px;"
            />
            <v-btn
              color="primary"
              :loading="loading"
              @click="loadAllComments"
            >
              <v-icon left>
                mdi-refresh
              </v-icon>
              Actualizar
            </v-btn>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="filteredComments"
            :search="search"
            :loading="loading"
            :items-per-page="10"
            class="elevation-1"
            loading-text="Cargando comentarios..."
            no-data-text="No hay comentarios disponibles"
            no-results-text="No se encontraron comentarios que coincidan con la búsqueda"
          >
            <!-- Columna de contenido del comentario -->
            <template #[`item.content`]="{ item }">
              <div class="comment-content">
                <p class="mb-1">
                  {{ truncateText(item.content, 100) }}
                </p>
                <v-tooltip v-if="item.content.length > 100" bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      v-bind="attrs"
                      x-small
                      text
                      color="primary"
                      v-on="on"
                    >
                      Ver completo
                    </v-btn>
                  </template>
                  <span>{{ item.content }}</span>
                </v-tooltip>
              </div>
            </template>

            <!-- Columna de autor -->
            <template #[`item.author`]="{ item }">
              <v-chip
                small
                color="primary"
                outlined
              >
                <v-avatar left>
                  <v-icon small>
                    mdi-account
                  </v-icon>
                </v-avatar>
                {{ item.author }}
              </v-chip>
            </template>

            <!-- Columna de tipo de contenido -->
            <template #[`item.content_info`]="{ item }">
              <div>
                <v-chip
                  small
                  :color="getContentTypeColor(item.comment_type)"
                  outlined
                  class="mb-1"
                >
                  {{ item.comment_type }}
                </v-chip>
                <div
                  v-if="item.content_title"
                  class="content-link"
                  @click="navigateToContent(item)"
                >
                  <v-icon small color="primary" class="mr-1">
                    mdi-open-in-new
                  </v-icon>
                  <span class="text-body-2 primary--text">{{ item.content_title }}</span>
                  <div v-if="item.episode_info" class="text-caption">
                    Episodio {{ item.episode_info }}
                  </div>
                </div>
                <div v-else class="text-caption">
                  ID: {{ item.content_id }} (No encontrado)
                </div>
              </div>
            </template>

            <!-- Columna de fecha -->
            <template #[`item.createdAt`]="{ item }">
              <div>
                <div class="text-body-2">
                  {{ formatDate(item.createdAt) }}
                </div>
                <div class="text-caption">
                  {{ formatTime(item.createdAt) }}
                </div>
              </div>
            </template>

            <!-- Columna de estado -->
            <template #[`item.status`]="{ item }">
              <v-chip
                small
                :color="item.is_deleted ? 'error' : 'success'"
                :outlined="!item.is_deleted"
              >
                <v-icon left small>
                  {{ item.is_deleted ? 'mdi-delete' : 'mdi-check-circle' }}
                </v-icon>
                {{ item.is_deleted ? 'Eliminado' : 'Activo' }}
              </v-chip>
            </template>

            <!-- Columna de acciones -->
            <template #[`item.actions`]="{ item }">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    small
                    color="info"
                    v-on="on"
                    @click="viewComment(item)"
                  >
                    <v-icon>mdi-eye</v-icon>
                  </v-btn>
                </template>
                <span>Ver comentario completo</span>
              </v-tooltip>

              <v-tooltip v-if="!item.is_deleted" bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    small
                    color="error"
                    v-on="on"
                    @click="confirmDelete(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>Eliminar comentario</span>
              </v-tooltip>

              <v-tooltip v-else bottom>
                <template #activator="{ on, attrs }">
                  <v-btn
                    v-bind="attrs"
                    icon
                    small
                    color="warning"
                    disabled
                    v-on="on"
                  >
                    <v-icon>mdi-delete-off</v-icon>
                  </v-btn>
                </template>
                <span>Comentario ya eliminado</span>
              </v-tooltip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog para ver comentario completo -->
    <v-dialog
      v-model="viewDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title>
          <v-icon left>
            mdi-comment
          </v-icon>
          Comentario Completo
          <v-spacer />
          <v-btn icon @click="viewDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text v-if="selectedComment">
          <v-row>
            <v-col cols="12">
              <v-textarea
                :value="selectedComment.content"
                label="Contenido del comentario"
                readonly
                outlined
                rows="6"
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :value="selectedComment.author"
                label="Autor"
                readonly
                outlined
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :value="selectedComment.comment_type"
                label="Tipo de contenido"
                readonly
                outlined
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :value="selectedComment.content_id"
                label="ID del contenido"
                readonly
                outlined
              />
            </v-col>
            <v-col cols="6">
              <v-text-field
                :value="formatDateTime(selectedComment.createdAt)"
                label="Fecha de creación"
                readonly
                outlined
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog de confirmación para eliminar -->
    <v-dialog
      v-model="deleteDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title class="headline">
          <v-icon left color="error">
            mdi-delete
          </v-icon>
          Confirmar Eliminación
        </v-card-title>

        <v-card-text>
          ¿Estás seguro de que quieres eliminar este comentario? Esta acción marcará el comentario como eliminado en la base de datos.
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            text
            @click="deleteDialog = false"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            :loading="deleting"
            @click="deleteComment"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar para mensajes -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.message }}
      <template #action="{ attrs }">
        <v-btn
          text
          v-bind="attrs"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: 'CommentsManagement',

  data () {
    return {
      search: '',
      loading: false,
      deleting: false,
      comments: [],
      headers: [
        {
          text: 'Comentario',
          align: 'start',
          value: 'content',
          width: '25%'
        },
        {
          text: 'Autor',
          value: 'author',
          width: '15%'
        },
        {
          text: 'Contenido',
          value: 'content_info',
          width: '20%'
        },
        {
          text: 'Fecha',
          value: 'createdAt',
          width: '15%'
        },
        {
          text: 'Estado',
          value: 'status',
          width: '10%'
        },
        {
          text: 'Acciones',
          value: 'actions',
          sortable: false,
          width: '15%'
        }
      ],
      viewDialog: false,
      deleteDialog: false,
      selectedComment: null,
      commentToDelete: null,
      snackbar: {
        show: false,
        message: '',
        color: 'success',
        timeout: 4000
      }
    }
  },

  computed: {
    filteredComments () {
      return this.comments
    }
  },

  mounted () {
    this.loadAllComments()
  },

  methods: {
    async loadAllComments () {
      try {
        this.loading = true

        // Obtener todos los comentarios del backend usando fetch directo
        const qs = require('qs')
        const query = qs.stringify({
          populate: ['author'],
          sort: ['createdAt:desc'],
          pagination: {
            pageSize: 1000 // Cargar muchos comentarios para admin
          }
        }, {
          encodeValuesOnly: true
        })

        const url = `${this.$config.API_STRAPI_ENDPOINT}comments?${query}`
        const token = this.$store.state.auth.token

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        const result = await response.json()

        if (response.ok && result.data) {
          const comments = result.data.map(comment => this.transformComment(comment))
          // Enriquecer comentarios con datos de contenido
          this.comments = await this.enrichCommentsWithContent(comments)
          this.showSnackbar('Comentarios cargados correctamente', 'success')
        } else {
          throw new Error(result.error?.message || 'Error al cargar comentarios')
        }
      } catch (error) {
        console.error('Error cargando comentarios:', error)
        this.showSnackbar('Error al cargar comentarios: ' + error.message, 'error')
      } finally {
        this.loading = false
      }
    },

    async enrichCommentsWithContent (comments) {
      const token = this.$store.state.auth.token

      // Separar comentarios por tipo
      const episodeComments = comments.filter(c => c.comment_type === 'episode')
      const serieComments = comments.filter(c => c.comment_type === 'serie')

      // Obtener IDs únicos
      const episodeIds = [...new Set(episodeComments.map(c => c.content_id))]
      const serieIds = [...new Set(serieComments.map(c => c.content_id))]

      // Crear mapas para datos enriquecidos
      const episodeDataMap = new Map()
      const serieDataMap = new Map()

      try {
        // Consultar episodios con sus series
        if (episodeIds.length > 0) {
          const qs = require('qs')
          const episodeQuery = qs.stringify({
            filters: {
              id: {
                $in: episodeIds
              }
            },
            populate: ['serie'],
            pagination: {
              pageSize: 1000
            }
          }, {
            encodeValuesOnly: true
          })

          const episodeUrl = `${this.$config.API_STRAPI_ENDPOINT}episodes?${episodeQuery}`
          const episodeResponse = await fetch(episodeUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (episodeResponse.ok) {
            const episodeResult = await episodeResponse.json()
            episodeResult.data?.forEach((episode) => {
              const episodeData = episode.attributes || episode
              const serieData = episodeData.serie?.data?.attributes || episodeData.serie

              episodeDataMap.set(episode.id, {
                episode_number: episodeData.episode_number,
                serie_title: serieData?.title || 'Serie desconocida',
                serie_url: serieData?.url || ''
              })
            })
          }
        }

        // Consultar series
        if (serieIds.length > 0) {
          const qs = require('qs')
          const serieQuery = qs.stringify({
            filters: {
              id: {
                $in: serieIds
              }
            },
            pagination: {
              pageSize: 1000
            }
          }, {
            encodeValuesOnly: true
          })

          const serieUrl = `${this.$config.API_STRAPI_ENDPOINT}series?${serieQuery}`
          const serieResponse = await fetch(serieUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })

          if (serieResponse.ok) {
            const serieResult = await serieResponse.json()
            serieResult.data?.forEach((serie) => {
              const serieData = serie.attributes || serie

              serieDataMap.set(serie.id, {
                title: serieData.title || 'Serie desconocida',
                url: serieData.url || ''
              })
            })
          }
        }
      } catch (error) {
        console.error('Error enriqueciendo comentarios:', error)
      }

      // Enriquecer comentarios con datos obtenidos
      return comments.map((comment) => {
        if (comment.comment_type === 'episode') {
          const episodeData = episodeDataMap.get(comment.content_id)
          if (episodeData) {
            return {
              ...comment,
              content_title: episodeData.serie_title,
              episode_info: episodeData.episode_number,
              serie_url: episodeData.serie_url,
              episode_number: episodeData.episode_number
            }
          }
        } else if (comment.comment_type === 'serie') {
          const serieData = serieDataMap.get(comment.content_id)
          if (serieData) {
            return {
              ...comment,
              content_title: serieData.title,
              serie_url: serieData.url
            }
          }
        }

        return comment
      })
    },

    transformComment (comment) {
      const data = comment.attributes || comment
      const authorData = data.author?.data?.attributes || data.author || {}

      return {
        id: comment.id,
        content: data.content || '',
        author: authorData.username || 'Usuario desconocido',
        comment_type: data.comment_type || 'unknown',
        content_id: data.content_id || '',
        createdAt: data.createdAt || comment.createdAt,
        is_deleted: data.is_deleted || false,
        is_edited: data.is_edited || false,
        likes: data.likes || 0
      }
    },

    viewComment (comment) {
      this.selectedComment = comment
      this.viewDialog = true
    },

    confirmDelete (comment) {
      this.commentToDelete = comment
      this.deleteDialog = true
    },

    async deleteComment () {
      if (!this.commentToDelete) { return }

      try {
        this.deleting = true

        const token = this.$store.state.auth.token
        const url = `${this.$config.API_STRAPI_ENDPOINT}comments/${this.commentToDelete.id}`

        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              is_deleted: true
            }
          })
        })

        if (response.ok) {
          // Actualizar el comentario en la lista local
          const commentIndex = this.comments.findIndex(c => c.id === this.commentToDelete.id)
          if (commentIndex !== -1) {
            this.comments[commentIndex].is_deleted = true
          }

          this.showSnackbar('Comentario eliminado correctamente', 'success')
          this.deleteDialog = false
          this.commentToDelete = null
        } else {
          const result = await response.json()
          throw new Error(result.error?.message || 'Error al eliminar comentario')
        }
      } catch (error) {
        console.error('Error eliminando comentario:', error)
        this.showSnackbar('Error al eliminar comentario: ' + error.message, 'error')
      } finally {
        this.deleting = false
      }
    },

    truncateText (text, maxLength) {
      if (!text) { return '' }
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    },

    formatDate (dateString) {
      if (!dateString) { return '' }
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES')
    },

    formatTime (dateString) {
      if (!dateString) { return '' }
      const date = new Date(dateString)
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    },

    formatDateTime (dateString) {
      if (!dateString) { return '' }
      const date = new Date(dateString)
      return date.toLocaleString('es-ES')
    },

    getContentTypeColor (type) {
      const colors = {
        episode: 'blue',
        serie: 'green',
        producer: 'orange',
        studio: 'purple'
      }
      return colors[type] || 'grey'
    },

    showSnackbar (message, color = 'success') {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.show = true
    },

    navigateToContent (comment) {
      if (!comment.serie_url) {
        this.showSnackbar('No se puede navegar: datos de contenido no disponibles', 'warning')
        return
      }

      let routePath = ''

      if (comment.comment_type === 'episode' && comment.episode_number) {
        // Navegar a episodio: /h/{url}/{episode_number}
        routePath = `/h/${comment.serie_url}/${comment.episode_number}`
      } else if (comment.comment_type === 'serie') {
        // Navegar a serie: /h/{url}
        routePath = `/h/${comment.serie_url}`
      }

      if (routePath) {
        // Abrir en nueva pestaña
        const url = this.$router.resolve({ path: routePath }).href
        window.open(url, '_blank')
      } else {
        this.showSnackbar('No se puede determinar la ruta de navegación', 'error')
      }
    }
  }
}
</script>

<style scoped>
.comment-content {
  max-width: 300px;
}

.v-data-table >>> .v-data-table__wrapper {
  overflow-x: auto;
}

 .headline {
   font-size: 1.25rem !important;
   font-weight: 500;
 }

 .content-link {
   cursor: pointer;
   transition: opacity 0.2s;
 }

 .content-link:hover {
   opacity: 0.8;
 }
</style>

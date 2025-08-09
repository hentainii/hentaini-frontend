<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="comment-item">
    <v-card
      :class="{ 'comment-deleted': commentData.is_deleted }"
      outlined
      flat
    >
      <v-card-text class="pb-2">
        <!-- Header del comentario -->
        <div class="d-flex align-start">
          <v-avatar size="40" class="mr-3">
            <v-img
              v-if="author?.avatar && !commentData.is_deleted"
              :src="authorAvatarUrl"
              :alt="author.username"
            />
            <v-icon v-else color="grey">
              mdi-account-circle
            </v-icon>
          </v-avatar>

          <div class="flex-grow-1">
            <!-- Información del autor y fecha -->
            <div class="d-flex align-center mb-1">
              <span class="font-weight-medium text-body-2 mr-2">
                {{ commentData.is_deleted ? $t('comments.deleted_user') : isAuthorAdmin ? '' : author?.username }}
              </span>

              <v-chip
                v-if="isAuthorAdmin && !commentData.is_deleted"
                x-small
                color="red"
                text-color="white"
                class="mr-2 admin-badge"
              >
                <v-icon left x-small>
                  mdi-shield-crown
                </v-icon>
                {{ $t('comments.admin') }}
              </v-chip>

              <span class="text-caption text--secondary">
                {{ formattedDate }}
              </span>

              <v-chip
                v-if="commentData.is_edited && !commentData.is_deleted"
                x-small
                outlined
                color="grey"
                class="ml-2"
              >
                {{ $t('comments.edited') }}
              </v-chip>
            </div>

            <!-- Contenido del comentario -->
            <div v-if="!isEditing" class="comment-content">
              <p
                v-if="!commentData.is_deleted"
                :class="{ 'text--disabled': commentData.is_deleted }"
                class="mb-2 text-body-2"
                v-html="formattedContent"
              />
            </div>

            <!-- Formulario de edición -->
            <div v-else class="edit-form mb-3">
              <v-textarea
                v-model="editContent"
                :rules="editRules"
                rows="3"
                outlined
                dense
                hide-details="auto"
                auto-grow
              />
              <div class="d-flex gap-2 mt-2">
                <v-btn
                  small
                  color="primary"
                  :loading="editLoading"
                  @click="saveEdit"
                >
                  {{ $t('common.save') }}
                </v-btn>
                <v-btn small text @click="cancelEdit">
                  {{ $t('common.cancel') }}
                </v-btn>
              </div>
            </div>

            <!-- Acciones del comentario -->
            <div v-if="!commentData.is_deleted" class="comment-actions">
              <div class="d-flex align-center">
                <!-- Botón de like -->
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      icon
                      small
                      :color="hasLiked ? 'red' : 'grey'"
                      :loading="likeLoading"
                      :disabled="!isAuthenticated"
                      v-bind="attrs"
                      v-on="on"
                      @click="handleToggleLike"
                    >
                      <v-icon>{{ hasLiked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ hasLiked ? $t('comments.remove_like') : $t('comments.like') }}</span>
                </v-tooltip>
                <span class="text-caption text--secondary mr-3">
                  {{ commentData.likes || 0 }}
                </span>

                <!-- Botón de responder -->
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      icon
                      small
                      color="primary"
                      :disabled="!isAuthenticated"
                      v-bind="attrs"
                      v-on="on"
                      @click="toggleReplyForm"
                    >
                      <v-icon>mdi-reply</v-icon>
                    </v-btn>
                  </template>
                  <span>{{ $t('comments.reply') }}</span>
                </v-tooltip>

                <!-- Indicador de respuestas (solo desktop) -->
                <span v-if="repliesCount > 0" class="text-caption text--secondary ml-2 hidden-xs-only">
                  {{ repliesCount }} {{ repliesCount === 1 ? $t('comments.reply') : $t('comments.replies') }}
                </span>

                <!-- Contador de respuestas compacto (solo móvil) -->
                <v-chip
                  v-if="repliesCount > 0"
                  x-small
                  color="grey darken-3"
                  class="ml-1 hidden-sm-and-up"
                >
                  {{ repliesCount }}
                </v-chip>

                <!-- Botones de editar/eliminar (solo para el autor o admin) -->
                <template v-if="canEdit">
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        small
                        color="grey"
                        class="ml-1"
                        v-bind="attrs"
                        v-on="on"
                        @click="startEdit"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('common.edit') }}</span>
                  </v-tooltip>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        small
                        color="error"
                        class="ml-1"
                        v-bind="attrs"
                        v-on="on"
                        @click="confirmDelete"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </template>
                    <span>{{ $t('common.delete') }}</span>
                  </v-tooltip>
                </template>
              </div>
            </div>

            <!-- Formulario de respuesta -->
            <div v-if="showReplyForm && !commentData.is_deleted" class="reply-form mt-3">
              <CommentForm
                :parent-id="comment.id"
                :loading="replyLoading"
                :error="replyError"
                :show-cancel="true"
                :is-reply="true"
                @submit="handleCreateReply"
                @cancel="showReplyForm = false"
                @clear-error="replyError = null"
              />
            </div>
          </div>
        </div>

        <!-- Respuestas -->
        <div v-if="hasReplies" class="replies mt-3 ml-7">
          <!-- Botón para cargar respuestas -->
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-if="showLoadRepliesButton"
                small
                :color="$vuetify.breakpoint.xsOnly ? 'primary' : 'primary'"
                :text="!$vuetify.breakpoint.xsOnly"
                :icon="$vuetify.breakpoint.xsOnly"
                class="mb-2"
                :loading="loadingReplies"
                v-bind="attrs"
                v-on="on"
                @click="loadCommentReplies"
              >
                <v-icon :left="!$vuetify.breakpoint.xsOnly" small>
                  mdi-comment-multiple-outline
                </v-icon>
                <span v-if="!$vuetify.breakpoint.xsOnly">
                  {{ $t('comments.show_replies', { count: repliesCount }) }}
                </span>
              </v-btn>
            </template>
            <span v-if="$vuetify.breakpoint.xsOnly">
              {{ $t('comments.show_replies', { count: repliesCount }) }}
            </span>
          </v-tooltip>

          <!-- Lista de respuestas -->
          <div v-if="showingReplies">
            <CommentItem
              v-for="reply in replies"
              :key="reply.id"
              :comment="reply"
              :is-reply="true"
              @reply-added="handleReplyAdded"
              @comment-edited="$emit('comment-edited')"
              @comment-deleted="$emit('comment-deleted')"
              @comment-liked="$emit('comment-liked')"
              @show-login="$emit('show-login')"
            />

            <!-- Mensaje si no hay respuestas cargadas -->
            <div v-if="replies.length === 0" class="text-center py-2 text--secondary">
              No se encontraron respuestas cargadas
            </div>

            <!-- Botón para ocultar respuestas -->
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn
                  small
                  :color="$vuetify.breakpoint.xsOnly ? 'grey' : 'grey'"
                  :text="!$vuetify.breakpoint.xsOnly"
                  :icon="$vuetify.breakpoint.xsOnly"
                  class="mt-2"
                  v-bind="attrs"
                  v-on="on"
                  @click="hideReplies"
                >
                  <v-icon :left="!$vuetify.breakpoint.xsOnly" small>
                    mdi-chevron-up
                  </v-icon>
                  <span v-if="!$vuetify.breakpoint.xsOnly">
                    {{ $t('comments.hide_replies') }}
                  </span>
                </v-btn>
              </template>
              <span v-if="$vuetify.breakpoint.xsOnly">
                {{ $t('comments.hide_replies') }}
              </span>
            </v-tooltip>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Diálogo de confirmación de eliminación -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title>{{ $t('comments.confirm_delete_title') }}</v-card-title>
        <v-card-text>
          {{ $t('comments.confirm_delete_message') }}
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn text @click="deleteDialog = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            :loading="deleteLoading"
            @click="handleDeleteComment"
          >
            {{ $t('common.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import CommentForm from './CommentForm.vue'

// Función helper para acceder a los datos del comentario independientemente de la estructura
const getCommentData = (comment) => {
  if (!comment) { return null }
  // Si tiene attributes, usar esa estructura (Strapi 4 estándar)
  if (comment.attributes) {
    return comment.attributes
  }
  // Si no tiene attributes, los datos están directamente en el objeto (configuración sin clave intermedia)
  return comment
}

// Función helper para acceder a datos relacionales
const getRelationData = (relation) => {
  if (!relation) { return null }
  // Si es estructura estándar con data
  if (relation.data) {
    return relation.data
  }
  // Si no tiene data wrapper, devolver directamente
  return relation
}

export default {
  name: 'CommentItem',

  components: {
    CommentForm
  },

  props: {
    comment: {
      type: Object,
      required: true
    },
    isReply: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      showReplyForm: false,
      showingReplies: false,
      loadingReplies: false,
      isEditing: false,
      editContent: '',
      editLoading: false,
      replyLoading: false,
      replyError: null,
      likeLoading: false,
      deleteDialog: false,
      deleteLoading: false,
      repliesCount: 0,
      editRules: [
        v => !!v || this.$t('validation.required'),
        v => (v && v.length >= 3) || this.$t('validation.min_length', { min: 3 }),
        v => (v && v.length <= 1000) || this.$t('validation.max_length', { max: 1000 })
      ]
    }
  },

  computed: {
    ...mapState(['auth']),
    ...mapGetters('comments', ['canEditComment', 'hasUserLiked', 'getRepliesByParentId']),

    isAuthenticated () {
      return this.auth && this.auth.id
    },

    // Datos del comentario usando helper
    commentData () {
      return getCommentData(this.comment)
    },

    author () {
      const authorRelation = getRelationData(this.commentData?.author)
      // Si el autor tiene estructura de Strapi con attributes
      if (authorRelation?.attributes) {
        return authorRelation.attributes
      }
      // Si el autor tiene estructura directa
      return authorRelation
    },

    authorAvatarUrl () {
      if (!this.author?.avatar) { return null }
      return `${this.$config.CDN_ENDPOINT}${this.author.avatar.url}`
    },

    formattedDate () {
      return this.$moment(this.commentData?.createdAt).fromNow()
    },

    formattedContent () {
      // Procesar el contenido para mostrar enlaces, menciones, etc.
      let content = this.commentData?.content || ''

      // Convertir URLs a enlaces
      content = content.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank" rel="noopener">$1</a>'
      )

      // Convertir saltos de línea a <br>
      content = content.replace(/\n/g, '<br>')

      return content
    },

    canEdit () {
      return this.canEditComment(this.comment)
    },

    hasLiked () {
      return this.hasUserLiked(this.comment)
    },

    isAuthorAdmin () {
      // Verificar si el autor del comentario es admin (level 2)
      return this.author?.level === 2
    },

    replies () {
      if (this.isReply) { return [] }
      return this.getRepliesByParentId(this.comment.id)
    },

    showLoadRepliesButton () {
      return !this.isReply && this.repliesCount > 0 && !this.showingReplies
    },

    hasReplies () {
      // Mostrar sección de respuestas si:
      // 1. Hay respuestas cargadas en el store O
      // 2. El botón de cargar respuestas debe mostrarse (hay respuestas pero no están cargadas)
      return !this.isReply && (this.replies.length > 0 || this.repliesCount > 0)
    }
  },

  mounted () {
    // Cargar estadísticas del comentario si no es una respuesta
    if (!this.isReply) {
      this.loadCommentStats()
    }
  },

  methods: {
    ...mapActions('comments', ['editComment', 'deleteComment', 'createReply', 'toggleLike', 'loadReplies', 'getCommentStats']),

    // Métodos para respuestas
    toggleReplyForm () {
      if (!this.isAuthenticated) {
        this.$emit('show-login')
        return
      }
      this.showReplyForm = !this.showReplyForm
      if (this.showReplyForm) {
        this.$nextTick(() => {
          const form = this.$el.querySelector('.reply-form')
          if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        })
      }
    },

    async handleCreateReply (replyData) {
      try {
        this.replyLoading = true
        this.replyError = null

        await this.createReply({
          parentId: this.comment.id,
          content: replyData.content
        })

        this.showReplyForm = false
        this.repliesCount += 1

        // Mostrar las respuestas automáticamente después de crear una
        if (!this.showingReplies) {
          await this.loadCommentReplies()
        }

        this.$emit('reply-added')
      } catch (error) {
        this.replyError = error.message || this.$t('comments.error_posting_reply')
      } finally {
        this.replyLoading = false
      }
    },

    async loadCommentReplies () {
      try {
        this.loadingReplies = true

        // Usar el método getReplies que funciona con query estándar
        const replies = await this.$store.dispatch('comments/getReplies', this.comment.id)

        // Agregar las respuestas al store si no están ya
        if (replies && Array.isArray(replies)) {
          replies.forEach((reply) => {
            this.$store.commit('comments/ADD_REPLY', reply)
          })
        }

        this.showingReplies = true
      } catch (error) {
        console.error('Error cargando respuestas:', error)
      } finally {
        this.loadingReplies = false
      }
    },

    hideReplies () {
      this.showingReplies = false
    },

    handleReplyAdded () {
      this.repliesCount += 1
      this.$emit('reply-added')
    },

    // Métodos para likes
    async handleToggleLike () {
      if (!this.isAuthenticated) {
        this.$emit('show-login')
        return
      }

      try {
        this.likeLoading = true
        const result = await this.toggleLike(this.comment.id)
        this.$emit('comment-liked', result)
      } catch (error) {
        console.error('Error en like:', error)
      } finally {
        this.likeLoading = false
      }
    },

    // Métodos para estadísticas
    async loadCommentStats () {
      try {
        const stats = await this.getCommentStats(this.comment.id)
        this.repliesCount = stats.repliesCount || 0
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      }
    },

    startEdit () {
      this.editContent = this.commentData?.content || ''
      this.isEditing = true
    },

    cancelEdit () {
      this.editContent = ''
      this.isEditing = false
    },

    async saveEdit () {
      if (!this.editContent.trim()) { return }

      try {
        this.editLoading = true

        await this.editComment({
          commentId: this.comment.id,
          content: this.editContent.trim()
        })

        this.isEditing = false
        this.$emit('comment-edited')
      } catch (error) {
        console.error('Error editando comentario:', error)
      } finally {
        this.editLoading = false
      }
    },

    confirmDelete () {
      this.deleteDialog = true
    },

    async handleDeleteComment () {
      try {
        this.deleteLoading = true

        await this.deleteComment(this.comment.id)

        this.deleteDialog = false
        this.$emit('comment-deleted')
      } catch (error) {
        console.error('Error eliminando comentario:', error)
      } finally {
        this.deleteLoading = false
      }
    }
  }
}
</script>

<style scoped>
.comment-item {
  margin-bottom: 12px;
}

.comment-deleted {
  opacity: 0.6;
}

.comment-content {
  line-height: 1.5;
}

.comment-content >>> a {
  color: #1976d2;
  text-decoration: none;
}

.comment-content >>> a:hover {
  text-decoration: underline;
}

.comment-actions {
  margin-top: 8px;
}

.replies {
  border-left: 2px solid rgba(255, 255, 255, 0.12);
  padding-left: 16px;
  margin-top: 12px;
}

.reply-form {
  margin-top: 12px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  border-left: 3px solid var(--v-primary-base);
}

.edit-form .gap-2 {
  gap: 8px;
}

/* Animaciones para respuestas */
.replies .comment-item {
  animation: fadeInReply 0.3s ease-out;
}

@keyframes fadeInReply {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Efectos hover para botones de like */
.v-btn.theme--light.red--text {
  transition: all 0.2s ease;
}

.v-btn.theme--light.red--text:hover {
  background-color: rgba(244, 67, 54, 0.08) !important;
}

/* Responsive para móviles */
@media (max-width: 600px) {
  .replies {
    margin-left: 0;
    padding-left: 12px;
    border-left-width: 2px;
  }

  .reply-form {
    margin-left: 0;
    padding: 8px;
  }

  .comment-actions .v-btn {
    min-width: 32px !important;
    width: 32px !important;
    height: 32px !important;
    padding: 0 !important;
    margin: 0 2px !important;
  }

  .comment-actions .v-btn .v-icon {
    font-size: 18px !important;
  }

  .comment-actions .text-caption {
    font-size: 0.7rem !important;
    margin-left: 4px !important;
    margin-right: 8px !important;
  }

  .comment-actions .d-flex {
    gap: 2px;
  }

  /* Contador de respuestas más compacto en móvil */
  .comment-actions .v-chip {
    height: 20px !important;
    font-size: 0.7rem !important;
  }

  /* Botones de respuestas en móvil */
  .replies .v-btn {
    min-width: 36px !important;
    height: 36px !important;
  }

  .replies .v-btn.v-btn--icon {
    width: 36px !important;
  }
}

/* Estados de carga */
.v-btn--loading {
  pointer-events: none;
}

/* Badge especial para admin */
.admin-badge {
  background: linear-gradient(45deg, #ff4444 0%, #ff6666 100%) !important;
  box-shadow: 0 2px 4px rgba(255, 68, 68, 0.3) !important;
  animation: adminGlow 2s ease-in-out infinite alternate;
}

@keyframes adminGlow {
  from {
    box-shadow: 0 2px 4px rgba(255, 68, 68, 0.3);
  }
  to {
    box-shadow: 0 2px 8px rgba(255, 68, 68, 0.5);
  }
}

/* Mejoras visuales */
.comment-item:hover {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.reply-form >>> .v-card {
  box-shadow: none !important;
  border: 1px solid rgba(0, 0, 0, 0.08);
}
</style>

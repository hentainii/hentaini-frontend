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
                {{ commentData.is_deleted ? $t('comments.deleted_user') : author?.username }}
              </span>

              <v-chip
                v-if="author?.role?.name === 'admin' && !commentData.is_deleted"
                x-small
                color="primary"
                text-color="white"
                class="mr-2"
              >
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
                <v-btn
                  icon
                  small
                  :color="hasLiked ? 'red' : 'grey'"
                  :loading="likeLoading"
                  :disabled="!isAuthenticated"
                  @click="handleToggleLike"
                >
                  <v-icon>{{ hasLiked ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
                </v-btn>
                <span class="text-caption text--secondary mr-3">
                  {{ commentData.likes || 0 }}
                </span>

                <!-- Botón de responder -->
                <v-btn
                  text
                  x-small
                  color="primary"
                  :disabled="!isAuthenticated"
                  @click="toggleReplyForm"
                >
                  <v-icon left small>
                    mdi-reply
                  </v-icon>
                  {{ $t('comments.reply') }}
                </v-btn>

                <!-- Indicador de respuestas -->
                <span v-if="repliesCount > 0" class="text-caption text--secondary ml-2">
                  {{ repliesCount }} {{ repliesCount === 1 ? $t('comments.reply') : $t('comments.replies') }}
                </span>

                <!-- Botones de editar/eliminar (solo para el autor o admin) -->
                <template v-if="canEdit">
                  <v-btn
                    text
                    x-small
                    color="grey"
                    class="ml-2"
                    @click="startEdit"
                  >
                    <v-icon left small>
                      mdi-pencil
                    </v-icon>
                    {{ $t('common.edit') }}
                  </v-btn>

                  <v-btn
                    text
                    x-small
                    color="error"
                    class="ml-2"
                    @click="confirmDelete"
                  >
                    <v-icon left small>
                      mdi-delete
                    </v-icon>
                    {{ $t('common.delete') }}
                  </v-btn>
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
        <div v-if="replies.length > 0 || showLoadRepliesButton" class="replies mt-3 ml-7">
          <!-- Botón para cargar respuestas -->
          <v-btn
            v-if="showLoadRepliesButton && !showingReplies"
            text
            small
            color="primary"
            class="mb-2"
            :loading="loadingReplies"
            @click="loadCommentReplies"
          >
            <v-icon left small>
              mdi-comment-multiple-outline
            </v-icon>
            {{ $t('comments.show_replies', { count: repliesCount }) }}
          </v-btn>

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

            <!-- Botón para ocultar respuestas -->
            <v-btn
              text
              x-small
              color="grey"
              class="mt-2"
              @click="hideReplies"
            >
              <v-icon left small>
                mdi-chevron-up
              </v-icon>
              {{ $t('comments.hide_replies') }}
            </v-btn>
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

    replies () {
      if (this.isReply) { return [] }
      return this.getRepliesByParentId(this.comment.id)
    },

    showLoadRepliesButton () {
      return !this.isReply && this.repliesCount > 0 && !this.showingReplies
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
        await this.loadReplies({ parentId: this.comment.id })
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
    min-width: auto !important;
    padding: 0 8px !important;
  }

  .comment-actions .text-caption {
    font-size: 0.7rem !important;
  }
}

/* Estados de carga */
.v-btn--loading {
  pointer-events: none;
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

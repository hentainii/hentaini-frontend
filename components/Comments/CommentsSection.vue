<template>
  <div class="comments-section">
    <!-- Header de la sección -->
    <div class="comments-header mb-4">
      <h2 class="text-h5 mb-2">
        {{ $t('comments.section_title') }}
        <v-chip v-if="totalComments > 0" color="primary" text-color="white" small class="ml-2">
          {{ totalComments }}
        </v-chip>
      </h2>

      <!-- Opciones de ordenamiento -->
      <div class="d-flex align-center justify-space-between">
        <v-select
          v-model="sortBy"
          :items="sortOptions"
          :label="$t('comments.sort_by')"
          dense
          outlined
          hide-details
          style="max-width: 200px"
          @change="refreshComments"
        />

        <v-btn
          icon
          :loading="loading"
          @click="refreshComments"
        >
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Formulario para nuevo comentario -->
    <div class="new-comment-form mb-4">
      <CommentForm
        :loading="createLoading"
        :error="createError"
        @submit="handleCreateComment"
        @show-login="$emit('show-login')"
        @clear-error="createError = null"
      />
    </div>

    <!-- Estado de carga inicial -->
    <div v-if="loading && comments.length === 0" class="text-center py-8">
      <v-progress-circular indeterminate size="50" />
      <p class="mt-3 text--secondary">
        {{ $t('comments.loading') }}
      </p>
    </div>

    <!-- Lista de comentarios -->
    <div v-else-if="comments.length > 0" class="comments-list">
      <CommentItem
        v-for="comment in topLevelComments"
        :key="comment.id"
        :comment="comment"
        @reply-added="handleReplyAdded"
        @comment-edited="handleCommentEdited"
        @comment-deleted="handleCommentDeleted"
        @comment-liked="handleCommentLiked"
        @show-login="$emit('show-login')"
      />

      <!-- Botón cargar más -->
      <div v-if="hasMore" class="text-center mt-4">
        <v-btn
          outlined
          color="primary"
          :loading="loadingMore"
          @click="loadMoreComments"
        >
          {{ $t('comments.load_more') }}
        </v-btn>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state text-center py-8">
      <v-icon size="64" color="grey lighten-1">
        mdi-comment-outline
      </v-icon>
      <h3 class="text-h6 mt-3 mb-2 text--secondary">
        {{ $t('comments.no_comments_title') }}
      </h3>
      <p class="text--secondary mb-4">
        {{ $t('comments.no_comments_message') }}
      </p>

      <template v-if="isAuthenticated">
        <v-btn color="primary" @click="focusCommentForm">
          {{ $t('comments.be_first_to_comment') }}
        </v-btn>
      </template>
      <template v-else>
        <v-btn color="primary" @click="$emit('show-login')">
          {{ $t('comments.login_to_comment') }}
        </v-btn>
      </template>
    </div>

    <!-- Error global -->
    <v-alert
      v-if="error && !createError"
      type="error"
      dismissible
      class="mt-4"
      @input="clearError"
    >
      {{ error }}
    </v-alert>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="showSnackbar"
      :color="snackbarColor"
      timeout="3000"
      bottom
    >
      {{ snackbarMessage }}
      <template #action="{ attrs }">
        <v-btn text v-bind="attrs" @click="showSnackbar = false">
          {{ $t('common.close') }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import CommentForm from './CommentForm.vue'
import CommentItem from './CommentItem.vue'

export default {
  name: 'CommentsSection',

  components: {
    CommentForm,
    CommentItem
  },

  props: {
    contentType: {
      type: String,
      required: true
    },
    contentId: {
      type: [Number, String],
      required: true
    }
  },

  data () {
    return {
      createLoading: false,
      createError: null,
      loadingMore: false,
      sortBy: 'newest',
      page: 1,
      pageSize: 10,
      hasMore: false,

      // Snackbar
      showSnackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',

      sortOptions: [
        { text: this.$t('comments.sort_newest'), value: 'newest' },
        { text: this.$t('comments.sort_oldest'), value: 'oldest' },
        { text: this.$t('comments.sort_most_liked'), value: 'likes' }
      ]
    }
  },

  computed: {
    ...mapState('comments', ['comments', 'loading', 'error', 'totalComments']),
    ...mapState(['auth']),
    ...mapGetters('comments', ['topLevelComments']),

    isAuthenticated () {
      return this.auth && this.auth.id
    }
  },

  watch: {
    contentType: {
      immediate: true,
      handler () {
        this.initializeComments()
      }
    },

    contentId: {
      immediate: true,
      handler () {
        this.initializeComments()
      }
    }
  },

  mounted () {
    // Cargar comentarios iniciales
    this.initializeComments()
  },

  methods: {
    ...mapActions('comments', [
      'loadComments',
      'createComment',
      'clearError'
    ]),

    async initializeComments () {
      if (!this.contentType || !this.contentId) { return }

      this.page = 1
      this.hasMore = false

      await this.loadComments({
        contentType: this.contentType,
        contentId: this.contentId
      })

      this.checkHasMore()
    },

    async refreshComments () {
      await this.initializeComments()
      this.showNotification(this.$t('comments.refreshed'), 'info')
    },

    async handleCreateComment (commentData) {
      try {
        this.createLoading = true
        this.createError = null

        await this.createComment({
          content: commentData.content,
          contentType: this.contentType,
          contentId: this.contentId
        })

        this.showNotification(this.$t('comments.comment_posted'), 'success')

        // Scroll al nuevo comentario
        this.$nextTick(() => {
          const commentsSection = this.$el.querySelector('.comments-list')
          if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' })
          }
        })
      } catch (error) {
        this.createError = error.message || this.$t('comments.error_posting')
      } finally {
        this.createLoading = false
      }
    },

    loadMoreComments () {
      try {
        this.loadingMore = true
        this.page += 1

        // Aquí implementarías la lógica de paginación
        // Por ahora solo simulo el comportamiento

        this.checkHasMore()
      } catch (error) {
        this.showNotification(this.$t('comments.error_loading_more'), 'error')
      } finally {
        this.loadingMore = false
      }
    },

    checkHasMore () {
      // Calcular si hay más comentarios disponibles
      const loadedComments = this.comments.length
      const totalComments = this.totalComments

      this.hasMore = loadedComments < totalComments && totalComments > this.pageSize
    },

    focusCommentForm () {
      const commentForm = this.$el.querySelector('.new-comment-form')
      if (commentForm) {
        commentForm.scrollIntoView({ behavior: 'smooth' })

        // Intentar hacer focus en el textarea
        this.$nextTick(() => {
          const textarea = commentForm.querySelector('textarea')
          if (textarea) {
            textarea.focus()
          }
        })
      }
    },

    // Event handlers
    handleReplyAdded () {
      this.showNotification(this.$t('comments.reply_posted'), 'success')
    },

    handleCommentEdited () {
      this.showNotification(this.$t('comments.comment_edited'), 'success')
    },

    handleCommentDeleted () {
      this.showNotification(this.$t('comments.comment_deleted'), 'info')
    },

    handleCommentLiked () {
      // No mostrar notificación para likes para no ser molesto
    },

    showNotification (message, color = 'success') {
      this.snackbarMessage = message
      this.snackbarColor = color
      this.showSnackbar = true
    }
  }
}
</script>

<style scoped>
.comments-section {
  max-width: 100%;
  margin: 0 auto;
}

.comments-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 16px;
}

.comments-list {
  min-height: 200px;
}

.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.new-comment-form {
  position: relative;
}

/* Responsive */
@media (max-width: 600px) {
  .comments-header .d-flex {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .comments-header .v-select {
    max-width: 100%;
  }
}
</style>

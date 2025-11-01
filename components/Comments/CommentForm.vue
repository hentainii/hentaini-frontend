<template>
  <v-card class="comment-form" outlined>
    <v-card-text>
      <div v-if="!isAuthenticated" class="text-center pa-4">
        <p class="mb-3">
          {{ $t('comments.login_required') }}
        </p>
        <v-btn color="primary" @click="$emit('show-login')">
          {{ $t('auth.login') }}
        </v-btn>
      </div>

      <div v-else>
        <v-form ref="form" v-model="valid" @submit.prevent="submitComment">
          <v-textarea
            v-model="content"
            :label="dynamicPlaceholder"
            :rules="contentRules"
            :loading="loading"
            :disabled="loading"
            rows="4"
            counter="1000"
            outlined
            hide-details="auto"
            class="mb-3"
          />

          <div class="d-flex justify-space-between align-center">
            <div class="d-flex align-center">
              <v-avatar size="32" class="mr-2">
                <v-img
                  v-if="currentUser?.avatar"
                  :src="avatarUrl"
                  :alt="currentUser.username"
                />
                <v-icon v-else>
                  mdi-account-circle
                </v-icon>
              </v-avatar>
              <div class="d-flex align-center">
                <span class="text-caption text--secondary">
                  {{ $t('comments.posting_as') }} {{ currentUser?.username }}
                </span>
                <v-chip
                  v-if="isCurrentUserAdmin"
                  x-small
                  color="red"
                  text-color="white"
                  class="ml-2 admin-badge"
                >
                  <v-icon left x-small>
                    mdi-shield-crown
                  </v-icon>
                  <span class="d-none d-md-inline">{{ $t('comments.admin') }}</span>
                </v-chip>
              </div>
            </div>

            <div class="d-flex gap-2">
              <v-btn
                v-if="showCancel"
                text
                :disabled="loading"
                @click="cancel"
              >
                {{ $t('common.cancel') }}
              </v-btn>

              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="!valid || !content.trim()"
              >
                <v-icon left>
                  mdi-send
                </v-icon>
                <span class="d-none d-md-inline">{{ dynamicSubmitText }}</span>
              </v-btn>
            </div>
          </div>
        </v-form>
      </div>
    </v-card-text>

    <!-- Error Alert -->
    <v-alert
      v-if="error"
      type="error"
      dismissible
      class="ma-3 mt-0"
      @input="$emit('clear-error')"
    >
      {{ error }}
    </v-alert>
  </v-card>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'CommentForm',

  props: {
    placeholder: {
      type: String,
      default () {
        return this.$t('comments.write_comment')
      }
    },
    submitText: {
      type: String,
      default () {
        return this.$t('comments.post_comment')
      }
    },
    showCancel: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },
    parentId: {
      type: [Number, String],
      default: null
    },
    isReply: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      valid: false,
      content: '',
      contentRules: [
        v => !!v || this.$t('validation.required'),
        v => (v && v.length >= 3) || this.$t('validation.min_length', { min: 3 }),
        v => (v && v.length <= 1000) || this.$t('validation.max_length', { max: 1000 }),
        (v) => {
          if (!v) { return true }
          const urlRegex = /(https?:\/\/|www\.)\S+|\b[a-z0-9.-]+\.[a-z]{2,}(?:\/\S*)?/i
          return !urlRegex.test(v) || 'Urls are not allowed'
        }
      ]
    }
  },

  computed: {
    ...mapState(['auth']),

    currentUser () {
      return this.auth
    },

    isAuthenticated () {
      return this.auth && this.auth.id
    },

    isCurrentUserAdmin () {
      // Verificar si el usuario actual es admin (level 2)
      return this.currentUser?.level === 2
    },

    avatarUrl () {
      if (!this.currentUser?.avatar) { return null }
      return `${this.$config.CDN_ENDPOINT}${this.currentUser.avatar.url}`
    },

    // Textos dinámicos para respuestas
    dynamicPlaceholder () {
      if (this.isReply) {
        return this.placeholder || this.$t('comments.write_reply')
      }
      return this.placeholder || this.$t('comments.write_comment')
    },

    dynamicSubmitText () {
      if (this.isReply) {
        return this.submitText || this.$t('comments.post_reply')
      }
      return this.submitText || this.$t('comments.post_comment')
    }
  },

  methods: {
    submitComment () {
      if (!this.$refs.form.validate()) { return }

      const commentData = {
        content: this.content.trim()
      }

      if (this.parentId) {
        commentData.parentId = this.parentId
      }

      this.$emit('submit', commentData)

      // Limpiar el formulario después del envío
      this.content = ''
      this.$refs.form.resetValidation()
    },

    cancel () {
      this.content = ''
      this.$refs.form.resetValidation()
      this.$emit('cancel')
    },

    focus () {
      this.$nextTick(() => {
        const textarea = this.$el.querySelector('textarea')
        if (textarea) {
          textarea.focus()
        }
      })
    }
  }
}
</script>

<style scoped>
.comment-form {
  margin-bottom: 16px;
}

.comment-form .v-textarea {
  font-size: 14px;
}

.gap-2 {
  gap: 8px;
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
</style>

<template>
  <v-dialog
    :value="visible"
    max-width="400"
    persistent
    :fullscreen="$vuetify.breakpoint.xsOnly"
    @input="$emit('close')"
  >
    <v-card class="rating-modal">
      <v-card-title class="text-center pb-2">
        <div class="w-100">
          <h3 class="headline mb-2">
            {{ $t('rating.modal.title') }}
          </h3>
          <p class="subtitle-1 grey--text text--darken-1 mb-0">
            {{ serie ? serie.title : '' }}
          </p>
        </div>
      </v-card-title>

      <v-card-text class="text-center py-4">
        <v-alert
          v-if="alert.show"
          :type="alert.type"
          dismissible
          class="mb-4"
          @input="alert.show = false"
        >
          {{ alert.message }}
        </v-alert>

        <div class="rating-section">
          <p class="body-1 mb-4">
            {{ $t('rating.modal.instruction') }}
          </p>

          <StarRating
            v-model="selectedRating"
            :size="56"
            color="#FFD700"
            empty-color="#E0E0E0"
          />

          <div v-if="selectedRating > 0" class="rating-text mt-3">
            <p class="body-2 grey--text">
              {{ $t('rating.modal.selected') }}:
              <span class="font-weight-bold primary--text">
                {{ selectedRating }} {{ $t('rating.stars', selectedRating) }}
              </span>
            </p>
          </div>

          <div v-if="currentUserRating > 0" class="current-rating mt-2">
            <p class="caption grey--text text--darken-1">
              {{ $t('rating.modal.current_rating') }}: {{ currentUserRating }} {{ $t('rating.stars', currentUserRating) }}
            </p>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-row no-gutters>
          <v-col cols="6" class="pr-2">
            <v-btn
              block
              outlined
              color="grey"
              :disabled="loading"
              @click="$emit('close')"
            >
              {{ $t('common.cancel') }}
            </v-btn>
          </v-col>
          <v-col cols="6" class="pl-2">
            <v-btn
              block
              color="primary"
              :disabled="selectedRating === 0 || loading"
              :loading="loading"
              @click="handleSubmitRating"
            >
              {{ $t('rating.modal.submit') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import StarRating from './StarRating.vue'

export default {
  name: 'SerieRatingModal',
  components: {
    StarRating
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    serie: {
      type: Object,
      required: true
    },
    userRating: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      selectedRating: 0,
      loading: false,
      alert: {
        show: false,
        type: 'success',
        message: ''
      }
    }
  },
  computed: {
    ...mapGetters('ratings', ['isLoading']),
    currentUserRating () {
      return this.userRating
    }
  },
  watch: {
    visible (newVal) {
      if (newVal) {
        this.selectedRating = this.currentUserRating
      }
    },
    userRating (newVal) {
      this.selectedRating = newVal
    }
  },
  methods: {
    ...mapActions('ratings', ['submitRating', 'removeRating']),
    async handleSubmitRating () {
      try {
        this.loading = true

        const userId = this.$store.state.auth.id
        if (!userId) {
          this.showAlert('error', this.$t('auth.login_required'))
          return
        }

        await this.submitRating({
          serieId: this.serie.id,
          rating: this.selectedRating,
          userId
        })

        this.showAlert('success', this.$t('rating.modal.success'))
        this.$emit('rated', {
          serieId: this.serie.id,
          rating: this.selectedRating
        })
        this.$emit('close')
      } catch (error) {
        console.error('Error submitting rating:', error)
        this.showAlert('error', this.$t('rating.modal.error'))
      } finally {
        this.loading = false
      }
    },

    async handleRemoveRating () {
      try {
        this.loading = true

        const userId = this.$store.state.auth.id
        if (!userId) {
          this.showAlert('error', this.$t('auth.login_required'))
          return
        }

        await this.removeRating({
          serieId: this.serie.id,
          userId
        })

        this.showAlert('success', this.$t('rating.modal.removed'))
        this.$emit('rated', {
          serieId: this.serie.id,
          rating: 0
        })
        this.$emit('close')
      } catch (error) {
        console.error('Error removing rating:', error)
        this.showAlert('error', this.$t('rating.modal.error'))
      } finally {
        this.loading = false
      }
    },

    showAlert (type, message) {
      this.alert = {
        show: true,
        type,
        message
      }
    }
  }
}
</script>

<style scoped>
.rating-modal {
  border-radius: 16px;
}

.rating-section {
  padding: 16px 0;
}

.rating-text {
  min-height: 24px;
}

.current-rating {
  min-height: 20px;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .rating-modal {
    border-radius: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .rating-section {
    padding: 24px 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>

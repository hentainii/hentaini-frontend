<template>
  <div class="reactions-bar">
    <div class="reactions-container">
      <!-- Botones de reacción -->
      <div class="reaction-buttons">
        <div
          v-for="reaction in reactionTypes"
          :key="reaction.type"
          class="reaction-wrapper"
        >
          <v-btn
            :class="[
              'reaction-btn',
              { 'reaction-active': userReaction && userReaction.reaction_type === reaction.type },
              { 'reaction-clicked': clickedReaction === reaction.type }
            ]"
            :disabled="loading"
            fab
            small
            @click="handleReactionClick(reaction.type)"
          >
            <span
              class="reaction-img"
              :style="{
                backgroundPositionX: `-${reaction.offset}px`
              }"
            />
          </v-btn>
          <div v-if="reactionStats[reaction.type] > 0" class="reaction-count">
            {{ reactionStats[reaction.type] }}
          </div>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div v-if="error" class="error-message">
        <v-alert
          type="error"
          dense
          outlined
          dismissible
          @click:close="clearError"
        >
          {{ error }}
        </v-alert>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReactionsBar',

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
      clickedReaction: null,
      reactionTypes: [
        {
          type: 'like',
          label: 'reactions.like',
          offset: 0
        },
        {
          type: 'love',
          label: 'reactions.love',
          offset: 100
        },
        {
          type: 'wow',
          label: 'reactions.wow',
          offset: 202
        },
        {
          type: 'dislike',
          label: 'reactions.dislike',
          offset: 308
        },
        {
          type: 'sad',
          label: 'reactions.sad',
          offset: 410
        }
      ]
    }
  },

  computed: {
    reactionStats () {
      return this.$store.getters['reactions/getReactionStats']
    },

    userReaction () {
      const reaction = this.$store.getters['reactions/getUserReaction']
      return reaction ? (reaction.attributes || reaction) : null
    },

    loading () {
      return this.$store.state.reactions.loading
    },

    error () {
      return this.$store.state.reactions.error
    },

    isAuthenticated () {
      return this.$store.state.auth && this.$store.state.auth.token
    }
  },

  async mounted () {
    await this.loadReactions()
  },

  methods: {
    async loadReactions () {
      try {
        await this.$store.dispatch('reactions/loadReactions', {
          contentType: this.contentType,
          contentId: this.contentId
        })
      } catch (error) {
        console.error('Error loading reactions:', error)
      }
    },

    async handleReactionClick (reactionType) {
      if (!this.isAuthenticated) {
        this.$emit('show-login')
        return
      }

      // Activar animación de click
      this.clickedReaction = reactionType
      setTimeout(() => {
        this.clickedReaction = null
      }, 300)

      try {
        await this.$store.dispatch('reactions/toggleReaction', {
          contentType: this.contentType,
          contentId: this.contentId,
          reactionType
        })
      } catch (error) {
        console.error('Error toggling reaction:', error)
      }
    },

    clearError () {
      this.$store.dispatch('reactions/clearError')
    }
  }
}
</script>

<style scoped>
.reactions-bar {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #2a2a2a;
  border-radius: 12px;
  border: 1px solid #3a3a3a;
}

.reactions-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reaction-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.reaction-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.reaction-btn {
  width: 100px !important;
  height: 100px !important;
  border-radius: 50% !important;
  background-color: #3a3a3a !important;
  border: 2px solid #4a4a4a !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  position: relative !important;
  overflow: visible !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reaction-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
  background-color: #4a4a4a !important;
  border-color: #5a5a5a !important;
}

.reaction-btn:before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.reaction-btn:hover:before {
  width: 100%;
  height: 100%;
}

.reaction-active {
  background-color: var(--v-primary-base) !important;
  border-color: var(--v-primary-base) !important;
  transform: scale(1.1) !important;
  box-shadow: 0 4px 20px rgba(74, 158, 255, 0.4) !important;
}

.reaction-active:hover {
  background-color: var(--v-primary-darken1) !important;
  transform: translateY(-2px) scale(1.15) !important;
}

.reaction-img {
  display: block;
  width: 83px;
  height: 80px;
  background-image: url('/img/reactions.webp');
  background-repeat: no-repeat;
  background-size: 600px 80px;
  background-position-y: 0;
  background-position-x: 0;
  margin: 0 auto;
  transition: all 0.3s ease;
}

.reaction-btn:hover .reaction-img {
  transform: scale(1.1);
}

.reaction-active .reaction-img {
  animation: bounce 0.6s ease;
}

/* Animación de click */
.reaction-clicked {
  animation: clickPulse 0.3s ease-out !important;
}

@keyframes clickPulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1.1);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-6px);
  }
  60% {
    transform: translateY(-4px);
  }
}

.reaction-count {
  font-size: 16px;
  font-weight: bold;
  color: #e0e0e0;
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px 12px;
  border-radius: 16px;
  min-width: 28px;
  text-align: center;
  transition: all 0.3s ease;
}

.reaction-wrapper:hover .reaction-count {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.error-message {
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 900px) {
  .reaction-btn {
    width: 80px !important;
    height: 80px !important;
  }
  .reaction-img {
    width: 69px;
    height: 60px;
    background-size: 500px 60px;
  }
}

@media (max-width: 600px) {
  .reaction-buttons {
    gap: 8px;
  }
  .reaction-btn {
    width: 60px !important;
    height: 60px !important;
  }
  .reaction-img {
    width: 40px;
    height: 75px;
    background-size: 1080px 151px;
  }
  .reaction-count {
    font-size: 12px;
    padding: 2px 8px;
  }
}

@media (max-width: 400px) {
  .reactions-bar {
    padding: 12px;
  }
  .reaction-btn {
    width: 44px !important;
    height: 44px !important;
  }
  .reaction-img {
    width: 28px;
    height: 53px;
    background-size: 1080px 151px;
  }
  .reaction-count {
    font-size: 10px;
    padding: 1px 4px;
  }
}
</style>

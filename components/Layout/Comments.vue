<template>
  <div style="width:100%;">
    <!-- Alert para login requerido -->
    <v-alert
      v-if="showLoginAlert"
      type="info"
      dense
      outlined
      dismissible
      transition="slide-y-transition"
      class="login-alert mb-3"
      @click:close="showLoginAlert = false"
    >
      <v-icon small class="mr-2">
        mdi-account-alert
      </v-icon>
      {{ $t('auth.login_required_to_comment') }}
    </v-alert>

    <!-- Barra de reacciones -->
    <ReactionsBar
      :content-type="contentType"
      :content-id="contentId"
      @show-login="handleShowLogin"
    />

    <!-- Nuevo sistema de comentarios propio -->
    <CommentsSection
      :content-type="contentType"
      :content-id="contentId"
      @show-login="handleShowLogin"
    />
  </div>
</template>

<script>
import CommentsSection from '~/components/Comments/CommentsSection.vue'
import ReactionsBar from '~/components/Comments/ReactionsBar.vue'

export default {
  name: 'Comments',

  components: {
    CommentsSection,
    ReactionsBar
  },

  props: {
    contentType: {
      type: String,
      default: 'episode'
    },
    contentId: {
      type: [Number, String],
      required: true
    }
  },

  data () {
    return {
      showLoginAlert: false
    }
  },

  methods: {
    handleShowLogin () {
      // Emitir evento al componente padre para mostrar modal de login
      this.$emit('show-login')

      // Mostrar alert de login requerido
      this.showLoginAlert = true

      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        this.showLoginAlert = false
      }, 5000)

      // Alternativamente, redirigir a página de login
      // this.$router.push('/auth/login')
    }
  }
}
</script>

<style scoped>
.login-alert {
  background-color: #2a2a2a !important;
  border-color: #4a9eff !important;
  color: #e0e0e0 !important;
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
}

.login-alert .v-icon {
  color: #4a9eff !important;
}

/* Transición suave */
.slide-y-transition-enter-active,
.slide-y-transition-leave-active {
  transition: all 0.3s ease;
}

.slide-y-transition-enter,
.slide-y-transition-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

/* Responsive */
@media (max-width: 600px) {
  .login-alert {
    max-width: 95%;
    margin: 0 auto;
  }
}
</style>

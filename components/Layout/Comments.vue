<template>
  <div class="comments-wrapper" style="width:100%;">
    <h1>{{ $t('episode.comments_section_header') }}</h1>

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

export default {
  name: 'Comments',

  components: {
    CommentsSection
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

  methods: {
    handleShowLogin () {
      // Emitir evento al componente padre para mostrar modal de login
      this.$emit('show-login')

      // Alternativamente, redirigir a página de login
      // this.$router.push('/auth/login')

      // O mostrar un snackbar pidiendo que inicie sesión
      this.$store.commit('snackbar/SHOW', {
        message: this.$t('auth.login_required_to_comment'),
        color: 'info',
        timeout: 5000
      })
    }
  }
}
</script>

<style scoped>
.comments-wrapper {
  margin-top: 2rem;
  padding: 1rem 0;
}

.comments-wrapper h1 {
  margin-bottom: 1.5rem;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}
</style>

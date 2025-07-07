<template>
  <div>
    <CommentsManagement />
  </div>
</template>

<script>
import CommentsManagement from '~/components/Panel/CommentsManagement.vue'

export default {
  name: 'PanelCommentsPage',

  components: {
    CommentsManagement
  },

  layout: 'panel',

  middleware: 'authenticated',

  head () {
    return {
      title: 'Administración de Comentarios - Hentaini Panel',
      meta: [
        {
          hid: 'description',
          name: 'description',
          content: 'Panel de administración de comentarios para Hentaini'
        }
      ]
    }
  }
}
</script>

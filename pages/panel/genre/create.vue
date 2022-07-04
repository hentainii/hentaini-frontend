<template>
  <div>
    <v-app>
      <v-main>
        <CreateGenre />
      </v-main>
    </v-app>
  </div>
</template>

<script>
import CreateGenre from '../../../components/Create/CreateGenre'
export default {
  layout: 'panel',
  middleware: 'authenticated',
  components: {
    CreateGenre
  },
  data () {
    return {
    }
  }
}
</script>

<style>

</style>

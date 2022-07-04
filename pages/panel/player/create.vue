<template>
  <div>
    <v-app>
      <v-main>
        <CreatePlayer />
      </v-main>
    </v-app>
  </div>
</template>

<script>
import CreatePlayer from '../../../components/Create/CreatePlayer'
export default {
  layout: 'panel',
  middleware: 'authenticated',
  components: {
    CreatePlayer
  },
  data () {
    return {
    }
  }
}
</script>

<style>

</style>

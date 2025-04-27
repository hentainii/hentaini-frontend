<template>
  <v-app>
    <v-main>
      <CreateCategory />
    </v-main>
  </v-app>
</template>

<script>
import CreateCategory from '../../../components/Create/CreateCategory'
export default {
  layout: 'panel',
  middleware: 'authenticated',
  components: {
    CreateCategory
  },
  data () {
    return {
    }
  }
}
</script>

<style>

</style>

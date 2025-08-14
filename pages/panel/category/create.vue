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
  components: {
    CreateCategory
  },
  layout: 'panel',
  middleware: 'authenticated',
  data () {
    return {
    }
  }
}
</script>

<style>

</style>

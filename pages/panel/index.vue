<template>
  <v-app>
    <v-main>
      <Dashboard />
    </v-main>
  </v-app>
</template>

<script>
import Dashboard from '../../components/Dashboard/Dashboard'
export default {
  layout: 'panel',
  middleware: 'authenticated',
  components: {
    Dashboard
  },
  data () {
    return {
    }
  }
}
</script>

<style>

</style>

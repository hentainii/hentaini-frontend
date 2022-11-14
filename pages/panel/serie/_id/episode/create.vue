<template>
  <v-app>
    <v-main>
      <CreateEpisode />
    </v-main>
  </v-app>
</template>

<script>
export default {
  layout: 'panel',
  middleware: 'authenticated',
  data () {
    return {
    }
  },
  head () {
    return {
      title: 'Create Episode | Hentaini'
    }
  }
}
</script>

<style>

</style>

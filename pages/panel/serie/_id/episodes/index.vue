<template>
  <v-app>
    <v-main>
      <EpisodeList />
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
      title: 'Episode List | Hentaini'
    }
  }
}
</script>

<style>

</style>

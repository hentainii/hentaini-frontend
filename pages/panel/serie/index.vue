<template>
  <v-app>
    <v-main>
      <SerieList />
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
      title: 'Series | Hentaini'
    }
  }
}
</script>

<style>

</style>

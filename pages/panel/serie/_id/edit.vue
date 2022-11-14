<template>
  <v-app>
    <v-main>
      <EditSerieEdit />
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
      title: 'Edit Serie | Hentaini'
    }
  }
}
</script>

<style>

</style>

<template>
  <v-app>
    <v-main>
      <EditEpisode />
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
  }
}
</script>

<style>

</style>

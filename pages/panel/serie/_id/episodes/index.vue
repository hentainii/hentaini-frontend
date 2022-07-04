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
  }
}
</script>

<style>

</style>

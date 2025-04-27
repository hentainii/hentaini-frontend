<template>
  <EditEpisode />
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
      title: 'Edit Episode | Hentaini'
    }
  }
}
</script>

<style>

</style>

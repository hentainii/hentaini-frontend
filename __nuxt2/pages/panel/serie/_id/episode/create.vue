<template>
  <CreateEpisode />
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

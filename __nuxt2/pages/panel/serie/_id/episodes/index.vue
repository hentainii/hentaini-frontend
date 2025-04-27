<template>
  <EpisodeList />
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

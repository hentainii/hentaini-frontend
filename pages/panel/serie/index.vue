<template>
  <SerieList />
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

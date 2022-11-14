<template>
  <CreateSerie />
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
      title: 'Create Serie | Hentaini'
    }
  }
}
</script>

<style>

</style>

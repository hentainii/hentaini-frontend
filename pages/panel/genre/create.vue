<template>
  <CreateGenre />
</template>

<script>
import CreateGenre from '../../../components/Create/CreateGenre'
export default {
  components: {
    CreateGenre
  },
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

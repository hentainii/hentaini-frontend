<template>
  <CreatePlayer />
</template>

<script>
import CreatePlayer from '../../../components/Create/CreatePlayer'
export default {
  components: {
    CreatePlayer
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

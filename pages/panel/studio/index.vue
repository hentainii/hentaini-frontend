<template>
  <StudioManagement />
</template>

<script>
import StudioManagement from '../../../components/Panel/StudioManagement'
export default {
  components: {
    StudioManagement
  },
  layout: 'panel',
  middleware: 'authenticated',
  head () {
    return {
      title: 'Studio Management - Panel'
    }
  }
}
</script>

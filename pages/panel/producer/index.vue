<template>
  <ProducerManagement />
</template>

<script>
import ProducerManagement from '../../../components/Panel/ProducerManagement'
export default {
  components: {
    ProducerManagement
  },
  layout: 'panel',
  middleware: 'authenticated',
  head () {
    return {
      title: 'Producer Management - Panel'
    }
  }
}
</script>

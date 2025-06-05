<template>
  <StudioProducerLinking />
</template>

<script>
import StudioProducerLinking from '../../../components/Panel/StudioProducerLinking'
export default {
  components: {
    StudioProducerLinking
  },
  layout: 'panel',
  middleware: 'authenticated',
  head () {
    return {
      title: 'Studio-Producer Linking - Panel'
    }
  }
}
</script>

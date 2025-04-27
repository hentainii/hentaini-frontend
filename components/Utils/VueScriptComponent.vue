<template>
  <div :id="compId" />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import postscribe from 'postscribe'

const props = defineProps({
  script: {
    type: String,
    default: ''
  }
})

// Genera un id único para el div
const compId = `vue-script-${Math.random().toString(36).substr(2, 9)}`

onMounted(() => {
  postscribe(`#${compId}`, props.script, {
    done: () => {}
  })
})
</script>

<style scoped>

</style>

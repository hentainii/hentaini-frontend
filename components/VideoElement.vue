<template>
  <div style="position:relative;overflow: hidden;padding-top:56.25%" class="rounded-lg">
    <iframe
      width="100%"
      height="100%"
      :src="src"
      frameborder="0"
      noresize
      scrolling="no"
      allowfullscreen
      style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"
    />
  </div>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      default: ''
    }
  },
  data: () => {
    return {
    }
  }
}
</script>

<style>

</style>

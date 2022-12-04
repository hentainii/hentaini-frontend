<template>
  <div :id="compId" />
</template>

<script>
export default {
  name: 'VueScriptComponent',
  props: {
    script: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      compId: Date.now()
    }
  },
  mounted () {
    const vm = this
    const addEl = new Promise((resolve, reject) => {
      const postscribe = require('postscribe')
      postscribe(
        `#${vm.compId}`,
        `${vm.script}`,
        {
          done: (x) => {}
        }
      )

      resolve()
    })
    addEl.then(function (result) {

    })
  }
}

</script>

<style scoped>

</style>

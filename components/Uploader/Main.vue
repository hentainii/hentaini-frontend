<template>
  <div>
    <h3>Uploader v2</h3>
    <v-file-input
      ref="episode"
      accept="video/mp4"
      label="Select file to upload"
      outlined
    />
    <v-data-table
      :headers="headers"
      :items="uploader"
      hide-default-footer
    />
  </div>
</template>
<script>
export default {
  name: 'UploaderMain',
  data: () => ({
    headers: [
      { text: 'Player', value: 'name' },
      { text: 'Progress', value: 'progress' }
    ],
    uploader: [
      { name: 'Cloud', progress: 0 },
      { name: 'Yourupload', progress: 0 },
      { name: 'TERA', progress: 0 },
      { name: 'Stream2', progress: 0 },
      { name: 'mp4uplo', progress: 0 },
      { name: 'BR', progress: 0 },
      { name: 'Mega', progress: 0 }
    ]
  }),
  computed: {
  },
  async mounted () {
  },
  methods: {
  }
}
</script>

<style>

</style>

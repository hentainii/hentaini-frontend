<template>
  <v-container
    pa-1
  >
    <v-row>
      <v-col cols="10">
        <slot
          name="downloadCode"
        />
      </v-col>
      <v-col cols="2">
        <slot
          name="downloadDeleteItem"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'DownloadInput',
  data: () => ({
    items: ['Foo', 'Bar', 'Fizz', 'Buzz']
  })
}
</script>

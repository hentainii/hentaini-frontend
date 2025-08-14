<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row>
          <v-col>
            <h1>Create Social Media</h1>
            <CreateRrss />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import CreateRrss from '../../../components/Create/CreateRrss'
export default {
  components: {
    CreateRrss
  },
  layout: 'panel',
  middleware: 'authenticated'
}
</script>

<style>

</style>

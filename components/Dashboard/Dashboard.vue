<template>
  <v-container>
    <v-row>
      <v-col>
        <MiscSeriesCard />
      </v-col>
      <v-col>
        <MiscEpisodesCard />
      </v-col>
      <v-col>
        <MiscUsersCard />
      </v-col>
      <v-col>
        <MiscReportsCard />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  head () {
    return {
      title: 'Dashboard | Hentaini'
    }
  }
}
</script>

<style>

</style>

<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          class="red darken-4"
          v-on="on"
          @click.stop="modal = true"
        >
          <v-icon>
            mdi-delete-outline
          </v-icon>
        </v-btn>
      </template>
      <span>Delete Serie</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          Delete {{ title }}?
        </v-card-title>

        <v-card-text>
          This will delete all the serie information and its respective Episodes.
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn
            color="green darken-1"
            text
            @click="modal = false"
          >
            Cancel
          </v-btn>

          <v-btn
            color="red darken-1"
            text
            @click.once="deleteSerie(serieid)"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </span>
</template>

<script>

export default {
  props: {
    serieid: {
      type: Number,
      default: -1
    },
    title: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    modal: false
  }),
  methods: {
    // deleteSerie (serieid) {
    //   this.$apollo.mutate({
    //     mutation: gql`mutation ($id: ID){
    //       deleteSerie(id: $id){
    //         success
    //         errors{
    //           path
    //           message
    //         }
    //       }
    //     }`,
    //     variables: {
    //       id: this.serieid
    //     }
    //   }).then((input) => {
    //     this.$router.replace({ path: '/panel/serie', query: { deleted: true } }, () => { window.location.reload(true) }, () => { window.location.reload(true) })
    //   }).catch((error) => {
    //     // eslint-disable-next-line no-console
    //     console.error(error)
    //   })
    // }
  }
}
</script>

<style>

</style>

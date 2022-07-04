<template>
  <span>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-bind="attrs"
          class="red darken-4"
          small
          v-on="on"
          @click.stop="modal = true"
        >
          <v-icon>
            mdi-delete-outline
          </v-icon>
        </v-btn>
      </template>
      <span>Delete Rrss</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="490"
    >
      <v-card>
        <v-card-title class="headline">
          Delete {{ name }}?
        </v-card-title>

        <v-card-text>
          This action can not be undo.
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
            @click="deleteRrss(rrssid)"
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
    rrssid: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    modal: false
  }),
  methods: {
    deleteRrss (clientid) {
      this.$apollo.mutate({
        mutation: gql`mutation ($id: ID){
          deleteRrss(id: $id){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          id: this.rrssid
        }
      }).then((input) => {
        window.location.reload(true)
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    }
  }
}
</script>

<style>

</style>

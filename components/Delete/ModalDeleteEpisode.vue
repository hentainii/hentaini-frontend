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
      <span>Delete Episode</span>
    </v-tooltip>
    <v-dialog
      v-model="modal"
      max-width="290"
    >
      <v-card>
        <v-card-title class="headline">
          Delete Episode {{ episodenumber }}?
        </v-card-title>

        <v-card-text>
          This will delete this Episode. This operation can not be undo.
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
            @click.once="deleteEpisode(episodeid)"
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
    episodeid: {
      type: String,
      default: ''
    },
    episodenumber: {
      type: Number,
      default: 0
    },
    serieid: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    modal: false
  }),
  methods: {
    deleteEpisode (episodeid) {
      this.$apollo.mutate({
        mutation: gql`mutation ($id: ID){
          deleteEpisode(id: $id){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          id: this.episodeid
        }
      }).then((input) => {
        this.$router.push({ path: '/panel/serie/' + this.serieid + '/episodes', query: { deleted: true } }, () => { window.location.reload(true) }, () => { window.location.reload(true) })
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

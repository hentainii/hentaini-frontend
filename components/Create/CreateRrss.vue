<template>
  <v-card>
    <form>
      <v-container>
        <v-alert
          v-if="alertBox"
          type="info"
          :class="alertBoxColor"
          tile
          dismissible
        >
          {{ createdMessage }}
        </v-alert>
        <v-row>
          <v-container>
            <v-text-field
              v-model="name"
              label="Name"
              hint="I.e: Discord, Facebook, Twitter, etc..."
              required
            />
            <v-text-field
              v-model="url"
              label="Url"
              required
            />
            <v-btn
              class="mr-4 blue darken-4"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              @click="createRrss"
            >
              Create
            </v-btn>
          </v-container>
        </v-row>
        <v-row>
          <v-container>
            <v-card
              tile
            >
              <v-card-title class="blue darken-3">
                Social Networks
              </v-card-title>
              <v-data-table
                :headers="headers"
                :items="rrss"
                sort-by="calories"
                class="elevation-1"
              >
                <template v-slot:item.actions="{ item }">
                  <v-dialog v-model="dialogEdit" max-width="500px" :retain-focus="false">
                    <v-card>
                      <v-card-title>
                        <span class="headline">Edit Social Network</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <EditRrss
                            v-bind="rs"
                            @updateRrss="updateRrss($event)"
                          />
                        </v-container>
                      </v-card-text>
                    </v-card>
                  </v-dialog>
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        v-bind="attrs"
                        class="yellow darken-4"
                        small
                        v-on="on"
                        @click="editItem(item)"
                      >
                        <v-icon>
                          mdi-pencil
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Edit Social Network</span>
                  </v-tooltip>
                  <ModalDeleteRrss :name="item.name" :rrssid="item._id" />
                </template>
              </v-data-table>
            </v-card>
          </v-container>
        </v-row>
      </v-container>
    </form>
  </v-card>
</template>

<script>

import EditRrss from '../Edit/EditRrss'
import ModalDeleteRrss from '../Delete/ModalDeleteRrss'
export default {
  name: 'CreateRrss',
  components: {
    EditRrss,
    ModalDeleteRrss
  },
  data: () => ({
    name: '',
    url: '',
    rrss: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false,
    editedIndex: -1,
    rs: {
      rrss: {
        name: '',
        url: '',
        active: false
      }
    },
    dialogEdit: false,
    headers: [
      { text: 'Name', value: 'name' },
      { text: 'Url', value: 'url' },
      { text: 'Active', value: 'active' },
      { text: 'Actions', value: 'actions' }
    ]
  }),
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Ciudad creada correctamente.'
    }
    this.$apollo.query({
      query: `query ($limit: Int){
        Rrss(limit: $limit){
          name
          url
        }
      }`,
      variables: {
        limit: 1000
      }
    }).then((input) => {
      this.rrss = input.data.Rrss
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    editItem (item) {
      this.editedIndex = this.rrss.indexOf(item)
      this.rs.rrss = Object.assign({}, item)
      this.dialogEdit = true
    },
    updateRrss (input) {
      if (this.editedIndex > -1) {
        Object.assign(this.rrss[this.editedIndex], input)
      } else {
        this.rrss.push(input)
      }
      this.dialogEdit = false
    },
    createRrss () {
      this.isSubmitting = !this.isSubmitting
      this.$apollo.mutate({
        mutation: gql`mutation ($input: inputCreateRrss){
          createRrss(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            name: this.name,
            url: this.url,
            active: true
          }
        }
      }).then((input) => {
        if (input.data.createRrss.success) {
          window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createRrss.errors[0].message
          this.isSubmitting = false
        }
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

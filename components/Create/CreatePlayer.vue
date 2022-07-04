<template>
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
    <form>
      <v-container>
        <v-row>
          <v-col>
            <v-container>
              <v-text-field
                v-model="name"
                label="Player Name"
                :hint="hint"
                persistent-hint
                required
              />
              <v-text-field
                v-model="short_name"
                label="Player Short Name"
                persistent-hint
                required
              />
              <v-text-field
                v-model="player_code"
                label="Player Code"
                placeholder="Example: https://clipwatching.com/embed-codigo.html"
                persistent-hint
                required
              />
              <v-btn
                class="mr-4 blue darken-4"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                @click="createPlayer"
              >
                submit
              </v-btn>
            </v-container>
          </v-col>
          <v-col>
            <v-card
              tile
            >
              <v-card-title class="blue darken-3">
                Available Players
              </v-card-title>
              <v-list
                rounded
                shaped
              >
                <v-list-item
                  v-for="player in players"
                  :key="player.id"
                >
                  <v-list-item-content>
                    <v-list-item-title>{{ player.name }}</v-list-item-title>
                    <v-list-item-subtitle>Short name: {{ player.short_name }}</v-list-item-subtitle>
                    <v-list-item-subtitle>Player Code: {{ player.player_code }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </form>
  </v-container>
</template>

<script>

export default {
  name: 'CreatePlayer',
  data: () => ({
    name: '',
    short_name: '',
    player_code: '',
    hint: '',
    players: [],
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false
  }),
  created () {
    if (this.$route.query.created) {
      this.alertBox = true
      this.alertBoxColor = 'blue darken-4'
      this.createdMessage = 'Player Created Successfully.'
    }
    this.$apollo.query({
      query: `query ($limit: Int){
        Players(limit: $limit){
          name
          short_name
          player_code
        }
      }`,
      variables: {
        limit: 100
      }
    }).then((input) => {
      this.players = input.data.Players
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  methods: {
    createPlayer () {
      this.isSubmitting = !this.isSubmitting
      if (!this.name || !this.short_name || !this.player_code) {
        this.alertBox = true
        this.alertBoxColor = 'red darken-4'
        this.createdMessage = 'You Must fill al the Fields'
        this.isSubmitting = false
      }
      this.$apollo.mutate({
        mutation: gql`mutation ($input: PlayerInput){
          createPlayer(input: $input){
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
            short_name: this.short_name,
            player_code: this.player_code
          }
        }
      }).then((input) => {
        if (input.data.createPlayer.success) {
          this.$router.push({ path: '/panel/player/create', query: { created: true } }, () => { window.location.reload(true) }, () => { window.location.reload(true) })
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.createPlayer.errors[0].message
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

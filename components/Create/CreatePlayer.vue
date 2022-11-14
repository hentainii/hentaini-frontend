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
                class="mr-4 primary"
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
              <v-card-title class="primary">
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
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false
  }),
  computed: {
    players () {
      return this.$store.state.players.players
    }
  },
  mounted () {
    this.getPlayers()
  },
  methods: {
    async getPlayers () {
      await this.$store.dispatch('players/getPlayers', {
        token: this.$store.state.auth.token
      })
    },
    async createPlayer () {
      this.isSubmitting = !this.isSubmitting
      await this.$store.dispatch('players/createPlayer', {
        token: this.$store.state.auth.token,
        player: {
          name: this.name,
          short_name: this.short_name,
          player_code: this.player_code
        }
      })
      this.name = ''
      this.short_name = ''
      this.player_code = ''
      this.isSubmitting = !this.isSubmitting
      this.getPlayers()
    }
  }
}
</script>

<style>

</style>

<template>
  <v-card class="glass-card pa-6 ma-4" elevation="10" @click.self="clearSelection">
    <v-row>
      <v-col cols="12" md="6">
        <v-card-title class="headline font-weight-bold mb-4">
          <v-icon left color="primary">
            mdi-play-box-plus
          </v-icon>
          Create or Edit Player
        </v-card-title>
        <v-alert
          type="info"
          color="primary"
          border="left"
          class="mb-4"
          icon="mdi-information"
          dense
        >
          <span>
            <strong>Tip:</strong> Click on a player in the list to edit or delete it. You can also create a new player using the form.
          </span>
        </v-alert>
        <v-form>
          <v-text-field
            v-model="name"
            label="Player Name"
            :hint="hint"
            persistent-hint
            required
            prepend-inner-icon="mdi-play-circle"
            outlined
            dense
            class="mb-3"
          />
          <v-text-field
            v-model="short_name"
            label="Player Short Name"
            persistent-hint
            required
            prepend-inner-icon="mdi-alphabetical"
            outlined
            dense
            class="mb-3"
          />
          <v-text-field
            v-model="player_code"
            label="Player Code"
            placeholder="Example: https://clipwatching.com/embed-codigo.html"
            persistent-hint
            required
            prepend-inner-icon="mdi-code-tags"
            outlined
            dense
            class="mb-3"
          />
          <v-row>
            <v-col cols="6">
              <v-btn
                class="mt-2 primary rounded-xl"
                :loading="isSubmitting"
                :disabled="isSubmitting"
                large
                block
                @click="createOrEditPlayer"
              >
                <v-icon left>
                  mdi-content-save
                </v-icon>
                {{ selectedPlayer ? 'Save Changes' : 'Create Player' }}
              </v-btn>
            </v-col>
            <v-col v-if="selectedPlayer" cols="6">
              <v-btn
                class="mt-2 red darken-2 rounded-xl"
                :loading="isDeleting"
                :disabled="isDeleting"
                large
                block
                @click="deletePlayer"
              >
                <v-icon left>
                  mdi-delete
                </v-icon>
                Delete
              </v-btn>
              <v-btn
                class="mt-2 ml-2 grey lighten-1 rounded-xl"
                large
                block
                @click="clearSelection"
              >
                <v-icon left>
                  mdi-close-circle
                </v-icon>
                Cancel
              </v-btn>
            </v-col>
          </v-row>
          <v-alert
            v-if="alertBox"
            type="info"
            :class="alertBoxColor"
            tile
            dismissible
            class="mt-4"
          >
            {{ createdMessage }}
          </v-alert>
        </v-form>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="glass-card pa-4" elevation="6">
          <v-card-title class="primary">
            <v-icon left color="primary">
              mdi-play-circle-multiple
            </v-icon>
            Available Players
          </v-card-title>
          <div class="mb-2 player-list-tip">
            <v-icon left small color="primary">
              mdi-information
            </v-icon>
            <span>Click a player to edit or delete it</span>
          </div>
          <v-list rounded shaped>
            <v-list-item
              v-for="player in players"
              :key="player.id"
              :class="{'selected-player': selectedPlayer && selectedPlayer.id === player.id}"
              style="cursor:pointer;"
              @click="togglePlayerSelection(player)"
            >
              <v-list-item-content>
                <v-list-item-title>
                  <v-icon left small color="primary">
                    mdi-play-circle
                  </v-icon>
                  {{ player.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  <v-icon left small color="primary">
                    mdi-alphabetical
                  </v-icon>
                  Short name: {{ player.short_name }}
                </v-list-item-subtitle>
                <v-list-item-subtitle>
                  <v-icon left small color="primary">
                    mdi-code-tags
                  </v-icon>
                  Player Code: {{ player.player_code }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action v-if="selectedPlayer && selectedPlayer.id === player.id">
                <v-icon color="primary">
                  mdi-pencil
                </v-icon>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-card>
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
    isSubmitting: false,
    isDeleting: false,
    selectedPlayer: null
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
    async createOrEditPlayer () {
      this.isSubmitting = true
      if (this.selectedPlayer) {
        // Editar
        await this.$store.dispatch('players/editPlayer', {
          token: this.$store.state.auth.token,
          id: this.selectedPlayer.id,
          player: {
            name: this.name,
            short_name: this.short_name,
            player_code: this.player_code
          }
        })
        this.createdMessage = 'Player Edited Successfully.'
        this.alertBoxColor = 'yellow darken-4'
      } else {
        // Crear
        await this.$store.dispatch('players/createPlayer', {
          token: this.$store.state.auth.token,
          player: {
            name: this.name,
            short_name: this.short_name,
            player_code: this.player_code
          }
        })
        this.createdMessage = 'Player Created Successfully.'
        this.alertBoxColor = 'primary'
      }
      this.isSubmitting = false
      this.name = ''
      this.short_name = ''
      this.player_code = ''
      this.selectedPlayer = null
      this.alertBox = true
      await this.getPlayers()
    },
    togglePlayerSelection (player) {
      if (this.selectedPlayer && this.selectedPlayer.id === player.id) {
        this.clearSelection()
      } else {
        this.selectedPlayer = player
        this.name = player.name
        this.short_name = player.short_name
        this.player_code = player.player_code
        this.alertBox = false
      }
    },
    clearSelection () {
      this.selectedPlayer = null
      this.name = ''
      this.short_name = ''
      this.player_code = ''
      this.alertBox = false
    },
    async deletePlayer () {
      if (!this.selectedPlayer) { return }
      this.isDeleting = true
      await this.$store.dispatch('players/deletePlayer', {
        token: this.$store.state.auth.token,
        id: this.selectedPlayer.id
      })
      this.isDeleting = false
      this.name = ''
      this.short_name = ''
      this.player_code = ''
      this.selectedPlayer = null
      this.createdMessage = 'Player Deleted Successfully.'
      this.alertBoxColor = 'red darken-4'
      this.alertBox = true
      await this.getPlayers()
    }
  }
}
</script>

<style scoped>
.glass-card {
  background: rgba(255,255,255,0.12);
  border-radius: 18px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.18);
}
.selected-player {
  background: rgba(103, 58, 183, 0.12) !important;
}
.player-list-tip {
  color: #6c63ff;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  opacity: 0.85;
}
</style>

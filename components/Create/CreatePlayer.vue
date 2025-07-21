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
          <v-switch
            v-model="up_available"
            label="Disponible para subir (Uploader)"
            class="mb-3"
            color="success"
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
                {{ selectedPlayer ? 'Guardar Cambios' : 'Crear Player' }}
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
                Eliminar
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
                Cancelar
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
        <!-- Nueva sección para cuentas asociadas -->
        <v-card v-if="selectedPlayer" class="glass-card pa-4 mt-6" elevation="6">
          <v-card-title class="primary">
            <v-icon left color="primary">
              mdi-account-multiple
            </v-icon>
            Cuentas asociadas a este player
          </v-card-title>
          <v-btn color="success" class="mb-3" @click="openAccountForm()">
            <v-icon left>
              mdi-plus
            </v-icon>Agregar cuenta
          </v-btn>
          <v-simple-table dense>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Usuario/Email</th>
                <th>API Key</th>
                <!-- Quitar columna Disponible -->
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="account in filteredAccounts" :key="account.id">
                <td>{{ account.service }}</td>
                <td>{{ account.username || account.email }}</td>
                <td>{{ account.api_key }}</td>
                <!-- Quitar switch Disponible -->
                <td>
                  <v-btn icon small @click="editAccount(account)">
                    <v-icon color="primary">
                      mdi-pencil
                    </v-icon>
                  </v-btn>
                  <v-btn icon small @click="deleteAccount(account)">
                    <v-icon color="red">
                      mdi-delete
                    </v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-simple-table>
          <!-- Formulario modal para agregar/editar cuenta -->
          <v-dialog v-model="showAccountDialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ editingAccount ? 'Editar Cuenta' : 'Agregar Cuenta' }}</span>
              </v-card-title>
              <v-card-text>
                <v-form>
                  <v-text-field v-model="accountForm.service" label="Servicio" :readonly="true" />
                  <v-text-field v-model="accountForm.username" label="Usuario" />
                  <v-text-field v-model="accountForm.email" label="Email" />
                  <v-text-field v-model="accountForm.password" label="Contraseña" type="password" />
                  <v-text-field v-model="accountForm.api_key" label="API Key" />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" text @click="saveAccount">
                  Guardar
                </v-btn>
                <v-btn color="grey" text @click="closeAccountDialog">
                  Cancelar
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card>
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
                  <v-icon v-if="player.up_available" color="success" small title="Disponible para subir">
                    mdi-cloud-upload
                  </v-icon>
                  <v-icon v-else color="grey" small title="No disponible para subir">
                    mdi-cloud-off-outline
                  </v-icon>
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
    up_available: true,
    hint: '',
    createdMessage: '',
    alertBox: false,
    alertBoxColor: '',
    isSubmitting: false,
    isDeleting: false,
    selectedPlayer: null,
    showAccountDialog: false,
    editingAccount: null,
    accountForm: {
      service: '',
      username: '',
      email: '',
      password: '',
      api_key: '',
      up_available: true
    }
  }),
  computed: {
    players () {
      return this.$store.state.players.players
    },
    accounts () {
      return this.$store.state.accounts.accounts
    },
    filteredAccounts () {
      if (!this.selectedPlayer) { return [] }
      return this.accounts.filter(acc => acc.player && acc.player.id === this.selectedPlayer.id)
    }
  },
  mounted () {
    this.getPlayers()
    this.getAccounts()
  },
  methods: {
    async getPlayers () {
      await this.$store.dispatch('players/getPlayers', {
        token: this.$store.state.auth.token
      })
    },
    async getAccounts () {
      await this.$store.dispatch('accounts/getAccounts', {
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
            player_code: this.player_code,
            up_available: this.up_available
          }
        })
        this.createdMessage = 'Player editado correctamente.'
        this.alertBoxColor = 'yellow darken-4'
      } else {
        // Crear
        await this.$store.dispatch('players/createPlayer', {
          token: this.$store.state.auth.token,
          player: {
            name: this.name,
            short_name: this.short_name,
            player_code: this.player_code,
            up_available: this.up_available
          }
        })
        this.createdMessage = 'Player creado correctamente.'
        this.alertBoxColor = 'primary'
      }
      this.isSubmitting = false
      this.name = ''
      this.short_name = ''
      this.player_code = ''
      this.up_available = true
      this.selectedPlayer = null
      this.alertBox = true
      await this.getPlayers()
      await this.getAccounts()
    },
    togglePlayerSelection (player) {
      if (this.selectedPlayer && this.selectedPlayer.id === player.id) {
        this.clearSelection()
      } else {
        this.selectedPlayer = player
        this.name = player.name
        this.short_name = player.short_name
        this.player_code = player.player_code
        this.up_available = player.up_available
        this.alertBox = false
      }
    },
    clearSelection () {
      this.selectedPlayer = null
      this.name = ''
      this.short_name = ''
      this.player_code = ''
      this.up_available = true
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
      this.up_available = true
      this.selectedPlayer = null
      this.createdMessage = 'Player eliminado correctamente.'
      this.alertBoxColor = 'red darken-4'
      this.alertBox = true
      await this.getPlayers()
      await this.getAccounts()
    },
    // Métodos para cuentas
    openAccountForm () {
      this.editingAccount = null
      this.accountForm = {
        service: this.selectedPlayer ? this.selectedPlayer.name : '',
        username: '',
        email: '',
        password: '',
        api_key: ''
      }
      this.showAccountDialog = true
    },
    editAccount (account) {
      this.editingAccount = account
      this.accountForm = {
        service: this.selectedPlayer ? this.selectedPlayer.name : account.service,
        username: account.username,
        email: account.email,
        password: '',
        api_key: account.api_key
      }
      this.showAccountDialog = true
    },
    closeAccountDialog () {
      this.showAccountDialog = false
      this.editingAccount = null
    },
    async saveAccount () {
      if (!this.selectedPlayer) { return }
      const payload = {
        token: this.$store.state.auth.token,
        account: {
          ...this.accountForm,
          player: this.selectedPlayer.id
        }
      }
      if (this.editingAccount) {
        // Editar
        await this.$store.dispatch('accounts/updateAccount', {
          ...payload,
          accountId: this.editingAccount.id
        })
      } else {
        // Crear
        await this.$store.dispatch('accounts/createAccount', payload)
      }
      this.showAccountDialog = false
      this.editingAccount = null
      await this.getAccounts()
    },
    async deleteAccount (account) {
      if (!confirm('¿Seguro que deseas eliminar esta cuenta?')) { return }
      await this.$store.dispatch('accounts/deleteAccount', {
        token: this.$store.state.auth.token,
        accountId: account.id
      })
      await this.getAccounts()
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

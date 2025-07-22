<template>
  <v-container class="pa-6" fluid>
    <v-card class="glass-card pa-6" elevation="10">
      <v-row>
        <v-col cols="12">
          <v-card-title class="subtitle-1 font-weight-bold mb-2">
            <v-icon left color="primary">
              mdi-table
            </v-icon>
            Uploader - Active
          </v-card-title>
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" md="12">
          <SerieAutocomplete
            v-model="selectedSerie"
            @change="onSerieChange"
          />
          <v-text-field
            v-model="episodeNumber"
            type="number"
            label="Número de episodio"
            outlined
            dense
            min="1"
            class="mt-2"
            :rules="episodeRules"
            :disabled="!selectedSerie"
          />
          <v-file-input
            v-model="selectedFile"
            label="Selecciona el archivo a subir"
            prepend-icon="mdi-file-upload"
            outlined
            dense
            :rules="fileRules"
            accept="video/mp4"
            :disabled="!selectedSerie || !episodeNumber"
            @change="onFileSelected"
          />
          <v-btn
            class="mt-4 primary rounded-xl"
            :disabled="!selectedFile || !selectedSerie || episodeNumber === null || isUploading"
            :loading="isUploading"
            block
            @click="startUpload"
          >
            <v-icon left>
              mdi-cloud-upload
            </v-icon>
            Subir Episodio
          </v-btn>
        </v-col>
        <v-col cols="12" md="12">
          <v-card class="glass-card pa-4" elevation="6">
            <v-simple-table>
              <thead>
                <tr>
                  <th>Sesión</th>
                  <th>Episodio</th>
                  <th v-for="player in players" :key="player.id">
                    {{ player.name }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(session, idx) in sessions" :key="session.id">
                  <td>#{{ idx + 1 }}</td>
                  <td>{{ session.serie ? `Serie: ${session.serie.title} - Ep ${session.episode}` : '-' }}</td>
                  <td v-for="player in players" :key="player.id">
                    <div v-if="session.services && session.services[player.name]">
                      <v-progress-linear
                        :value="session.services[player.name].progress"
                        :color="getStatusColor(session.services[player.name].status)"
                        height="8"
                        rounded
                      />
                      <div v-if="session.services[player.name].status === 'failed'">
                        <v-btn small color="red" @click="retryUploadService(session.id, player.name)">
                          <v-icon left>
                            mdi-refresh
                          </v-icon>Reintentar
                        </v-btn>
                        <div class="error-message">
                          {{ session.services[player.name].error }}
                        </div>
                      </div>
                      <div v-else-if="session.services[player.name].status === 'success'">
                        <v-icon color="green">
                          mdi-check-circle
                        </v-icon>
                        <span class="caption">{{ session.services[player.name].code }}</span>
                      </div>
                    </div>
                    <div v-else>
                      -
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>
          <v-btn
            v-if="lastUploadResults && lastUploadResults.successful.length > 0"
            class="mt-4 green darken-1 white--text rounded-xl"
            block
            large
            @click="goToCreateEpisode"
          >
            <v-icon left>
              mdi-plus-box
            </v-icon>
            Crear Episodio con los videos subidos
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import qs from 'qs'
import SerieAutocomplete from '~/components/SerieAutocomplete.vue'
import { useUploadManager } from '~/composables/uploader/uploadManager'

export default {
  name: 'UploaderPage',
  components: {
    SerieAutocomplete
  },
  layout: 'panel',
  data () {
    return {
      selectedSerie: null,
      selectedSerieObj: null,
      selectedFile: null,
      episodeNumber: null,
      players: [],
      sessions: [],
      currentSession: null,
      fileRules: [
        v => !!v || 'Por favor selecciona un archivo',
        v => !v || v.size <= 2000000000 || 'El archivo debe ser menor a 2GB',
        v => !v || v.type === 'video/mp4' || 'El archivo debe ser formato MP4'
      ],
      episodeRules: [
        v => !!v || 'Por favor ingresa el número de episodio',
        v => v > 0 || 'El número de episodio debe ser mayor a 0'
      ],
      isUploading: false,
      lastUploadResults: null
    }
  },
  async mounted () {
    await this.fetchAccounts()
    await this.fetchSessions()
  },
  methods: {
    onSerieChange (serieObj) {
      this.selectedSerieObj = serieObj
    },
    onFileSelected (file) {
      if (file && this.validateFile(file)) {
        this.$store.dispatch('uploader/selectFile', file)
      }
    },
    validateFile (file) {
      if (!file) { return false }
      if (file.type !== 'video/mp4') {
        this.$toast.error('Por favor selecciona un archivo MP4')
        return false
      }
      if (file.size > 2000000000) { // 2GB limit
        this.$toast.error('El archivo debe ser menor a 2GB')
        return false
      }
      return true
    },
    async fetchAccounts () {
      const token = this.$store.state.auth.token
      const query = qs.stringify({
        filters: {
          up_available: { $eq: true }
        },
        populate: ['accounts'],
        sort: ['name:asc'],
        pagination: { page: 1, pageSize: 50 }
      }, { encodeValuesOnly: true })

      const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}players?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      this.players = data.data
    },
    async fetchSessions () {
      const token = this.$store.state.auth.token
      const query = qs.stringify({
        populate: ['serie'],
        sort: ['started_at:desc'],
        pagination: { page: 1, pageSize: 25 }
      }, { encodeValuesOnly: true })
      const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}uploader-sessions?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      this.sessions = data.data
    },
    formatDate (dateStr) {
      if (!dateStr) { return '-' }
      const d = new Date(dateStr)
      return d.toLocaleString()
    },
    getStatusColor (status) {
      switch (status) {
        case 'success': return 'green'
        case 'failed': return 'red'
        case 'uploading': return 'blue'
        default: return 'grey'
      }
    },
    async startUpload () {
      if (!this.selectedFile || !this.selectedSerie || !this.episodeNumber) {
        this.$toast.error('Por favor selecciona una serie, número de episodio y un archivo')
        return
      }

      this.isUploading = true
      this.lastUploadResults = null

      try {
        // Create upload session
        const token = this.$store.state.auth.token
        const sessionData = {
          serie: this.selectedSerie,
          episode: this.episodeNumber,
          file_name: this.selectedFile.name,
          services: this.players.map(player => ({ service: player.name })),
          started_at: new Date().toISOString()
        }

        const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}uploader-sessions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ data: sessionData })
        })

        if (!res.ok) {
          throw new Error('Failed to create upload session')
        }

        const session = await res.json()
        this.currentSession = session.data

        // Add the new session to the top of the sessions list for immediate UI update
        const newSessionForUI = {
          ...session.data,
          serie: {
            id: this.selectedSerie,
            title: this.selectedSerieObj.rawTitle
          },
          episode: this.episodeNumber
        }
        this.sessions.unshift(newSessionForUI)

        // Start upload session in store
        const sessionId = await this.$store.dispatch('uploader/startUploadSession', {
          file: this.selectedFile,
          accounts: this.players.map(player => ({ service: player.name }))
        })

        const latestAccount = this.players.map(player => ({ service: player.name, email: player.accounts[0].email, password: player.accounts[0].password, username: player.accounts[0].username, api_key: player.accounts[0].api_key }))

        // Start upload to all services
        const { uploadToMultipleServices } = useUploadManager()
        const results = await uploadToMultipleServices(
          this.selectedFile,
          latestAccount,
          this.$store,
          (service, progress) => {
            this.$store.dispatch('uploader/updateProgress', { service, progress })
            this.updateUploadProgress(service, progress)
          },
          (service, result) => {
            this.$store.dispatch('uploader/setResult', { service, result })
            this.handleUploadSuccess(service, result)
          },
          (service, error) => {
            this.$store.dispatch('uploader/setResult', { service, result: null, error })
            this.handleUploadError(service, error)
          }
        )

        console.log('Upload results:', results)
        this.lastUploadResults = results
        await this.$store.dispatch('uploader/finishUploadSession', sessionId)
        this.isUploading = false
      } catch (error) {
        console.error('Upload error:', error)
        this.$toast.error(`Error al subir: ${error.message}`)
        this.isUploading = false
      }
    },
    async updateUploadProgress (service, progress) {
      if (!this.currentSession) { return }

      // Update local session for instant UI feedback
      const sessionToUpdate = this.sessions.find(s => s.id === this.currentSession.id)
      if (sessionToUpdate) {
        if (!sessionToUpdate.services) { this.$set(sessionToUpdate, 'services', {}) }
        if (!sessionToUpdate.services[service]) { this.$set(sessionToUpdate.services, service, {}) }
        this.$set(sessionToUpdate.services[service], 'progress', progress.percentage)
        this.$set(sessionToUpdate.services[service], 'status', progress.status)
      }

      const token = this.$store.state.auth.token
      const services = {
        ...this.currentSession.services,
        [service]: {
          ...this.currentSession.services[service],
          progress: progress.percentage,
          status: progress.status
        }
      }
      this.currentSession.services = services

      await fetch(`${this.$config.API_STRAPI_ENDPOINT}uploader-sessions/${this.currentSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data: { services } })
      })
    },
    async handleUploadSuccess (service, result) {
      if (!this.currentSession) { return }

      // Update local session for instant UI feedback
      const sessionToUpdate = this.sessions.find(s => s.id === this.currentSession.id)
      if (sessionToUpdate) {
        if (!sessionToUpdate.services) { this.$set(sessionToUpdate, 'services', {}) }
        if (!sessionToUpdate.services[service]) { this.$set(sessionToUpdate.services, service, {}) }
        this.$set(sessionToUpdate.services[service], 'status', 'success')
        this.$set(sessionToUpdate.services[service], 'progress', 100)
        this.$set(sessionToUpdate.services[service], 'code', result.code)
      }

      const token = this.$store.state.auth.token
      const services = {
        ...this.currentSession.services,
        [service]: {
          status: 'success',
          progress: 100,
          code: result.code
        }
      }

      await fetch(`${this.$config.API_STRAPI_ENDPOINT}uploader-sessions/${this.currentSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data: { services } })
      })
    },
    async handleUploadError (service, error) {
      if (!this.currentSession) { return }

      // Update local session for instant UI feedback
      const sessionToUpdate = this.sessions.find(s => s.id === this.currentSession.id)
      if (sessionToUpdate) {
        if (!sessionToUpdate.services) { this.$set(sessionToUpdate, 'services', {}) }
        if (!sessionToUpdate.services[service]) { this.$set(sessionToUpdate.services, service, {}) }
        this.$set(sessionToUpdate.services[service], 'status', 'failed')
        this.$set(sessionToUpdate.services[service], 'progress', 0)
        this.$set(sessionToUpdate.services[service], 'error', error.message)
      }

      const token = this.$store.state.auth.token
      const services = {
        ...this.currentSession.services,
        [service]: {
          status: 'failed',
          progress: 0,
          error: error.message
        }
      }

      await fetch(`${this.$config.API_STRAPI_ENDPOINT}uploader-sessions/${this.currentSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ data: { services } })
      })
    },
    async retryUploadService (sessionId, service) {
      const session = this.sessions.find(s => s.id === sessionId)
      if (!session) { return }

      try {
        this.currentSession = session
        const { retryUpload: retryUploadManager } = useUploadManager()
        await retryUploadManager(
          this.selectedFile,
          { service },
          this.$store,
          (service, progress) => {
            this.$store.dispatch('uploader/updateProgress', { service, progress })
            this.updateUploadProgress(service, progress)
          },
          (service, result) => {
            this.$store.dispatch('uploader/setResult', { service, result })
            this.handleUploadSuccess(service, result)
          },
          (service, error) => {
            this.$store.dispatch('uploader/setResult', { service, result: null, error })
            this.handleUploadError(service, error)
          }
        )
      } catch (error) {
        console.error('Retry error:', error)
        this.$toast.error(`Error al reintentar: ${error.message}`)
      }
    },
    shouldShowCreateEpisodeButton (session) {
      // Show button if at least one service uploaded successfully
      return Object.values(session.services || {}).some(s => s.status === 'success')
    },
    async createEpisodeFromSession (session) {
      try {
        // Get successful uploads
        const successfulUploads = Object.entries(session.services || {})
          .filter(([, status]) => status.status === 'success')
          .map(([service, status]) => ({
            service,
            code: status.code
          }))

        if (successfulUploads.length === 0) {
          this.$toast.error('No hay subidas exitosas para crear el episodio')
          return
        }

        // Create new episode
        const token = this.$store.state.auth.token
        const episodeData = {
          data: {
            serie: session.serie,
            episode: session.episode,
            players: successfulUploads.map(upload => ({
              service: upload.service,
              code: upload.code
            }))
          }
        }

        const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(episodeData)
        })

        if (!res.ok) {
          throw new Error('Failed to create episode')
        }

        this.$toast.success('Episodio creado exitosamente')
      } catch (error) {
        console.error('Create episode error:', error)
        this.$toast.error(`Error al crear episodio: ${error.message}`)
      }
    },
    goToCreateEpisode () {
      if (!this.lastUploadResults || this.lastUploadResults.successful.length === 0) {
        this.$toast.error('No hay subidas exitosas para crear un episodio.')
        return
      }

      this.$router.push({
        path: `/panel/serie/${this.selectedSerie}/episode/create`,
        query: {
          episodeNumber: this.episodeNumber,
          players: JSON.stringify(this.lastUploadResults.successful.map(p => ({ service: p.service, result: p.result })))
        }
      })
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
.error-message {
  color: red;
  font-size: 0.8em;
  margin-top: 4px;
}
</style>

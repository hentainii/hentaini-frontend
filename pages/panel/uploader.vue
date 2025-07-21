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
            :disabled="!selectedFile || !selectedSerie || !episodeNumber || isUploading"
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
                  <th>Archivo</th>
                  <th>Fecha</th>
                  <th v-for="account in accounts" :key="account">
                    {{ account }}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(session, idx) in sessions" :key="session.id">
                  <td>#{{ idx + 1 }}</td>
                  <td>{{ session.episode && session.episode.serie ? `Serie: ${session.episode.serie.title} - Ep ${session.episode.episode_number}` : '-' }}</td>
                  <td>{{ session.file_name }}</td>
                  <td>{{ formatDate(session.started_at) }}</td>
                  <td v-for="account in accounts" :key="account">
                    <div v-if="session.services && session.services[account]">
                      <v-progress-linear
                        :value="session.services[account].progress"
                        :color="getStatusColor(session.services[account].status)"
                        height="8"
                        rounded
                      />
                      <div v-if="session.services[account].status === 'failed'">
                        <v-btn small color="red" @click="retryUpload(session.id, account)">
                          <v-icon left>
                            mdi-refresh
                          </v-icon>Reintentar
                        </v-btn>
                        <div class="error-message">
                          {{ session.services[account].error }}
                        </div>
                      </div>
                      <div v-else-if="session.services[account].status === 'success'">
                        <v-icon color="green">
                          mdi-check-circle
                        </v-icon>
                        <span class="caption">{{ session.services[account].code }}</span>
                      </div>
                    </div>
                    <div v-else>
                      -
                    </div>
                  </td>
                  <td>
                    <v-btn
                      v-if="shouldShowCreateEpisodeButton(session)"
                      small
                      color="primary"
                      @click="createEpisodeFromSession(session)"
                    >
                      <v-icon left small>
                        mdi-plus-circle
                      </v-icon>
                      Crear Episodio
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>
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
      episodeNumber: null,
      selectedFile: null,
      isUploading: false,
      accounts: [],
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
      ]
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
        this.selectedFile = file
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
        filters: { active: { $eq: true } },
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
      this.accounts = data.data.map(p => p.name)
    },
    async fetchSessions () {
      const token = this.$store.state.auth.token
      const query = qs.stringify({
        populate: ['episode', 'episode.serie'],
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

      try {
        // Create upload session
        const token = this.$store.state.auth.token
        const sessionData = {
          serie: this.selectedSerie,
          episode_number: this.episodeNumber,
          file_name: this.selectedFile.name,
          services: {},
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

        // Initialize services status
        this.accounts.forEach((account) => {
          this.currentSession.services[account] = {
            status: 'uploading',
            progress: 0
          }
        })

        // Start upload to all services
        const { uploadToMultipleServices } = useUploadManager()
        const results = await uploadToMultipleServices(
          this.selectedFile,
          this.accounts.map(name => ({ service: name })),
          this.$store,
          (service, progress) => this.updateUploadProgress(service, progress),
          (service, result) => this.handleUploadSuccess(service, result),
          (service, error) => this.handleUploadError(service, error)
        )

        console.log('Upload results:', results)
      } catch (error) {
        console.error('Upload error:', error)
        this.$toast.error(`Error al subir: ${error.message}`)
      } finally {
        this.isUploading = false
        await this.fetchSessions()
      }
    },
    async updateUploadProgress (service, progress) {
      if (!this.currentSession) { return }

      const token = this.$store.state.auth.token
      const services = {
        ...this.currentSession.services,
        [service]: {
          ...this.currentSession.services[service],
          progress
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

      await this.fetchSessions()
    },
    async handleUploadSuccess (service, result) {
      if (!this.currentSession) { return }

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

      await this.fetchSessions()
    },
    async handleUploadError (service, error) {
      if (!this.currentSession) { return }

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

      await this.fetchSessions()
    },
    async retryUpload (sessionId, service) {
      const session = this.sessions.find(s => s.id === sessionId)
      if (!session) { return }

      try {
        const { retryUpload } = useUploadManager()
        await retryUpload(
          this.selectedFile,
          { service },
          this.$store,
          progress => this.updateUploadProgress(service, progress),
          result => this.handleUploadSuccess(service, result),
          error => this.handleUploadError(service, error)
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
            episode_number: session.episode_number,
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

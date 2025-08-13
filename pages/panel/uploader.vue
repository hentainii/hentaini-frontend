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
            label="Episode Number"
            outlined
            dense
            min="1"
            class="mt-2"
            :rules="episodeRules"
            :disabled="!selectedSerie"
          />
          <v-switch
            v-model="episodeIsVisible"
            label="Visible?"
            inset
            color="primary"
            class="mt-2"
            :disabled="!selectedSerie || !episodeNumber"
          />
          <v-file-input
            v-model="selectedFile"
            label="Select file to upload"
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
            :disabled="!selectedFile || !selectedSerie || episodeNumber === null || isUploading || lastUploadResults !== null"
            :loading="isUploading"
            block
            @click="startUpload"
          >
            <v-icon left>
              mdi-cloud-upload
            </v-icon>
            Upload Episode
          </v-btn>
          <v-btn
            v-if="lastUploadResults && lastUploadResults.successful.length > 0"
            class="mt-4 green darken-1 white--text rounded-xl"
            block
            large
            :loading="isCreatingEpisode"
            @click="createEpisodeFromLastUpload"
          >
            <v-icon left>
              mdi-plus-box
            </v-icon>
            Create Episode from Uploaded Videos
          </v-btn>
        </v-col>
        <v-col cols="12" md="12">
          <v-card class="glass-card pa-4" elevation="6">
            <v-simple-table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Episode</th>
                  <th v-for="player in uploadablePlayers" :key="player.id">
                    {{ player.name }}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(session, idx) in sessions" :key="session.id">
                  <td>#{{ idx + 1 }}</td>
                  <td>
                    <template v-if="session.serie">
                      <span>Series: </span>
                      <router-link :to="`/panel/serie/${session.serie.id}/edit`" class="font-weight-bold">
                        {{ session.serie.title }}
                      </router-link>
                      <span> - Ep </span>
                      <a href="#" @click.prevent="goToEditEpisode(session)">
                        <v-progress-circular v-if="fetchingEpisodeForSessionId === session.id" indeterminate size="16" width="2" />
                        <span v-else class="font-weight-bold">{{ session.episode }}</span>
                      </a>
                    </template>
                    <span v-else>-</span>
                  </td>
                  <td v-for="player in uploadablePlayers" :key="player.id">
                    <div v-if="session.services && session.services[player.name]">
                      <!-- Status text above progress bar -->
                      <div v-if="session.services[player.name].status && session.services[player.name].status !== 'success' && session.services[player.name].status !== 'failed'" class="caption text--secondary mb-1">
                        {{ session.services[player.name].message || session.services[player.name].status }}
                        <span v-if="session.services[player.name].progress > 0" class="float-right">
                          {{ Math.round(session.services[player.name].progress) }}%
                        </span>
                      </div>
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
                          </v-icon>Retry
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
                  <td>
                    <div class="d-flex align-center gap-2">
                      <v-btn
                        v-if="shouldShowCreateEpisodeButton(session) && !session.episodeCreated"
                        x-small
                        color="grey darken-1"
                        :loading="isCreatingEpisode"
                        @click="createEpisodeFromSession(session)"
                      >
                        <v-icon small>
                          mdi-plus-box
                        </v-icon>
                        Create Episode
                      </v-btn>
                      <v-menu
                        v-if="session.serie && hasSuccessfulUploads(session)"
                        offset-y
                        :close-on-content-click="false"
                      >
                        <template #activator="{ on, attrs }">
                          <v-btn
                            x-small
                            color="grey darken-1"
                            :loading="loadingApplyPlayer === session.id"
                            class="ml-2"
                            v-bind="attrs"
                            v-on="on"
                            @click="fetchEpisodesForSerie(session.serie.id, session.id)"
                          >
                            <v-icon small>
                              mdi-plus
                            </v-icon>
                            Aplicar a capítulo
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            v-for="episode in availableEpisodes"
                            :key="episode.id"
                            @click="showPlayerSelectionForEpisode(episode, session)"
                          >
                            <v-list-item-content>
                              <v-list-item-title>
                                Episodio {{ episode.episode_number }}
                                <span v-if="episode.title"> - {{ episode.title }}</span>
                              </v-list-item-title>
                              <v-list-item-subtitle v-if="episodeHasPlayer(episode, 'HLS')">
                                <v-icon small color="orange">
                                  mdi-alert
                                </v-icon>
                                Ya tiene reproductor HLS
                              </v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                          <v-list-item v-if="!availableEpisodes.length">
                            <v-list-item-content>
                              <v-list-item-title>No hay episodios disponibles</v-list-item-title>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                      <v-btn
                        small
                        color="red"
                        icon
                        :loading="deletingSessionId === session.id"
                        @click="confirmDeleteSession(session)"
                      >
                        <v-icon small>
                          mdi-close
                        </v-icon>
                      </v-btn>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
    <v-alert
      v-model="alert.show"
      :type="alert.type"
      dense
      dismissible
      class="mt-4"
    >
      {{ alert.message }}
    </v-alert>
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
      episodeIsVisible: true,
      players: [],
      sessions: [],
      currentSession: null,
      fileRules: [
        v => !!v || 'Please select a file',
        v => !v || v.size <= 2000000000 || 'File must be smaller than 2GB',
        v => !v || v.type === 'video/mp4' || 'File must be in MP4 format'
      ],
      episodeRules: [
        v => !!v || 'Please enter the episode number',
        v => v > 0 || 'The episode number must be greater than 0'
      ],
      isUploading: false,
      lastUploadResults: null,
      isCreatingEpisode: false,
      fetchingEpisodeForSessionId: null,
      availableEpisodes: [],
      loadingApplyPlayer: null,
      deletingSessionId: null,
      alert: {
        show: false,
        type: 'info',
        message: ''
      }
    }
  },
  computed: {
    uploadablePlayers () {
      return this.players.filter(p => p.up_available && p.accounts && p.accounts.length > 0)
    }
  },
  async mounted () {
    await this.fetchAccounts()
    await this.fetchSessions()
    await this.checkAndResumeActiveSessions()
  },
  methods: {
    onSerieChange (serieObj) {
      this.selectedSerieObj = serieObj
      // Reset for a new upload flow
      this.lastUploadResults = null
      this.selectedFile = null
      this.episodeNumber = null
    },
    onFileSelected (file) {
      if (file && this.validateFile(file)) {
        this.$store.dispatch('uploader/selectFile', file)
      }
    },
    validateFile (file) {
      if (!file) { return false }
      if (file.type !== 'video/mp4') {
        this.showAlert('error', 'Please select an MP4 file')
        return false
      }
      if (file.size > 2000000000) { // 2GB limit
        this.showAlert('error', 'File must be smaller than 2GB')
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
    async checkAndResumeActiveSessions () {
      console.log('[RECOVERY] Verificando sesiones activas al cargar la página...')

      // Buscar sesiones con estados activos (incluyendo estados específicos de HLS)
      const activeSessions = this.sessions.filter((session) => {
        if (!session.services) { return false }

        return Object.values(session.services).some(service =>
          service.status === 'uploading' ||
          service.status === 'processing' ||
          service.status === 'retrying' ||
          service.status === 'Convirtiendo a HLS...' ||
          service.status === 'Subiendo a HLS...' ||
          service.status === 'Procesando HLS...' ||
          (service.status && service.status.includes('HLS') && service.status !== 'success' && service.status !== 'failed')
        )
      })

      console.log(`[RECOVERY] Encontradas ${activeSessions.length} sesiones activas`)

      if (activeSessions.length === 0) {
        console.log('[RECOVERY] No hay sesiones activas para recuperar')
        return
      }

      // Verificar cada sesión activa en el backend
      for (const session of activeSessions) {
        console.log(`[RECOVERY] Verificando sesión ${session.id} con servicios activos`)
        await this.verifyAndResumeSession(session)
      }
    },
    async verifyAndResumeSession (session) {
      console.log(`[RECOVERY] Verificando sesión ${session.id} - ${session.file_name}`)

      // Verificar cada servicio activo en la sesión (incluyendo estados específicos de HLS)
      const activeServices = Object.entries(session.services || {})
        .filter(([, service]) =>
          service.status === 'uploading' ||
          service.status === 'processing' ||
          service.status === 'retrying' ||
          service.status === 'Convirtiendo a HLS...' ||
          service.status === 'Subiendo a HLS...' ||
          service.status === 'Procesando HLS...' ||
          (service.status && service.status.includes('HLS') && service.status !== 'success' && service.status !== 'failed')
        )

      console.log(`[RECOVERY] Servicios activos encontrados: ${activeServices.map(([name]) => name).join(', ')}`)

      for (const [serviceName, serviceData] of activeServices) {
        console.log(`[RECOVERY] Verificando servicio ${serviceName} en sesión ${session.id}`)

        try {
          // Solo HLS tiene monitoreo de progreso en backend
          if (serviceName === 'HLS' || serviceName === 'HLS Player') {
            console.log(`[RECOVERY] Retomando monitoreo HLS para sesión ${session.id}`)
            await this.resumeHLSMonitoring(session, serviceName, serviceData)
          } else {
            // Para otros servicios (como MEGA), solo marcar como fallido si realmente han fallado
            // No marcar automáticamente como fallido por recarga de página
            console.log(`[RECOVERY] Servicio ${serviceName} no tiene monitoreo de backend, manteniendo estado actual`)
            // Los servicios como MEGA se procesan en el cliente, por lo que al recargar la página
            // es normal que se pierda el progreso, pero no significa que hayan fallado
            if (serviceData.status === 'uploading' || serviceData.status === 'processing') {
              console.log(`[RECOVERY] Servicio ${serviceName} estaba en progreso, marcando como interrumpido`)
              await this.markServiceAsFailed(session, serviceName, 'Sesión interrumpida por recarga de página - reinicie la subida si es necesario')
            }
          }
        } catch (error) {
          console.error(`[RECOVERY] Error verificando servicio ${serviceName}:`, error)
          await this.markServiceAsFailed(session, serviceName, error.message)
        }
      }
    },
    async resumeHLSMonitoring (session, serviceName, serviceData) {
      console.log(`[RECOVERY] Retomando monitoreo HLS para sesión ${session.id}`)
      console.log('[RECOVERY] Datos del servicio recibidos:', JSON.stringify(serviceData, null, 2))
      console.log('[RECOVERY] Estructura completa de session.services:', JSON.stringify(session.services, null, 2))

      // Establecer currentSession para que los callbacks funcionen correctamente
      this.currentSession = session
      console.log(`[RECOVERY] currentSession establecida para sesión ${session.id}`)

      // Buscar el jobId en los datos del servicio
      let jobId = null

      // Intentar obtener jobId de diferentes ubicaciones en la estructura JSON
      if (session.services && session.services[serviceName] && session.services[serviceName].jobId) {
        jobId = session.services[serviceName].jobId
        console.log(`[RECOVERY] JobId encontrado en session.services[${serviceName}]: ${jobId}`)
      } else if (serviceData && serviceData.jobId) {
        jobId = serviceData.jobId
        console.log(`[RECOVERY] JobId encontrado en serviceData: ${jobId}`)
      } else if (session.services && session.services.HLS && session.services.HLS.jobId) {
        jobId = session.services.HLS.jobId
        console.log(`[RECOVERY] JobId encontrado en session.services.HLS: ${jobId}`)
      }

      if (!jobId) {
        console.error(`[RECOVERY] No se pudo encontrar jobId para el servicio ${serviceName}`)
        console.log('[RECOVERY] Estructura de servicios disponible:', JSON.stringify(session.services, null, 2))
        await this.markServiceAsFailed(session, serviceName, 'No se encontró jobId para recuperar la conversión')
        return
      }

      try {
        console.log(`[RECOVERY] Retomando monitoreo con jobId: ${jobId}`)

        // Usar el composable HLS para reanudar el monitoreo
        const { useHLSUpload } = await import('~/composables/uploader/handlers/hls')
        const { monitorConversionProgress } = useHLSUpload()

        // Crear callbacks con el contexto correcto
        const updateProgressCallback = (progress) => {
          console.log(`[RECOVERY] Callback updateProgress: ${serviceName}, ${progress.percentage}%, ${progress.status}`)
          return this.updateUploadProgress(serviceName, progress)
        }

        const backendUrl = this.$config.API_STRAPI_ENDPOINT

        console.log(`[RECOVERY] Iniciando monitoreo de progreso para job ${jobId}`)

        // Retomar el monitoreo de progreso
        const result = await monitorConversionProgress(
          backendUrl,
          jobId,
          updateProgressCallback
        )

        if (result.status === 'completado') {
          console.log(`[RECOVERY] Conversión HLS completada para sesión ${session.id}`)
          await this.handleUploadSuccess(serviceName, result.hlsCode || result.code)
        } else {
          console.log(`[RECOVERY] Conversión HLS falló para sesión ${session.id}:`, result.error)
          await this.handleUploadError(serviceName, new Error(result.error || 'Error en conversión HLS'))
        }
      } catch (error) {
        console.error('[RECOVERY] Error retomando monitoreo HLS:', error)
        await this.handleUploadError(serviceName, error)
      }
    },
    async markServiceAsFailed (session, serviceName, errorMessage) {
      console.log(`[RECOVERY] Marcando servicio ${serviceName} como fallido en sesión ${session.id}: ${errorMessage}`)

      try {
        // Actualizar el estado local
        if (session.services && session.services[serviceName]) {
          session.services[serviceName].status = 'failed'
          session.services[serviceName].error = errorMessage
          session.services[serviceName].progress = 0
        }

        // Actualizar en el backend
        const token = this.$store.state.auth.token
        await this.$axios.put(
             `${this.$config.API_STRAPI_ENDPOINT}uploader-sessions/${session.id}`,
             {
               data: {
                 services: session.services
               }
             },
             {
               headers: {
                 Authorization: `Bearer ${token}`
               }
             }
        )

        console.log(`[RECOVERY] Estado actualizado para servicio ${serviceName} en sesión ${session.id}`)
      } catch (error) {
        console.error(`[RECOVERY] Error actualizando estado de servicio ${serviceName}:`, error)
      }
    },
    async fetchSessions () {
      const token = this.$store.state.auth.token
      // 1. Fetch sessions
      const sessionsQuery = qs.stringify({
        populate: ['serie'],
        sort: ['started_at:desc'],
        pagination: { page: 1, pageSize: 25 }
      }, { encodeValuesOnly: true })
      const sessionsRes = await fetch(`${this.$config.API_STRAPI_ENDPOINT}uploader-sessions?${sessionsQuery}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const sessionsData = await sessionsRes.json()
      if (!sessionsData.data) {
        this.sessions = []
        return
      }
      const sessions = sessionsData.data
      // 2. Get unique serie IDs
      const serieIds = [...new Set(sessions.map(s => s.serie?.id).filter(Boolean))]
      if (serieIds.length === 0) {
        this.sessions = sessions
        return
      }
      // 3. Fetch all relevant episodes for those series
      const episodesQuery = qs.stringify({
        filters: {
          serie: {
            id: {
              $in: serieIds
            }
          }
        },
        fields: ['episode_number'],
        populate: ['serie'] // to get serie id
      }, { encodeValuesOnly: true })
      const episodesRes = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${episodesQuery}`, {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      })
      const episodesData = await episodesRes.json()
      const existingEpisodes = episodesData.data || []
      // 4. Create a lookup set for quick checks
      const episodeLookup = new Set(
        existingEpisodes.map(ep => `${ep.serie.id}-${ep.episode_number}`)
      )
      // 5. Augment sessions with episodeCreated flag
      this.sessions = sessions.map(session => ({
        ...session,
        episodeCreated: session.serie ? episodeLookup.has(`${session.serie.id}-${session.episode}`) : false
      }))
    },
    formatDate (dateStr) {
      if (!dateStr) { return '-' }
      const d = new Date(dateStr)
      return d.toLocaleString()
    },
    getStatusColor (status) {
      switch (status) {
        case 'success':
        case 'completed':
          return 'green'
        case 'failed': return 'red'
        case 'uploading': return 'blue'
        default: return 'grey'
      }
    },
    showAlert (type, message) {
      this.alert.type = type
      this.alert.message = message
      this.alert.show = true
    },
    async startUpload () {
      if (!this.selectedFile || !this.selectedSerie || !this.episodeNumber) {
        this.showAlert('error', 'Please select a series, episode number, and a file')
        return
      }

      // Check if episode already exists
      try {
        const token = this.$store.state.auth.token
        const query = qs.stringify({
          filters: {
            serie: { id: { $eq: this.selectedSerie } },
            episode_number: { $eq: this.episodeNumber }
          }
        }, { encodeValuesOnly: true })

        const checkRes = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        if (!checkRes.ok) {
          throw new Error('Failed to check if episode exists')
        }

        const existingEpisodes = await checkRes.json()

        if (existingEpisodes.data && existingEpisodes.data.length > 0) {
          this.showAlert('error', `Episode ${this.episodeNumber} already exists for this series. Please delete it before proceeding.`)
          return // Stop the upload
        }
      } catch (error) {
        console.error('Error checking if episode exists:', error)
        this.showAlert('error', 'Error checking if episode exists. Please try again.')
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

        const latestAccount = this.players.map(player => ({
          service: player.name,
          email: player.accounts[0]?.email ?? '',
          password: player.accounts[0]?.password ?? '',
          username: player.accounts[0]?.username ?? '',
          api_key: player.accounts[0]?.api_key ?? ''
        }))

        // Start upload to all services
        const { uploadToMultipleServices } = useUploadManager()
        const results = await uploadToMultipleServices(
          this.selectedFile,
          latestAccount,
          this.$store,
          this,
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
        this.showAlert('error', `Upload error: ${error.message}`)
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
        // Almacenar jobId si se proporciona (para HLS)
        if (progress.jobId) {
          this.$set(sessionToUpdate.services[service], 'jobId', progress.jobId)
        }
        // Almacenar AbortController si se proporciona (para HLS)
        if (progress.abortController) {
          this.$set(sessionToUpdate.services[service], 'abortController', progress.abortController)
        }
      }

      const token = this.$store.state.auth.token
      const serviceData = {
        ...this.currentSession.services[service],
        progress: progress.percentage,
        status: progress.status
      }

      // Almacenar jobId si se proporciona (para HLS)
      if (progress.jobId) {
        serviceData.jobId = progress.jobId
      }
      // Nota: AbortController no se envía al backend, solo se mantiene localmente

      const services = {
        ...this.currentSession.services,
        [service]: serviceData
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
        this.$set(sessionToUpdate.services[service], 'code', result)
      }

      const token = this.$store.state.auth.token
      const services = {
        ...this.currentSession.services,
        [service]: {
          status: 'success',
          progress: 100,
          code: result
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

      // Check if episode exists and update episodeCreated flag
      if (sessionToUpdate && sessionToUpdate.serie && sessionToUpdate.episode) {
        try {
          const qs = require('qs')
          const query = qs.stringify({
            filters: {
              serie: { id: { $eq: sessionToUpdate.serie.id } },
              episode_number: { $eq: sessionToUpdate.episode }
            },
            fields: ['id']
          }, { encodeValuesOnly: true })

          const checkRes = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          })

          if (checkRes.ok) {
            const episodes = await checkRes.json()
            if (episodes.data && episodes.data.length > 0) {
              // Episode exists, update episodeCreated flag
              this.$set(sessionToUpdate, 'episodeCreated', true)
            }
          }
        } catch (error) {
          console.error('Error checking episode existence:', error)
        }
      }
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
        this.showAlert('error', `Retry error: ${error.message}`)
      }
    },
    shouldShowCreateEpisodeButton (session) {
      // Show button if at least one service uploaded successfully and has a code
      return Object.values(session.services || {}).some(s => s.status === 'success' && s.code)
    },
    async createEpisodeFromSession (session) {
      this.isCreatingEpisode = true
      try {
        // 0. Fetch full serie data to get default image
        const token = this.$store.state.auth.token
        const serieRes = await fetch(`${this.$config.API_STRAPI_ENDPOINT}series/${session.serie.id}?populate[images][populate][0]=image_type`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (!serieRes.ok) { throw new Error('Could not fetch series data') }
        const serieData = await serieRes.json()
        const defaultImage = serieData.data.images.find(img => img.image_type.name === 'screenshot')
        if (!defaultImage) { throw new Error('The series does not have a default screenshot image') }

        // 1. Check if episode already exists
        const query = qs.stringify({
          filters: {
            serie: { id: { $eq: session.serie.id } },
            episode_number: { $eq: session.episode }
          }
        }, { encodeValuesOnly: true })

        const checkRes = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        if (!checkRes.ok) { throw new Error('Failed to check if episode exists') }
        const existingEpisodes = await checkRes.json()

        if (existingEpisodes.data && existingEpisodes.data.length > 0) {
          this.showAlert('error', `Episode ${session.episode} already exists for this series.`)
          return
        }

        // 2. Get successful uploads data
        const successfulUploads = Object.entries(session.services || {})
          .filter(([, status]) => status.status === 'success' && status.code)
          .map(([service, status]) => ({ service, code: status.code }))

        if (successfulUploads.length === 0) {
          this.showAlert('error', 'No successful uploads to create an episode from.')
          return
        }

        // 3. Create new episode
        const episodeData = {
          data: {
            serie: session.serie.id,
            episode_number: session.episode,
            visible: session.visible !== undefined ? session.visible : true,
            isNew: true,
            hasCustomScreenshot: false,
            image: defaultImage.id,
            players: JSON.stringify(successfulUploads.map((upload) => {
              const playerInfo = this.players.find(p => p.name === upload.service)
              const url = playerInfo ? playerInfo.player_code.replace('codigo', upload.code) : ''

              return {
                name: upload.service,
                code: upload.code,
                url
              }
            })),
            downloads: '[]'
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

        const newEpisode = await res.json()
        this.showAlert('success', 'Episode created successfully. Redirecting...')

        // Redirect to the episode edit page
        setTimeout(() => {
          this.$router.push({ path: `/panel/serie/${session.serie.id}/episodes/${newEpisode.data.id}/edit` })
        }, 1500)
      } catch (error) {
        console.error('Create episode error:', error)
        this.showAlert('error', `Error creating episode: ${error.message}`)
      } finally {
        this.isCreatingEpisode = false
      }
    },
    confirmDeleteSession (session) {
      if (confirm(`¿Estás seguro de que quieres eliminar la sesión "${session.file_name || 'Sin título'}"?`)) {
        this.deleteSession(session)
      }
    },
    async deleteSession (session) {
      this.deletingSessionId = session.id
      try {
        const token = this.$store.state.auth.token

        // Cancel active HLS jobs before deleting session
        await this.cancelActiveHLSJobs(session, token)

        const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}uploader-sessions/${session.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          throw new Error('Failed to delete session')
        }

        // Remove from local sessions array
        this.sessions = this.sessions.filter(s => s.id !== session.id)
        this.showAlert('success', 'Session deleted successfully')
      } catch (error) {
        console.error('Delete session error:', error)
        this.showAlert('error', `Error deleting session: ${error.message}`)
      } finally {
        this.deletingSessionId = null
      }
    },
    cancelActiveHLSJobs (session, token) {
      if (!session.services) { return }

      // Find active HLS services with jobId
      const hlsService = session.services.HLS
      if (!hlsService) { return }

      // Check if HLS service is active and has a jobId
      const isHLSActive = hlsService.status &&
        hlsService.status !== 'success' &&
        hlsService.status !== 'failed' &&
        (hlsService.status.includes('HLS') ||
         hlsService.status === 'uploading' ||
         hlsService.status === 'processing' ||
         hlsService.status === 'retrying')

      const jobId = hlsService.jobId || (hlsService.data && hlsService.data.jobId)

      if (isHLSActive && jobId) {
        try {
          console.log(`[CANCEL] Cancelling HLS job ${jobId} for session ${session.id}`)

          // Abortar el monitoreo usando AbortController si existe
          if (hlsService.abortController) {
            console.log(`[CANCEL] Aborting HLS monitoring for job ${jobId}`)
            hlsService.abortController.abort()
          }

          // Marcar inmediatamente el servicio como cancelado localmente
          hlsService.status = 'cancelled'
          hlsService.percentage = 0

          // Enviar cancelación al backend (sin esperar respuesta para continuar)
          fetch(`${this.$config.API_STRAPI_ENDPOINT}hls-converter/cancel/${jobId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            }
          }).then((cancelRes) => {
            if (cancelRes.ok) {
              console.log(`[CANCEL] Successfully cancelled HLS job ${jobId}`)
            } else {
              console.warn(`[CANCEL] Failed to cancel HLS job ${jobId}:`, cancelRes.statusText)
            }
          }).catch((error) => {
            console.error(`[CANCEL] Error cancelling HLS job ${jobId}:`, error)
          })
        } catch (error) {
          console.error(`[CANCEL] Error cancelling HLS job ${jobId}:`, error)
          // Don't throw error - continue with session deletion even if cancellation fails
        }
      }
    },
    createEpisodeFromLastUpload () {
      if (!this.lastUploadResults || this.lastUploadResults.successful.length === 0) {
        this.showAlert('error', 'No successful uploads to create an episode from.')
        return
      }

      const sessionData = {
        serie: { id: this.selectedSerie, title: this.selectedSerieObj.rawTitle },
        episode: this.episodeNumber,
        visible: this.episodeIsVisible,
        services: this.lastUploadResults.successful.reduce((acc, p) => {
          acc[p.service] = { status: 'success', code: p.result }
          return acc
        }, {})
      }

      this.createEpisodeFromSession(sessionData)
    },
    async goToEditEpisode (session) {
      if (!session || !session.serie || !session.episode) {
        this.showAlert('error', 'Invalid session information.')
        return
      }
      this.fetchingEpisodeForSessionId = session.id
      try {
        const token = this.$store.state.auth.token
        const query = qs.stringify({
          filters: {
            serie: { id: { $eq: session.serie.id } },
            episode_number: { $eq: session.episode }
          },
          fields: ['id']
        }, { encodeValuesOnly: true })

        const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
        })

        if (!res.ok) {
          throw new Error('Could not find the episode.')
        }

        const episodes = await res.json()

        if (episodes.data && episodes.data.length > 0) {
          const episodeId = episodes.data[0].id
          this.$router.push({ path: `/panel/serie/${session.serie.id}/episodes/${episodeId}/edit` })
        } else {
          this.showAlert('warning', 'This episode has not been created yet. Please create it using the actions button.')
        }
      } catch (error) {
        console.error('Error finding episode ID:', error)
        this.showAlert('error', 'An error occurred while searching for the episode.')
      } finally {
        this.fetchingEpisodeForSessionId = null
      }
    },
    async fetchEpisodesForSerie (serieId, sessionId) {
      this.loadingApplyPlayer = sessionId
      try {
        const token = this.$store.state.auth.token
        const query = qs.stringify({
          filters: {
            serie: { id: { $eq: serieId } }
          },
          populate: ['id', 'episode_number', 'title', 'players'],
          sort: ['episode_number:asc'],
          pagination: { page: 1, pageSize: 100 }
        }, { encodeValuesOnly: true })

        const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        if (!res.ok) {
          throw new Error('Error al obtener episodios')
        }

        const data = await res.json()
        this.availableEpisodes = data.data || []
      } catch (error) {
        console.error('Error fetching episodes:', error)
        this.showAlert('error', `Error al obtener episodios: ${error.message}`)
        this.availableEpisodes = []
      } finally {
        this.loadingApplyPlayer = null
      }
    },
    episodeHasPlayer (episode, playerName) {
      if (!episode.players) { return false }
      try {
        const players = typeof episode.players === 'string' ? JSON.parse(episode.players) : episode.players
        return players.some(player => player.name === playerName)
      } catch (error) {
        console.error('Error parsing episode players:', error)
        return false
      }
    },
    hasSuccessfulUploads (session) {
      if (!session.services) { return false }
      return Object.values(session.services).some(service => service.status === 'success')
    },
    showPlayerSelectionForEpisode (episode, session) {
      // Obtener reproductores exitosos de la sesión
      const successfulPlayers = Object.entries(session.services || {})
        .filter(([, service]) => service.status === 'success')
        .map(([playerName, service]) => ({ playerName, code: service.code }))

      if (successfulPlayers.length === 0) {
        this.showAlert('warning', 'No hay reproductores exitosos para aplicar')
        return
      }

      // Si solo hay un reproductor exitoso, aplicarlo directamente
      if (successfulPlayers.length === 1) {
        const { playerName, code } = successfulPlayers[0]
        this.applyPlayerToEpisode(episode.id, playerName, code, session.id)
        return
      }

      // Si hay múltiples reproductores, mostrar diálogo de selección
      this.showPlayerSelectionDialog(episode, successfulPlayers, session)
    },
    showPlayerSelectionDialog (episode, players, session) {
      // Por simplicidad, aplicar todos los reproductores exitosos
      players.forEach(({ playerName, code }) => {
        this.applyPlayerToEpisode(episode.id, playerName, code, session.id)
      })
    },
    async applyPlayerToEpisode (episodeId, playerName, playerCode, sessionId) {
      this.loadingApplyPlayer = sessionId
      try {
        const token = this.$store.state.auth.token

        // 1. Obtener el episodio actual
        const episodeRes = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes/${episodeId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })

        if (!episodeRes.ok) {
          throw new Error('Error al obtener el episodio')
        }

        const episodeData = await episodeRes.json()
        const episode = episodeData.data

        // 2. Parsear reproductores existentes
        let existingPlayers = []
        try {
          existingPlayers = episode.players ? JSON.parse(episode.players) : []
        } catch (error) {
          console.error('Error parsing existing players:', error)
          existingPlayers = []
        }

        // 3. Verificar si el reproductor ya existe
        const playerExists = existingPlayers.some(player => player.name === playerName)
        if (playerExists) {
          this.showAlert('warning', `El reproductor ${playerName} ya existe en este episodio`)
          return
        }

        // 4. Obtener información del reproductor
        const playerInfo = this.players.find(p => p.name === playerName)
        if (!playerInfo) {
          throw new Error(`No se encontró información del reproductor ${playerName}`)
        }

        // 5. Crear nuevo reproductor
        const newPlayer = {
          name: playerName,
          code: playerCode,
          url: playerInfo.player_code.replace('codigo', playerCode)
        }

        // 6. Agregar el nuevo reproductor
        const updatedPlayers = [...existingPlayers, newPlayer]

        // 7. Actualizar el episodio
        const updateRes = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes/${episodeId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            data: {
              players: JSON.stringify(updatedPlayers)
            }
          })
        })

        if (!updateRes.ok) {
          throw new Error('Error al actualizar el episodio')
        }

        this.showAlert('success', `Reproductor ${playerName} agregado exitosamente al episodio ${episode.episode_number}`)

        // 8. Actualizar la lista de episodios disponibles
        const updatedEpisode = this.availableEpisodes.find(ep => ep.id === episodeId)
        if (updatedEpisode) {
          updatedEpisode.players = JSON.stringify(updatedPlayers)
        }
      } catch (error) {
        console.error('Error applying player to episode:', error)
        this.showAlert('error', `Error al aplicar reproductor: ${error.message}`)
      } finally {
        this.loadingApplyPlayer = null
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

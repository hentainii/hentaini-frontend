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
                  <th v-for="player in players" :key="player.id">
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
                    <v-btn
                      v-if="shouldShowCreateEpisodeButton(session) && !session.episodeCreated"
                      small
                      color="primary"
                      :loading="isCreatingEpisode"
                      @click="createEpisodeFromSession(session)"
                    >
                      Create Episode
                    </v-btn>
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
      alert: {
        show: false,
        type: 'info',
        message: ''
      }
    }
  },
  async mounted () {
    await this.fetchAccounts()
    await this.fetchSessions()
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
        case 'success': return 'green'
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

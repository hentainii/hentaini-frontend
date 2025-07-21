<template>
  <v-container class="pa-6">
    <v-card class="glass-card pa-6" elevation="10">
      <v-row>
        <v-col cols="12" md="4">
          <EpisodeAutocomplete
            v-model="selectedEpisode"
            @change="onEpisodeChange"
          />
          <v-file-input
            v-model="selectedFile"
            label="Selecciona el archivo a subir"
            prepend-icon="mdi-file-upload"
            outlined
            dense
            :disabled="!selectedEpisode"
          />
          <v-btn
            class="mt-4 primary rounded-xl"
            :disabled="!selectedFile || !selectedEpisode || isUploading"
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
        <v-col cols="12" md="8">
          <v-card class="glass-card pa-4" elevation="6">
            <v-card-title class="subtitle-1 font-weight-bold mb-2">
              <v-icon left color="primary">
                mdi-table
              </v-icon>
              Historial de subidas
            </v-card-title>
            <v-simple-table>
              <thead>
                <tr>
                  <th>Episodio</th>
                  <th v-for="account in accounts" :key="account">
                    {{ account }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in uploadHistory" :key="row.episode.id">
                  <td>{{ row.episode.title }}</td>
                  <td v-for="account in accounts" :key="account">
                    <div v-if="row[account]">
                      <v-progress-linear
                        :value="row[account].progress"
                        :color="getStatusColor(row[account].status)"
                        height="8"
                        rounded
                      />
                      <div v-if="row[account].status === 'failed'">
                        <v-btn small color="red" @click="retryUpload(row.episode.id, account)">
                          <v-icon left>
                            mdi-refresh
                          </v-icon>Reintentar
                        </v-btn>
                        <div class="error-message">
                          {{ row[account].error_message }}
                        </div>
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
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>

<script>
import qs from 'qs'
import EpisodeAutocomplete from '~/components/EpisodeAutocomplete.vue'

export default {
  name: 'UploaderPage',
  layout: 'panel',
  components: {
    EpisodeAutocomplete
  },
  data () {
    return {
      search: '',
      episodes: [],
      filteredEpisodes: [],
      selectedEpisode: null,
      selectedFile: null,
      isUploading: false,
      accounts: [],
      uploadHistory: [],
      isSearching: false
    }
  },
  async mounted () {
    await this.fetchAccounts()
    await this.fetchLatestEpisodes()
    await this.fetchUploadHistory()
  },
  methods: {
    onEpisodeChange (episodeObj) {
      this.selectedEpisodeObj = episodeObj
    },
    async fetchAccounts () {
      // Obtener token desde el store
      const token = this.$store.state.auth.token
      // Usar el endpoint de players para obtener las cuentas habilitadas
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
    async fetchLatestEpisodes () {
      const token = this.$store.state.auth.token
      const query = qs.stringify({
        populate: ['serie'],
        sort: ['createdAt:desc'],
        pagination: { page: 1, pageSize: 25 }
      }, { encodeValuesOnly: true })
      const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      this.episodes = data.data.map(ep => ({
        id: ep.id,
        title: `${ep.serie && ep.serie.title ? ep.serie.title : 'Sin serie'} - Episodio ${ep.episode_number}`,
        episode_number: ep.episode_number,
        serie: ep.serie || null
      }))
      this.filteredEpisodes = this.episodes
    },
    async filterEpisodes () {
      const term = (this.search || '').toLowerCase()
      // Buscar en los últimos 25 episodios
      const localResults = this.episodes.filter(e => (e.title || '').toLowerCase().includes(term))
      if (term.length === 0 || localResults.length > 0) {
        this.filteredEpisodes = localResults
        return
      }
      // Si no hay resultados locales, buscar en la API
      this.isSearching = true
      const token = this.$store.state.auth.token
      const query = qs.stringify({
        filters: {
          title: { $containsi: term }
        },
        populate: ['serie'],
        sort: ['createdAt:desc'],
        pagination: { page: 1, pageSize: 25 }
      }, { encodeValuesOnly: true })
      const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      this.filteredEpisodes = data.data.map(ep => ({
        id: ep.id,
        title: `${ep.serie && ep.serie.title ? ep.serie.title : 'Sin serie'} - Episodio ${ep.episode_number}`,
        episode_number: ep.episode_number,
        serie: ep.serie || null
      }))
      this.isSearching = false
    },
    async fetchUploadHistory () {
      const token = this.$store.state.auth.token
      const query = qs.stringify({
        populate: ['episode'],
        sort: ['uploaded_at:desc'],
        pagination: { page: 1, pageSize: 100 }
      }, { encodeValuesOnly: true })
      const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}uploader-histories?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      const historyMap = {}
      data.data.forEach((item) => {
        const episode = item.episode
        const epId = episode && episode.id ? episode.id : null
        if (!epId) { return }
        if (!historyMap[epId]) {
          historyMap[epId] = {
            episode: {
              id: epId,
              title: episode.serie && episode.serie.title
                ? `${episode.serie.title} - Episodio ${episode.episode_number}`
                : `Episodio ${episode.episode_number}`
            }
          }
        }
        historyMap[epId][item.account] = {
          progress: item.progress,
          status: item.status,
          error_message: item.error_message || ''
        }
      })
      this.uploadHistory = Object.values(historyMap)
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
      this.isUploading = true
      // Aquí iría la lógica real de subida y actualización del historial
      // ...
      this.isUploading = false
      await this.fetchUploadHistory()
    },
    async retryUpload (episodeId, account) {
      // Aquí iría la lógica real para reintentar la subida fallida
      // ...
      await this.fetchUploadHistory()
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

<template>
  <v-container fluid class="pa-4">
    <!-- Header -->
    <div class="mb-4">
      <h2 class="text-h5 mb-2">
        Migración a Cloudflare Images
      </h2>
      <p class="text-body-2 text--secondary">
        Migra imágenes del servidor local a Cloudflare Images
      </p>
    </div>

    <!-- Compact Stats & Controls -->
    <v-card dark class="mb-4 pa-4">
      <v-row align="center">
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="3">
              <div class="text-center">
                <div class="text-h6">
                  {{ stats.total || 0 }}
                </div>
                <div class="text-caption text--secondary">
                  Total
                </div>
              </div>
            </v-col>
            <v-col cols="3">
              <div class="text-center">
                <div class="text-h6 success--text">
                  {{ stats.migrated || 0 }}
                </div>
                <div class="text-caption text--secondary">
                  Migradas
                </div>
              </div>
            </v-col>
            <v-col cols="3">
              <div class="text-center">
                <div class="text-h6 warning--text">
                  {{ stats.pending || 0 }}
                </div>
                <div class="text-caption text--secondary">
                  Pendientes
                </div>
              </div>
            </v-col>
            <v-col cols="3">
              <div class="text-center">
                <div class="text-h6 error--text">
                  {{ stats.failed || 0 }}
                </div>
                <div class="text-caption text--secondary">
                  Fallidas
                </div>
              </div>
            </v-col>
          </v-row>

          <!-- Progress Bar -->
          <v-progress-linear
            v-if="stats.total > 0"
            :value="stats.progress || 0"
            height="8"
            rounded
            color="primary"
            class="mt-3"
          />
          <div v-if="stats.total > 0" class="text-caption text--secondary mt-1">
            {{ stats.progress || 0 }}% completado
          </div>
        </v-col>

        <v-col cols="12" md="4">
          <div class="d-flex flex-column align-end">
            <v-chip
              small
              :color="getProcessStatusColor()"
              class="mb-2"
            >
              <v-icon left small>
                {{ getProcessStatusIcon() }}
              </v-icon>
              {{ getProcessStatusText() }}
            </v-chip>

            <div class="d-flex flex-wrap ga-2">
              <v-btn
                :disabled="processStatus.isRunning || loading"
                color="primary"
                small
                @click="startMigration"
              >
                <v-icon left small>
                  mdi-play
                </v-icon>
                Iniciar
              </v-btn>

              <v-btn
                :disabled="!processStatus.isRunning || processStatus.isPaused || loading"
                color="warning"
                small
                @click="pauseMigration"
              >
                <v-icon left small>
                  mdi-pause
                </v-icon>
                Pausar
              </v-btn>

              <v-btn
                :disabled="!processStatus.isRunning || !processStatus.isPaused || loading"
                color="success"
                small
                @click="resumeMigration"
              >
                <v-icon left small>
                  mdi-play
                </v-icon>
                Reanudar
              </v-btn>

              <v-btn
                :disabled="processStatus.isRunning || stats.failed === 0 || loading"
                color="error"
                small
                @click="retryFailed"
              >
                <v-icon left small>
                  mdi-refresh
                </v-icon>
                Reintentar
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- Images List -->
    <v-card dark>
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <h3 class="text-h6">
          Lista de Imágenes
        </h3>
        <div class="d-flex align-center ga-2">
          <v-select
            v-model="selectedStatus"
            :items="statusOptions"
            item-text="text"
            item-value="value"
            label="Estado"
            dense
            outlined
            hide-details
            style="min-width: 120px;"
            @change="loadImages"
          />
          <v-btn
            color="primary"
            small
            @click="loadImages"
          >
            <v-icon small>
              mdi-refresh
            </v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-data-table
        :headers="tableHeaders"
        :items="images"
        :loading="loading"
        class="elevation-0"
        dark
        dense
        hide-default-footer
      >
        <template #[`item.image`]="{ item }">
          <div class="d-flex align-center py-1">
            <v-avatar size="32" class="mr-2">
              <v-img
                :src="getImageUrl(item.path)"
                :alt="`Image ${item.id}`"
              />
            </v-avatar>
            <div>
              <div class="text-body-2">
                {{ getImageName(item.path) }}
              </div>
              <div class="text-caption text--secondary">
                {{ item.image_type }}
              </div>
            </div>
          </div>
        </template>

        <template #[`item.series`]="{ item }">
          <div class="text-body-2">
            {{ item.series?.name || 'Sin serie' }}
          </div>
        </template>

        <template #[`item.status`]="{ item }">
          <v-chip
            x-small
            :color="getStatusChipColor(item)"
            dark
          >
            {{ getStatusText(item) }}
          </v-chip>
        </template>

        <template #[`item.cf_path`]="{ item }">
          <a
            v-if="item.cf_path"
            :href="item.cf_path"
            target="_blank"
            class="text-decoration-none primary--text"
          >
            <v-icon small>mdi-open-in-new</v-icon>
          </a>
          <span v-else class="text--disabled">-</span>
        </template>

        <template #[`item.actions`]="{ item }">
          <v-btn
            v-if="item.migration_status === 'failed'"
            :disabled="loading"
            x-small
            color="primary"
            text
            @click="retryImage(item.id)"
          >
            <v-icon x-small>
              mdi-refresh
            </v-icon>
          </v-btn>
        </template>
      </v-data-table>

      <!-- Pagination -->
      <v-card-actions v-if="pagination.totalPages > 1" class="justify-space-between pa-4">
        <div class="text-caption text--secondary">
          {{ ((pagination.page - 1) * pagination.limit) + 1 }}-{{ Math.min(pagination.page * pagination.limit, pagination.total) }} de {{ pagination.total }}
        </div>
        <div class="d-flex ga-1">
          <v-btn
            :disabled="pagination.page <= 1"
            x-small
            @click="changePage(pagination.page - 1)"
          >
            <v-icon x-small>
              mdi-chevron-left
            </v-icon>
          </v-btn>
          <v-btn
            :disabled="pagination.page >= pagination.totalPages"
            x-small
            @click="changePage(pagination.page + 1)"
          >
            <v-icon x-small>
              mdi-chevron-right
            </v-icon>
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
    <!-- Toast Notifications -->
    <v-snackbar
      v-model="notification.show"
      :color="notification.type === 'success' ? 'success' : notification.type === 'error' ? 'error' : 'info'"
      :timeout="5000"
      top
      right
    >
      <strong>{{ notification.title }}</strong><br>
      {{ notification.message }}
      <template #action="{ attrs }">
        <v-btn
          color="white"
          text
          v-bind="attrs"
          @click="hideNotification"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      stats: {
        total: 0,
        migrated: 0,
        pending: 0,
        failed: 0,
        progress: 0
      },
      processStatus: {
        isRunning: false,
        isPaused: false,
        processId: null,
        startedAt: null,
        pausedAt: null,
        batchSize: 10,
        currentBatch: 0,
        totalProcessed: 0,
        successCount: 0,
        errorCount: 0,
        retryFailedOnly: false
      },
      images: [],
      loading: false,
      selectedStatus: '',
      pagination: {
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0
      },
      notification: {
        show: false,
        type: 'info',
        title: '',
        message: ''
      },
      tableHeaders: [
        { text: 'ID', value: 'id', sortable: false, width: '60px' },
        { text: 'Imagen', value: 'image', sortable: false },
        { text: 'Serie', value: 'series', sortable: false },
        { text: 'Estado', value: 'status', sortable: false, width: '100px' },
        { text: 'CF', value: 'cf_path', sortable: false, width: '50px' },
        { text: '', value: 'actions', sortable: false, width: '50px' }
      ],
      statusOptions: [
        { text: 'Todos', value: '' },
        { text: 'Pendientes', value: 'pending' },
        { text: 'Migradas', value: 'migrated' },
        { text: 'Fallidas', value: 'failed' }
      ],
      refreshInterval: null,
      statsInterval: null,
      API_BASE: 'http://localhost:1337/api'
    }
  },
  mounted () {
    this.loadStats()
    this.loadImages()

    this.statsInterval = setInterval(() => {
      this.loadStats()
    }, 2000)

    this.refreshInterval = setInterval(() => {
      if (!this.loading) {
        this.loadImages()
      }
    }, 10000)
  },
  beforeDestroy () {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
    if (this.statsInterval) {
      clearInterval(this.statsInterval)
    }
  },
  methods: {
    showNotification (type, title, message) {
      this.notification = {
        show: true,
        type,
        title,
        message
      }
      setTimeout(() => {
        this.hideNotification()
      }, 5000)
    },
    hideNotification () {
      this.notification.show = false
    },
    async loadStats () {
      try {
        const response = await fetch(`${this.API_BASE}/images/migration-status?t=${new Date().getTime()}`)
        const data = await response.json()
        if (data.success) {
          this.stats = data.data.stats
          this.processStatus = data.data.process
        }
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    },
    async loadImages () {
      try {
        const params = new URLSearchParams({
          page: this.pagination.page,
          limit: this.pagination.limit
        })
        if (this.selectedStatus) {
          params.append('status', this.selectedStatus)
        }
        const response = await fetch(`${this.API_BASE}/images/pending-migration?${params}`)
        const data = await response.json()
        if (data.success) {
          this.images = data.data
          this.pagination = {
            ...this.pagination,
            ...data.meta
          }
          if (data.stats) {
            this.stats = data.stats
          }
        }
      } catch (error) {
        console.error('Error loading images:', error)
        this.showNotification('error', 'Error', 'No se pudieron cargar las imágenes')
      }
    },
    async startMigration () {
      this.loading = true
      try {
        const response = await fetch(`${this.API_BASE}/images/start-migration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            batchSize: 10,
            retryFailedOnly: false
          })
        })
        const data = await response.json()
        if (data.success) {
          this.showNotification('success', 'Éxito', 'Proceso de migración iniciado')
          await this.loadStats()
          // Esperar un poco más para asegurar que el estado se actualice
          await new Promise(resolve => setTimeout(resolve, 1500))
          await this.loadStats()
          this.loading = false
        } else {
          throw new Error(data.message || 'Error al iniciar migración')
        }
      } catch (error) {
        console.error('Error starting migration:', error)
        this.showNotification('error', 'Error', error.message)
        this.loading = false
      }
    },
    async pauseMigration () {
      this.loading = true
      try {
        const response = await fetch(`${this.API_BASE}/images/pause-migration`, {
          method: 'POST'
        })
        const data = await response.json()
        if (data.success) {
          this.showNotification('info', 'Pausado', 'Proceso de migración pausado')
          setTimeout(() => {
            this.loadStats()
          }, 500)
        } else {
          throw new Error(data.message || 'Error al pausar migración')
        }
      } catch (error) {
        console.error('Error pausing migration:', error)
        this.showNotification('error', 'Error', error.message)
      } finally {
        this.loading = false
      }
    },
    async resumeMigration () {
      this.loading = true
      try {
        const response = await fetch(`${this.API_BASE}/images/resume-migration`, {
          method: 'POST'
        })
        const data = await response.json()
        if (data.success) {
          this.showNotification('success', 'Reanudado', 'Proceso de migración reanudado')
          setTimeout(() => {
            this.loadStats()
          }, 500)
        } else {
          throw new Error(data.message || 'Error al reanudar migración')
        }
      } catch (error) {
        console.error('Error resuming migration:', error)
        this.showNotification('error', 'Error', error.message)
      } finally {
        this.loading = false
      }
    },
    async retryFailed () {
      this.loading = true
      try {
        const response = await fetch(`${this.API_BASE}/images/start-migration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            batchSize: 10,
            retryFailedOnly: true
          })
        })
        const data = await response.json()
        if (data.success) {
          this.showNotification('success', 'Éxito', 'Reintentando imágenes fallidas')
          await this.loadStats()
        } else {
          throw new Error(data.message || 'Error al reintentar migración')
        }
      } catch (error) {
        console.error('Error retrying failed:', error)
        this.showNotification('error', 'Error', error.message)
      } finally {
        this.loading = false
      }
    },
    async retryImage (imageId) {
      this.loading = true
      try {
        const response = await fetch(`${this.API_BASE}/images/${imageId}/retry-migration`, {
          method: 'POST'
        })
        const data = await response.json()
        if (data.success) {
          this.showNotification('success', 'Éxito', 'Imagen reintentada exitosamente')
          await this.loadImages()
          await this.loadStats()
        } else {
          throw new Error(data.message || 'Error al reintentar imagen')
        }
      } catch (error) {
        console.error('Error retrying image:', error)
        this.showNotification('error', 'Error', error.message)
      } finally {
        this.loading = false
      }
    },
    changePage (page) {
      this.pagination.page = page
      this.loadImages()
    },
    getProcessStatusText () {
      if (!this.processStatus.isRunning) { return 'Detenido' }
      if (this.processStatus.isPaused) { return 'Pausado' }
      return 'Ejecutándose'
    },
    getImageUrl (path) {
      if (!path) { return '/placeholder-image.jpg' }
      return `https://admin.hentaini.com/uploads/${path}`
    },
    getImageName (path) {
      if (!path) { return 'Sin nombre' }
      return path.split('/').pop()
    },
    getProcessStatusColor () {
      if (!this.processStatus.isRunning) { return 'grey' }
      if (this.processStatus.isPaused) { return 'orange' }
      return 'green'
    },
    getProcessStatusIcon () {
      if (!this.processStatus.isRunning) { return 'mdi-stop' }
      if (this.processStatus.isPaused) { return 'mdi-pause' }
      return 'mdi-play'
    },
    getStatusChipColor (image) {
      if (image.cf_path) { return 'success' }
      if (image.migration_status === 'failed') { return 'error' }
      return 'warning'
    },
    getStatusText (image) {
      if (image.cf_path) {
        return 'Migrada'
      } else if (image.migration_status === 'failed') {
        return 'Fallida'
      } else {
        return 'Pendiente'
      }
    }
  }
}
</script>

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
                @error="handleImageError"
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

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Reactive data
const stats = ref({
  total: 0,
  migrated: 0,
  pending: 0,
  failed: 0
})
const processStatus = ref({
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
})
const images = ref([])
const loading = ref(false)
const selectedStatus = ref('')
const pagination = ref({
  page: 1,
  limit: 25,
  total: 0,
  totalPages: 0
})

const notification = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

// Table configuration
const tableHeaders = [
  { text: 'ID', value: 'id', sortable: false, width: '60px' },
  { text: 'Imagen', value: 'image', sortable: false },
  { text: 'Serie', value: 'series', sortable: false },
  { text: 'Estado', value: 'status', sortable: false, width: '100px' },
  { text: 'CF', value: 'cf_path', sortable: false, width: '50px' },
  { text: '', value: 'actions', sortable: false, width: '50px' }
]

const statusOptions = [
  { text: 'Todos', value: '' },
  { text: 'Pendientes', value: 'pending' },
  { text: 'Migradas', value: 'migrated' },
  { text: 'Fallidas', value: 'failed' }
]

// Auto-refresh interval
let refreshInterval = null
let statsInterval = null

// API base URL
const API_BASE = 'http://localhost:1337/api'

// Methods
const showNotification = (type, title, message) => {
  notification.value = {
    show: true,
    type,
    title,
    message
  }

  setTimeout(() => {
    hideNotification()
  }, 5000)
}

const hideNotification = () => {
  notification.value.show = false
}

const loadStats = async () => {
  try {
    const response = await fetch(`${API_BASE}/images/migration-status`)
    const data = await response.json()

    if (data.success) {
      stats.value = data.data.stats
      processStatus.value = data.data.process

      // Log para debug - más detallado
      console.log('Stats updated:', JSON.stringify(stats.value, null, 2))
      console.log('Process status:', JSON.stringify(processStatus.value, null, 2))
      console.log('isRunning:', processStatus.value.isRunning)
      console.log('isPaused:', processStatus.value.isPaused)
    }
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

const loadImages = async () => {
  try {
    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.limit
    })

    if (selectedStatus.value) {
      params.append('status', selectedStatus.value)
    }

    const response = await fetch(`${API_BASE}/images/pending-migration?${params}`)
    const data = await response.json()

    if (data.success) {
      images.value = data.data
      pagination.value = {
        ...pagination.value,
        ...data.meta
      }

      // Update stats if provided
      if (data.stats) {
        stats.value = data.stats
      }
    }
  } catch (error) {
    console.error('Error loading images:', error)
    showNotification('error', 'Error', 'No se pudieron cargar las imágenes')
  }
}

const startMigration = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/images/start-migration`, {
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
      showNotification('success', 'Éxito', 'Proceso de migración iniciado')
      // Actualizar inmediatamente el estado
      setTimeout(async () => {
        await loadStats()
      }, 1000)
    } else {
      throw new Error(data.message || 'Error al iniciar migración')
    }
  } catch (error) {
    console.error('Error starting migration:', error)
    showNotification('error', 'Error', error.message)
  } finally {
    loading.value = false
  }
}

const pauseMigration = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/images/pause-migration`, {
      method: 'POST'
    })

    const data = await response.json()

    if (data.success) {
      showNotification('info', 'Pausado', 'Proceso de migración pausado')
      // Actualizar inmediatamente el estado
      setTimeout(async () => {
        await loadStats()
      }, 500)
    } else {
      throw new Error(data.message || 'Error al pausar migración')
    }
  } catch (error) {
    console.error('Error pausing migration:', error)
    showNotification('error', 'Error', error.message)
  } finally {
    loading.value = false
  }
}

const resumeMigration = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/images/resume-migration`, {
      method: 'POST'
    })

    const data = await response.json()

    if (data.success) {
      showNotification('success', 'Reanudado', 'Proceso de migración reanudado')
      // Actualizar inmediatamente el estado
      setTimeout(async () => {
        await loadStats()
      }, 500)
    } else {
      throw new Error(data.message || 'Error al reanudar migración')
    }
  } catch (error) {
    console.error('Error resuming migration:', error)
    showNotification('error', 'Error', error.message)
  } finally {
    loading.value = false
  }
}

const retryFailed = async () => {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/images/start-migration`, {
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
      showNotification('success', 'Éxito', 'Reintentando imágenes fallidas')
      await loadStats()
    } else {
      throw new Error(data.message || 'Error al reintentar migración')
    }
  } catch (error) {
    console.error('Error retrying failed:', error)
    showNotification('error', 'Error', error.message)
  } finally {
    loading.value = false
  }
}

const retryImage = async (imageId) => {
  loading.value = true
  try {
    const response = await fetch(`${API_BASE}/images/${imageId}/retry-migration`, {
      method: 'POST'
    })

    const data = await response.json()

    if (data.success) {
      showNotification('success', 'Éxito', 'Imagen reintentada exitosamente')
      await loadImages()
      await loadStats()
    } else {
      throw new Error(data.message || 'Error al reintentar imagen')
    }
  } catch (error) {
    console.error('Error retrying image:', error)
    showNotification('error', 'Error', error.message)
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  pagination.value.page = page
  loadImages()
}

const getProcessStatusText = () => {
  if (!processStatus.value.isRunning) { return 'Detenido' }
  if (processStatus.value.isPaused) { return 'Pausado' }
  return 'Ejecutándose'
}

const getImageUrl = (path) => {
  if (!path) { return '/placeholder-image.jpg' }
  return `https://admin.hentaini.com/uploads${path}`
}

const getImageName = (path) => {
  if (!path) { return 'Sin nombre' }
  return path.split('/').pop()
}

const getProcessStatusColor = () => {
  if (!processStatus.value.isRunning) { return 'grey' }
  if (processStatus.value.isPaused) { return 'orange' }
  return 'green'
}

const getProcessStatusIcon = () => {
  if (!processStatus.value.isRunning) { return 'mdi-stop' }
  if (processStatus.value.isPaused) { return 'mdi-pause' }
  return 'mdi-play'
}

const getStatusChipColor = (image) => {
  if (image.cf_path) { return 'success' }
  if (image.migration_status === 'failed') { return 'error' }
  return 'warning'
}

const getStatusText = (image) => {
  if (image.cf_path) {
    return 'Migrada'
  } else if (image.migration_status === 'failed') {
    return 'Fallida'
  } else {
    return 'Pendiente'
  }
}

// Lifecycle
onMounted(async () => {
  await loadStats()
  await loadImages()

  // Auto-refresh stats every 2 seconds for real-time updates
  statsInterval = setInterval(async () => {
    await loadStats()
  }, 2000)

  // Auto-refresh images every 10 seconds
  refreshInterval = setInterval(async () => {
    if (!loading.value) {
      await loadImages()
    }
  }, 10000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (statsInterval) {
    clearInterval(statsInterval)
  }
})
</script>

<template>
  <v-card class="progress-card mb-3" elevation="2">
    <v-card-text class="pb-2">
      <div class="d-flex justify-space-between align-center mb-2">
        <div class="d-flex align-center">
          <v-icon
            :color="getStatusColor()"
            class="mr-2"
          >
            {{ getStatusIcon() }}
          </v-icon>
          <div>
            <div class="font-weight-medium">
              {{ service }}
            </div>
            <div class="caption text--secondary">
              {{ playerName }}
            </div>
          </div>
        </div>
        <div class="text-right">
          <div class="font-weight-medium">
            {{ getProgressText() }}
          </div>
          <div class="caption text--secondary">
            {{ getStatusText() }}
          </div>
        </div>
      </div>

      <!-- Progress Bar -->
      <v-progress-linear
        :value="progress.progress || 0"
        :color="getStatusColor()"
        height="8"
        rounded
        class="mb-2"
      />

      <!-- Upload Details -->
      <div v-if="progress.status === 'uploading'" class="caption text--secondary">
        {{ formatBytes(progress.bytesUploaded || 0) }} / {{ formatBytes(progress.bytesTotal || 0) }}
        <span v-if="progress.chunkNumber && progress.totalChunks">
          (chunk {{ progress.chunkNumber }}/{{ progress.totalChunks }})
        </span>
      </div>

      <!-- Result Display -->
      <div v-if="result && result.success" class="mt-2">
        <v-chip small color="success" text-color="white">
          <v-icon left small>
            mdi-check
          </v-icon>
          Code: {{ result.result }}
        </v-chip>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mt-2">
        <v-alert type="error" dense class="mb-2">
          <div class="caption">
            {{ error }}
          </div>
        </v-alert>
        <v-btn
          v-if="showRetry"
          small
          color="orange"
          text
          @click="handleRetry"
        >
          <v-icon left small>
            mdi-refresh
          </v-icon>
          Retry
        </v-btn>
      </div>

      <!-- Retry in Progress -->
      <div v-if="progress.status === 'retrying'" class="mt-2">
        <v-chip small color="orange" text-color="white">
          <v-icon left small>
            mdi-refresh
          </v-icon>
          Retrying... (attempt {{ progress.attempt || 1 }})
        </v-chip>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'UploaderProgressCard',
  props: {
    service: {
      type: String,
      required: true
    },
    playerName: {
      type: String,
      required: true
    },
    progress: {
      type: Object,
      default: () => ({ progress: 0, status: 'idle' })
    },
    result: {
      type: Object,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    showRetry: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getStatusColor () {
      const status = this.progress.status
      if (this.error) { return 'error' }

      switch (status) {
        case 'completed':
          return 'success'
        case 'uploading':
        case 'processing':
          return 'primary'
        case 'retrying':
          return 'orange'
        case 'error':
          return 'error'
        case 'initializing':
        case 'authenticating':
          return 'info'
        default:
          return 'grey'
      }
    },
    getStatusIcon () {
      const status = this.progress.status
      if (this.error) { return 'mdi-alert-circle' }

      switch (status) {
        case 'completed':
          return 'mdi-check-circle'
        case 'uploading':
          return 'mdi-upload'
        case 'processing':
        case 'generating_link':
          return 'mdi-cog'
        case 'retrying':
          return 'mdi-refresh'
        case 'error':
          return 'mdi-alert-circle'
        case 'initializing':
          return 'mdi-timer-sand'
        case 'authenticating':
          return 'mdi-key'
        default:
          return 'mdi-circle-outline'
      }
    },
    getProgressText () {
      if (this.result && this.result.success) {
        return '100%'
      }
      if (this.error) {
        return 'Failed'
      }
      return `${Math.round(this.progress.progress || 0)}%`
    },
    getStatusText () {
      const status = this.progress.status
      if (this.error) { return 'Error occurred' }

      switch (status) {
        case 'completed':
          return 'Upload complete'
        case 'uploading':
          return 'Uploading...'
        case 'processing':
          return 'Processing...'
        case 'generating_link':
          return 'Generating link...'
        case 'retrying':
          return `Retrying... (${this.progress.attempt || 1})`
        case 'error':
          return 'Upload failed'
        case 'initializing':
          return 'Initializing...'
        case 'authenticating':
          return 'Authenticating...'
        case 'idle':
          return 'Waiting...'
        default:
          return 'Ready'
      }
    },
    handleRetry () {
      this.$emit('retry', {
        service: this.service,
        account: {
          service: this.service
          // Note: In real implementation, you'd need to pass the full account object
          // This would be handled by the parent component
        }
      })
    },
    formatBytes (bytes) {
      if (bytes === 0) { return '0 B' }
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
    }
  }
}
</script>

<style scoped>
.progress-card {
  transition: all 0.3s ease;
}

.progress-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>

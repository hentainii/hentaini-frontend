<template>
  <v-card class="glass-card pa-4" elevation="6">
    <v-card-title class="subtitle-1 font-weight-bold mb-2">
      <v-icon left color="primary">
        mdi-cloud-upload
      </v-icon>
      Video Uploader v2
    </v-card-title>

    <!-- File Selection -->
    <v-container v-if="!selectedFile">
      <v-file-input
        ref="fileInput"
        accept="video/mp4"
        label="Select MP4 video file to upload"
        prepend-icon="mdi-video"
        outlined
        clearable
        :rules="fileRules"
        @change="onFileSelected"
      />

      <!-- Drop Zone -->
      <div
        class="drop-zone mt-4"
        :class="{ 'drag-over': isDragOver }"
        @drop="onFileDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @dragenter.prevent
      >
        <div class="drop-zone-content">
          <v-icon size="48" color="primary">
            mdi-cloud-upload
          </v-icon>
          <p class="mt-2 mb-0">
            Drag and drop your MP4 file here
          </p>
          <p class="caption text--secondary">
            or use the file input above
          </p>
        </div>
      </div>
    </v-container>

    <!-- File Selected Info -->
    <v-container v-if="selectedFile && !isUploading">
      <v-alert type="info" dense class="mb-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <strong>{{ selectedFile.name }}</strong>
            <br>
            <span class="caption">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <v-btn small text @click="clearFile">
            <v-icon small>
              mdi-close
            </v-icon>
            Clear
          </v-btn>
        </div>
      </v-alert>

      <!-- Available Services -->
      <div class="mb-4">
        <h4 class="mb-2">
          Available Upload Services:
        </h4>
        <v-chip-group>
          <v-chip
            v-for="account in availableAccounts"
            :key="account.id"
            small
            :color="account.player.up_available ? 'primary' : 'grey'"
          >
            <v-icon left small>
              mdi-play-circle
            </v-icon>
            {{ account.service }} ({{ account.player.name }})
          </v-chip>
        </v-chip-group>
      </div>

      <!-- Upload Button -->
      <v-btn
        color="primary"
        large
        block
        :disabled="availableAccounts.length === 0"
        @click="startUpload"
      >
        <v-icon left>
          mdi-upload
        </v-icon>
        Upload to {{ availableAccounts.length }} service{{ availableAccounts.length === 1 ? '' : 's' }}
      </v-btn>
    </v-container>

    <!-- Upload Progress -->
    <v-container v-if="isUploading">
      <v-alert type="info" dense class="mb-4">
        <div class="d-flex justify-space-between align-center">
          <div>
            <strong>{{ selectedFile.name }}</strong>
            <br>
            <span class="caption">Uploading to {{ availableAccounts.length }} services...</span>
          </div>
          <div class="text-right">
            <div class="caption">
              Overall Progress
            </div>
            <strong>{{ totalProgress }}%</strong>
          </div>
        </div>
      </v-alert>

      <!-- Progress per service -->
      <div class="upload-progress">
        <UploaderProgressCard
          v-for="account in availableAccounts"
          :key="account.id"
          :service="account.service"
          :player-name="account.player.name"
          :progress="getUploadProgress(account.service)"
          :result="getUploadResult(account.service)"
          :error="getUploadError(account.service)"
          @retry="retryService"
        />
      </div>

      <!-- Overall Progress Bar -->
      <v-progress-linear
        :value="totalProgress"
        height="20"
        color="primary"
        class="mt-4"
      >
        <template #default="{ value }">
          <strong>{{ Math.ceil(value) }}%</strong>
        </template>
      </v-progress-linear>
    </v-container>

    <!-- Upload Complete -->
    <v-container v-if="isUploadComplete && !isUploading">
      <v-alert type="success" dense class="mb-4">
        <v-icon left>
          mdi-check-circle
        </v-icon>
        Upload completed! {{ completedUploads }} of {{ availableAccounts.length }} services successful.
      </v-alert>

      <!-- Results Summary -->
      <div class="upload-results">
        <h4 class="mb-2">
          Upload Results:
        </h4>
        <UploaderProgressCard
          v-for="account in availableAccounts"
          :key="account.id"
          :service="account.service"
          :player-name="account.player.name"
          :progress="getUploadProgress(account.service)"
          :result="getUploadResult(account.service)"
          :error="getUploadError(account.service)"
          :show-retry="!!getUploadError(account.service)"
          @retry="retryService"
        />
      </div>

      <!-- Action Buttons -->
      <div class="mt-4 d-flex gap-2">
        <v-btn
          color="primary"
          @click="populateEpisodePlayers"
        >
          <v-icon left>
            mdi-auto-fix
          </v-icon>
          Auto-fill Players
        </v-btn>
        <v-btn
          color="grey"
          @click="resetUploader"
        >
          <v-icon left>
            mdi-refresh
          </v-icon>
          Upload Another
        </v-btn>
      </div>
    </v-container>

    <!-- Error State -->
    <v-alert
      v-if="uploadError"
      type="error"
      dismissible
      @click:close="uploadError = null"
    >
      {{ uploadError }}
    </v-alert>
  </v-card>
</template>

<script>
import { useUploadManager } from '~/composables/uploader/uploadManager'

export default {
  name: 'UploaderMain',
  data: () => ({
    isDragOver: false,
    uploadError: null,
    fileRules: [
      v => !!v || 'Please select a file',
      v => !v || v.size <= 2000000000 || 'File must be less than 2GB',
      v => !v || v.type === 'video/mp4' || 'File must be MP4 format'
    ]
  }),
  computed: {
    selectedFile () {
      return this.$store.state.uploader.selectedFile
    },
    isUploading () {
      return this.$store.state.uploader.isUploading
    },
    availableAccounts () {
      return this.$store.state.accounts.availableAccounts.filter(
        account => account.up_available && account.player?.up_available
      )
    },
    totalProgress () {
      return this.$store.getters['uploader/totalProgress']
    },
    completedUploads () {
      return this.$store.getters['uploader/completedUploads']
    },
    failedUploads () {
      return this.$store.getters['uploader/failedUploads']
    },
    isUploadComplete () {
      return this.$store.getters['uploader/isUploadComplete']
    }
  },
  async mounted () {
    await this.loadAvailableAccounts()
  },
  methods: {
    async loadAvailableAccounts () {
      try {
        await this.$store.dispatch('accounts/getAvailableAccounts', {
          token: this.$store.state.auth.token
        })
      } catch (error) {
        this.uploadError = 'Failed to load available upload services'
        console.error('Error loading accounts:', error)
      }
    },
    onFileSelected (file) {
      if (file && this.validateFile(file)) {
        this.$store.dispatch('uploader/selectFile', file)
      }
    },
    onFileDrop (event) {
      event.preventDefault()
      this.isDragOver = false

      const files = event.dataTransfer.files
      if (files.length > 0) {
        const file = files[0]
        if (this.validateFile(file)) {
          this.$store.dispatch('uploader/selectFile', file)
        }
      }
    },
    validateFile (file) {
      if (file.type !== 'video/mp4') {
        this.uploadError = 'Please select an MP4 video file'
        return false
      }
      if (file.size > 2000000000) { // 2GB limit
        this.uploadError = 'File size must be less than 2GB'
        return false
      }
      return true
    },
    clearFile () {
      this.$store.dispatch('uploader/clearFile')
      this.$refs.fileInput.reset()
    },
    async startUpload () {
      if (!this.selectedFile || this.availableAccounts.length === 0) {
        this.uploadError = 'Please select a file and ensure upload services are available'
        return
      }

      try {
        const { uploadToMultipleServices } = useUploadManager()

        const results = await uploadToMultipleServices(
          this.selectedFile,
          this.availableAccounts,
          this.$store
        )

        console.log('Upload results:', results)

        if (results.failed.length > 0) {
          console.warn('Some uploads failed:', results.failed)
        }
      } catch (error) {
        this.uploadError = `Upload failed: ${error.message}`
        console.error('Upload error:', error)
      }
    },
    async retryService ({ service, account }) {
      try {
        const { retryUpload } = useUploadManager()
        await retryUpload(this.selectedFile, account, this.$store)
      } catch (error) {
        this.uploadError = `Retry failed for ${service}: ${error.message}`
        console.error('Retry error:', error)
      }
    },
    populateEpisodePlayers () {
      const { populateEpisodePlayers } = useUploadManager()
      const uploadResults = {
        successful: Object.keys(this.$store.state.uploader.uploadResults)
          .filter(service => this.$store.state.uploader.uploadResults[service].success)
          .map(service => ({
            service,
            result: this.$store.state.uploader.uploadResults[service].result
          }))
      }

      const newPlayers = populateEpisodePlayers(
        uploadResults,
        [],
        this.$store.state.players.playersWithAccounts
      )

      // Emit event to parent component (Episode.vue)
      this.$emit('players-populated', newPlayers)
    },
    resetUploader () {
      this.$store.dispatch('uploader/resetUploader')
      this.$refs.fileInput?.reset()
      this.uploadError = null
    },
    getUploadProgress (service) {
      return this.$store.getters['uploader/uploadProgress'](service)
    },
    getUploadResult (service) {
      return this.$store.getters['uploader/uploadResult'](service)
    },
    getUploadError (service) {
      return this.$store.getters['uploader/uploadError'](service)
    },
    formatFileSize (bytes) {
      if (bytes === 0) { return '0 Bytes' }
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

.drop-zone {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.drop-zone.drag-over {
  border-color: #1976d2;
  background-color: rgba(25, 118, 210, 0.1);
}

.drop-zone-content {
  pointer-events: none;
}

.upload-progress {
  max-height: 300px;
  overflow-y: auto;
}

.upload-results {
  max-height: 400px;
  overflow-y: auto;
}

.gap-2 > * + * {
  margin-left: 8px;
}
</style>

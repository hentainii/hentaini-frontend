export const state = () => {
  return {
    selectedFile: null,
    uploadSessions: [], // Array de sesiones de upload activas
    activeUploads: {}, // Objeto con progreso de uploads por servicio
    uploadResults: {}, // Resultados de uploads completados
    isUploading: false,
    uploadErrors: {}
  }
}

export const mutations = {
  setSelectedFile (state, file) {
    state.selectedFile = file
  },
  clearSelectedFile (state) {
    state.selectedFile = null
  },
  setIsUploading (state, status) {
    state.isUploading = status
  },
  initializeUploadSession (state, { sessionId, accounts }) {
    const session = {
      id: sessionId,
      accounts,
      startTime: Date.now(),
      completedUploads: 0,
      totalUploads: accounts.length,
      status: 'uploading' // uploading, completed, failed, cancelled
    }
    state.uploadSessions.push(session)
  },
  updateUploadProgress (state, { service, progress }) {
    state.activeUploads = {
      ...state.activeUploads,
      [service]: progress
    }
  },
  setUploadResult (state, { service, result, error = null }) {
    state.uploadResults = {
      ...state.uploadResults,
      [service]: {
        success: !error,
        result,
        error,
        timestamp: Date.now()
      }
    }
    if (!error) {
      // Marcar como completado
      state.activeUploads = {
        ...state.activeUploads,
        [service]: {
          ...state.activeUploads[service],
          progress: 100,
          status: 'completed'
        }
      }
    } else {
      // Marcar con error
      state.uploadErrors = {
        ...state.uploadErrors,
        [service]: error
      }
      state.activeUploads = {
        ...state.activeUploads,
        [service]: {
          ...state.activeUploads[service],
          status: 'error'
        }
      }
    }
  },
  clearUploadSession (state, sessionId) {
    state.uploadSessions = state.uploadSessions.filter(session => session.id !== sessionId)
  },
  resetUploadState (state) {
    state.activeUploads = {}
    state.uploadResults = {}
    state.uploadErrors = {}
    state.isUploading = false
  },
  setUploadError (state, { service, error }) {
    state.uploadErrors = {
      ...state.uploadErrors,
      [service]: error
    }
  },
  clearUploadError (state, service) {
    const newErrors = { ...state.uploadErrors }
    delete newErrors[service]
    state.uploadErrors = newErrors
  }
}

export const actions = {
  selectFile ({ commit }, file) {
    commit('setSelectedFile', file)
  },
  clearFile ({ commit }) {
    commit('clearSelectedFile')
  },
  startUploadSession ({ commit, rootState }, { file, accounts }) {
    const sessionId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    commit('setSelectedFile', file)
    commit('setIsUploading', true)
    commit('resetUploadState')
    commit('initializeUploadSession', { sessionId, accounts })

    // Inicializar estado de progreso para cada servicio
    accounts.forEach((account) => {
      commit('updateUploadProgress', {
        service: account.service,
        progress: {
          percentage: 0,
          bytesUploaded: 0,
          bytesTotal: file.size,
          status: 'initializing'
        }
      })
    })

    return sessionId
  },
  updateProgress ({ commit }, { service, progress }) {
    commit('updateUploadProgress', { service, progress })
  },
  setResult ({ commit }, { service, result, error }) {
    commit('setUploadResult', { service, result, error })
  },
  finishUploadSession ({ commit, state }, sessionId) {
    const session = state.uploadSessions.find(s => s.id === sessionId)
    if (session) {
      commit('clearUploadSession', sessionId)
    }
    commit('setIsUploading', false)
  },
  retryUpload ({ commit }, { service, account, file }) {
    commit('clearUploadError', service)
    commit('updateUploadProgress', {
      service,
      progress: {
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'retrying'
      }
    })
  },
  resetUploader ({ commit }) {
    commit('clearSelectedFile')
    commit('resetUploadState')
  }
}

export const getters = {
  uploadProgress: state => (service) => {
    return state.activeUploads[service] || { progress: 0, status: 'idle' }
  },
  uploadResult: state => (service) => {
    return state.uploadResults[service] || null
  },
  uploadError: state => (service) => {
    return state.uploadErrors[service] || null
  },
  totalProgress: (state) => {
    const services = Object.keys(state.activeUploads)
    if (services.length === 0) { return 0 }

    const totalProgress = services.reduce((sum, service) => {
      return sum + (state.activeUploads[service].progress || 0)
    }, 0)

    return Math.round(totalProgress / services.length)
  },
  completedUploads: (state) => {
    return Object.values(state.uploadResults).filter(result => result.success).length
  },
  failedUploads: (state) => {
    return Object.keys(state.uploadErrors).length
  },
  isUploadComplete: (state) => {
    const activeServices = Object.keys(state.activeUploads)
    if (activeServices.length === 0) { return false }

    return activeServices.every((service) => {
      const upload = state.activeUploads[service]
      return upload.status === 'completed' || upload.status === 'error'
    })
  }
}

/**
 * Upload Manager
 * Coordinates uploads to multiple services and manages state
 */

import { useMegaUpload } from './handlers/mega'
import { useMp4Upload } from './handlers/mp4upload'
import { useStream2Upload } from './handlers/stream2'
import { useVHideUpload } from './handlers/vhide'
import { useYourUpload } from './handlers/yourupload'
import { useHLSUpload } from './handlers/hls'
import { useRetryLogic, useUploadQueue } from './utils/retryLogic'

export function useUploadManager () {
  const { withUploadRetry } = useRetryLogic()
  const { addToQueue } = useUploadQueue()

  // Service handlers mapping
  const serviceHandlers = {
    M: useMegaUpload,
    Mega: useMegaUpload,
    MP: useMp4Upload,
    MP4Upload: useMp4Upload,
    S2: useStream2Upload,
    STREAM2: useStream2Upload,
    Stream2: useStream2Upload,
    VH: useVHideUpload,
    VHide: useVHideUpload,
    YU: useYourUpload,
    YourUpload: useYourUpload,
    HLS: useHLSUpload,
    'HLS Player': useHLSUpload
  }

  /**
   * Get handler for a specific service
   * @param {string} service - Service identifier
   */
  const getServiceHandler = (service) => {
    const handler = serviceHandlers[service]
    if (!handler) {
      throw new Error(`No handler found for service: ${service}`)
    }
    return handler()
  }

  /**
   * Upload file to a single service
   * @param {File} file - File to upload
   * @param {Object} account - Account credentials
   * @param {Function} onProgress - Progress callback
   * @param {Object} store - Vuex store instance
   * @param {Object} context - Vue context for accessing $config
   */
  const uploadToService = async (file, account, onProgress, store, context) => {
    try {
      const handler = getServiceHandler(account.service)

      // Create upload function
      const uploadFn = () => {
        switch (account.service) {
          case 'M':
          case 'Mega':
            return handler.uploadToMega(file, account, onProgress)
          case 'MP':
          case 'MP4Upload':
            return handler.uploadToMp4Upload(file, account, onProgress)
          case 'S2':
          case 'STREAM2':
          case 'Stream2':
            return handler.uploadToStream2(file, account, onProgress)
          case 'VH':
          case 'VHide':
            return handler.uploadToVHide(file, account, onProgress)
          case 'YU':
          case 'YourUpload':
            return handler.uploadToYourUpload(file, account, onProgress)
          case 'HLS':
          case 'HLS Player':
            return handler.uploadToHLS(file, account, onProgress, null, null, context)
          default:
            throw new Error(`Unsupported service: ${account.service}`)
        }
      }

      // Execute upload with retry logic
      const result = await withUploadRetry(uploadFn, {
        maxRetries: 3,
        baseDelay: 2000,
        onRetry: (retryInfo) => {
          console.log(`Retrying upload to ${account.service}:`, retryInfo)
          onProgress({
            status: 'retrying',
            attempt: retryInfo.attempt,
            error: retryInfo.error.message
          })
        },
        onProgress
      })

      // Update store with success
      store.dispatch('uploader/setResult', {
        service: account.service,
        result
      })

      return result
    } catch (error) {
      // Update store with error
      store.dispatch('uploader/setResult', {
        service: account.service,
        result: null,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Upload file to multiple services
   * @param {File} file - File to upload
   * @param {Array} accounts - Array of account objects
   * @param {Object} store - Vuex store instance
   * @param {Object} context - Vue context for accessing $config
   */
  const uploadToMultipleServices = async (file, accounts, store, context, onProgress, onSuccess, onError) => {
    if (!file) {
      throw new Error('No file provided for upload')
    }

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts provided for upload')
    }

    // Start upload session
    const sessionId = await store.dispatch('uploader/startUploadSession', {
      file,
      accounts
    })

    const uploadPromises = accounts.map((account) => {
      const progressCallback = (progress) => {
        store.dispatch('uploader/updateProgress', {
          service: account.service,
          progress
        })
        if (onProgress) {
          onProgress(account.service, progress)
        }
      }

      // Add upload to queue with priority based on service
      const priority = getServicePriority(account.service)

      return addToQueue(
        () => uploadToService(file, account, progressCallback, store, context),
        priority
      ).catch((error) => {
        console.error(`Upload to ${account.service} failed:`, error)
        return { service: account.service, error: error.message }
      })
    })

    try {
      const results = await Promise.allSettled(uploadPromises)

      // Process results
      const successful = []
      const failed = []

      results.forEach((result, index) => {
        const account = accounts[index]
        if (result.status === 'fulfilled' && !result.value.error) {
          successful.push({
            service: account.service,
            result: result.value
          })
          if (onSuccess) {
            onSuccess(account.service, result.value)
          }
        } else {
          const errorMsg = result.reason?.message || result.value?.error || 'Unknown error'
          failed.push({
            service: account.service,
            error: errorMsg
          })
          if (onError) {
            onError(account.service, new Error(errorMsg))
          }
        }
      })

      // Finish upload session
      store.dispatch('uploader/finishUploadSession', sessionId)

      return {
        successful,
        failed,
        total: accounts.length
      }
    } catch (error) {
      store.dispatch('uploader/finishUploadSession', sessionId)
      throw error
    }
  }

  /**
   * Get service priority for upload queue
   * @param {string} service - Service name
   */
  const getServicePriority = (service) => {
    const priorities = {
      Mega: 10,
      M: 10,
      HLS: 9,
      YourUpload: 8,
      YU: 8,
      MP4Upload: 6,
      MP: 6,
      VHide: 5,
      VH: 5,
      STREAM2: 4,
      S2: 4
    }
    return priorities[service] || 0
  }

  /**
   * Retry failed upload for a specific service
   * @param {File} file - Original file
   * @param {Object} account - Account for the service
   * @param {Object} store - Vuex store instance
   */
  const retryUpload = async (file, account, store) => {
    const progressCallback = (progress) => {
      store.dispatch('uploader/updateProgress', {
        service: account.service,
        progress
      })
    }

    // Mark as retrying
    store.dispatch('uploader/retryUpload', {
      service: account.service,
      account,
      file
    })

    try {
      const result = await uploadToService(file, account, progressCallback, store)
      return result
    } catch (error) {
      console.error(`Retry failed for ${account.service}:`, error)
      throw error
    }
  }

  /**
   * Validate account credentials for a service
   * @param {Object} account - Account to validate
   */
  const validateAccount = async (account) => {
    try {
      const handler = getServiceHandler(account.service)

      switch (account.service) {
        case 'M':
        case 'Mega':
          return await handler.validateMegaAccount(account)
        case 'MP':
        case 'MP4Upload':
          return await handler.validateMp4UploadAccount(account)
        case 'S2':
        case 'STREAM2':
          return await handler.validateStream2Account(account)
        case 'VH':
        case 'VHide':
          return await handler.validateVHideAccount(account)
        case 'YU':
        case 'YourUpload':
          return await handler.validateYourUploadAccount(account)
        case 'HLS':
        case 'HLS Player':
          return await handler.validateHLSAccount(account)
        default:
          throw new Error(`Validation not implemented for service: ${account.service}`)
      }
    } catch (error) {
      throw new Error(`Account validation failed: ${error.message}`)
    }
  }

  /**
   * Get available services with their handlers
   */
  const getAvailableServices = () => {
    return Object.keys(serviceHandlers).map((service) => {
      const handler = serviceHandlers[service]()
      return {
        id: handler.serviceId,
        name: handler.serviceName,
        isAvailable: true
      }
    })
  }

  /**
   * Auto-populate episode players with upload results
   * @param {Object} uploadResults - Results from uploads
   * @param {Array} players - Current episode players array
   * @param {Array} availablePlayers - Available players from store
   */
  const populateEpisodePlayers = (uploadResults, players, availablePlayers) => {
    const newPlayers = []

    uploadResults.successful.forEach(({ service, result }) => {
      // Find player that matches this service
      const player = availablePlayers.find(p =>
        p.accounts && p.accounts.some(acc => acc.service === service)
      )

      if (player && result) {
        newPlayers.push({
          name: player.name,
          code: result,
          url: player.player_code.replace('codigo', result)
        })
      }
    })

    return newPlayers
  }

  return {
    uploadToService,
    uploadToMultipleServices,
    retryUpload,
    validateAccount,
    getAvailableServices,
    populateEpisodePlayers,
    getServiceHandler
  }
}

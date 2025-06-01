/**
 * Mp4upload Handler
 * Uses chunked uploads to mp4upload.com
 */

import { useChunkedUpload } from '../utils/chunkedUpload'

export function useMp4UploadHandler () {
  const { uploadInChunks } = useChunkedUpload()

  /**
   * Upload file to Mp4upload
   * @param {File} file - File to upload
   * @param {Object} account - Mp4upload account credentials
   * @param {Function} progressCallback - Progress callback function
   */
  const uploadToMp4Upload = async (file, account, progressCallback) => {
    // Validate account credentials
    if (!account.api_key || !account.username || !account.password) {
      throw new Error('Mp4upload requires api_key, username, and password')
    }

    try {
      // Update initial progress
      progressCallback({
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'initializing'
      })

      // Prepare additional data for chunked upload
      const additionalData = {
        api_key: account.api_key,
        username: account.username,
        password: account.password
      }

      // Note: In a real implementation, this would need to call a backend proxy
      // since browsers can't directly make CORS requests to mp4upload.com
      // For now, this is a placeholder that would work with a backend proxy
      const proxyUrl = '/api/uploader/mp4upload-proxy' // This would be your backend endpoint

      const result = await uploadInChunks(
        file,
        proxyUrl,
        additionalData,
        progressCallback,
        1 * 1024 * 1024 // 1MB chunks
      )

      return result
    } catch (error) {
      throw new Error(`Mp4upload upload failed: ${error.message}`)
    }
  }

  /**
   * Validate Mp4upload account credentials
   * @param {Object} account - Account object
   */
  const validateMp4UploadAccount = async (account) => {
    if (!account.api_key || !account.username || !account.password) {
      throw new Error('Mp4upload account requires api_key, username, and password')
    }

    // In a real implementation, you would test the credentials
    // by making a test API call through your backend proxy
    try {
      const response = await fetch('/api/uploader/validate-mp4upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: account.api_key,
          username: account.username,
          password: account.password
        })
      })

      if (!response.ok) {
        throw new Error('Invalid credentials')
      }

      return true
    } catch (error) {
      throw new Error(`Mp4upload account validation failed: ${error.message}`)
    }
  }

  /**
   * Get upload server info
   * @param {Object} account - Account credentials
   */
  const getUploadServer = async (account) => {
    try {
      const response = await fetch('/api/uploader/mp4upload-server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: account.api_key
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get upload server')
      }

      const data = await response.json()
      return data.server_url
    } catch (error) {
      throw new Error(`Failed to get Mp4upload server: ${error.message}`)
    }
  }

  return {
    uploadToMp4Upload,
    validateMp4UploadAccount,
    getUploadServer,
    serviceName: 'Mp4upload',
    serviceId: 'Mp4upload'
  }
}

/**
 * Browser-side implementation (limited by CORS)
 * This is a fallback that attempts direct upload but will likely fail due to CORS
 */
export function useMp4UploadDirect () {
  /**
   * Attempt direct upload to Mp4upload (may fail due to CORS)
   * @param {File} file - File to upload
   * @param {Object} account - Mp4upload account credentials
   * @param {Function} progressCallback - Progress callback function
   */
  const uploadDirect = async (file, account, progressCallback) => {
    console.warn('Direct Mp4upload may fail due to CORS restrictions. Consider using a backend proxy.')

    try {
      progressCallback({
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'authenticating'
      })

      // Try to get upload server
      const serverResponse = await fetch(`https://www.mp4upload.com/api/upload/server?key=${account.api_key}`)

      if (!serverResponse.ok) {
        throw new Error('Failed to get upload server')
      }

      const serverData = await serverResponse.json()

      if (serverData.status !== 200) {
        throw new Error(`Server error: ${serverData.msg}`)
      }

      const uploadServer = serverData.result

      progressCallback({
        percentage: 10,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'uploading'
      })

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('key', account.api_key)

      // Upload file
      const uploadResponse = await fetch(uploadServer, {
        method: 'POST',
        body: formData
      })

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`)
      }

      const uploadData = await uploadResponse.json()

      progressCallback({
        percentage: 100,
        bytesUploaded: file.size,
        bytesTotal: file.size,
        status: 'completed'
      })

      return uploadData.file_code || uploadData.result?.file_code
    } catch (error) {
      throw new Error(`Mp4upload direct upload failed: ${error.message}`)
    }
  }

  return {
    uploadDirect,
    serviceName: 'Mp4upload Direct',
    serviceId: 'Mp4upload'
  }
}

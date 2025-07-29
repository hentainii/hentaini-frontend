/**
 * STREAM2 Upload Handler
 * Handles file uploads to StreamWish.com using their API
 */

export function useStream2Upload () {
  /**
   * Get upload server URL
   * @param {string} apiKey - StreamWish API key
   * @returns {Promise<string>} Upload server URL
   */
  const getUploadServer = async (apiKey) => {
    const response = await fetch(`https://api.streamwish.com/api/upload/server?key=${apiKey}`)
    const data = await response.json()

    if (data.status === 200 && data.result) {
      return data.result
    }
    throw new Error(`Failed to get upload server: ${data.msg}`)
  }

  /**
   * Upload file to StreamWish using their API
   * @param {File} file - File to upload
   * @param {Object} account - Account credentials
   * @param {Function} progressCallback - Progress callback function
   */
  const uploadToStream2 = async (file, account, progressCallback) => {
    try {
      progressCallback({
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'initializing'
      })

      // Get upload server URL from StreamWish API
      const uploadServer = await getUploadServer(account.api_key)

      // Create form data for the file upload
      const formData = new FormData()
      formData.append('key', account.api_key)
      formData.append('file', file)

      // Optional metadata if needed
      if (file.name) {
        formData.append('file_title', file.name)
      }

      // Create XMLHttpRequest to track progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        // Setup progress tracking
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 100)
            progressCallback({
              percentage,
              bytesUploaded: event.loaded,
              bytesTotal: event.total,
              status: 'uploading'
            })
          }
        })

        // Setup completion handler
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText)

              if (response.status === 200 && response.files && response.files.length > 0) {
                // Upload completed successfully
                progressCallback({
                  percentage: 100,
                  bytesUploaded: file.size,
                  bytesTotal: file.size,
                  status: 'completed'
                })

                // Return the file code
                resolve(response.files[0].filecode)
              } else {
                reject(new Error(response.msg || 'Unknown error during upload'))
              }
            } catch (error) {
              reject(new Error(`Failed to parse response: ${error.message}`))
            }
          } else {
            reject(new Error(`HTTP error! status: ${xhr.status}`))
          }
        })

        // Setup error handler
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'))
        })

        // Setup abort handler
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'))
        })

        // Start the upload
        xhr.open('POST', uploadServer)
        xhr.send(formData)
      })
    } catch (error) {
      throw new Error(`STREAM2 error: ${error.message}`)
    }
  }

  /**
   * Validate STREAM2 account credentials
   * @param {Object} account - Account object with api_key
   */
  const validateStream2Account = async (account) => {
    if (!account.api_key) {
      throw new Error('STREAM2 account requires api_key')
    }

    try {
      await getUploadServer(account.api_key)
      return true
    } catch (error) {
      throw new Error(`STREAM2 account validation failed: ${error.message}`)
    }
  }

  return {
    uploadToStream2,
    validateStream2Account,
    serviceName: 'STREAM2',
    serviceId: 'S2'
  }
}

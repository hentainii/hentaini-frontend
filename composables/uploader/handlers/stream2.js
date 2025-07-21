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
   * Upload file to StreamWish
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

      // Get upload server
      progressCallback({
        percentage: 10,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'getting_upload_server'
      })
      const uploadServer = await getUploadServer(account.api_key)

      // Prepare upload
      const formData = new FormData()
      formData.append('key', account.api_key)
      formData.append('file', file)

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest()

      return new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentage = Math.round((event.loaded / event.total) * 80) + 10 // 10-90%
            progressCallback({
              percentage,
              bytesUploaded: event.loaded,
              bytesTotal: event.total,
              status: 'uploading'
            })
          }
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)

              progressCallback({
                percentage: 100,
                bytesUploaded: file.size,
                bytesTotal: file.size,
                status: 'completed'
              })

              if (response.status === 200 && response.files?.[0]?.filecode) {
                resolve(response.files[0].filecode)
              } else {
                reject(new Error(`Failed to upload file: ${xhr.responseText}`))
              }
            } catch (error) {
              reject(new Error(`Failed to parse response: ${error.message}`))
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`))
          }
        }

        xhr.onerror = () => {
          reject(new Error('Upload failed due to network error'))
        }

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

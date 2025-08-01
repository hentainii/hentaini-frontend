/**
 * MP4Upload Upload Handler
 * Handles file uploads to MP4Upload.com using their API
 */

export function useMp4Upload () {
  /**
   * Authenticate with MP4Upload
   * @param {Object} account - Account credentials
   * @returns {Promise<string>} Session ID
   */
  const authenticate = async (account) => {
    const formData = new FormData()
    formData.append('op', 'login')
    formData.append('login', account.username)
    formData.append('password', account.password)

    const response = await fetch('https://www.mp4upload.com/', {
      method: 'POST',
      body: formData
    })

    // Get xfss cookie from response
    const cookies = response.headers.get('set-cookie')
    if (!cookies) {
      throw new Error('Failed to obtain session cookie')
    }

    const xfssCookie = cookies.split(';').find(c => c.trim().startsWith('xfss='))
    if (!xfssCookie) {
      throw new Error('Failed to obtain xfss cookie')
    }

    return xfssCookie.split('=')[1]
  }

  /**
   * Get upload server URL
   * @param {string} apiKey - MP4Upload API key
   * @returns {Promise<string>} Upload server URL
   */
  const getUploadServer = async (apiKey) => {
    const response = await fetch(`https://www.mp4upload.com/api/upload/server?key=${apiKey}`)
    const data = await response.json()

    if (data.status === 200 && data.result) {
      return data.result
    }
    throw new Error(`Failed to get upload server: ${data.msg}`)
  }

  /**
   * Upload file to MP4Upload
   * @param {File} file - File to upload
   * @param {Object} account - Account credentials
   * @param {Function} progressCallback - Progress callback function
   */
  const uploadToMp4Upload = async (file, account, progressCallback) => {
    try {
      progressCallback({
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'initializing'
      })

      // Authenticate
      progressCallback({
        percentage: 5,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'authenticating'
      })
      const sessionId = await authenticate(account)

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
      formData.append('sess_id', sessionId)
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

              if (response[0]?.file_code) {
                resolve(response[0].file_code)
              } else if (response.file_code) {
                resolve(response.file_code)
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
      throw new Error(`MP4Upload error: ${error.message}`)
    }
  }

  /**
   * Validate MP4Upload account credentials
   * @param {Object} account - Account object with username, password and api_key
   */
  const validateMp4UploadAccount = async (account) => {
    if (!account.username || !account.password || !account.api_key) {
      throw new Error('MP4Upload account requires username, password and api_key')
    }

    try {
      await authenticate(account)
      return true
    } catch (error) {
      throw new Error(`MP4Upload account validation failed: ${error.message}`)
    }
  }

  return {
    uploadToMp4Upload,
    validateMp4UploadAccount,
    serviceName: 'MP4Upload',
    serviceId: 'MP'
  }
}

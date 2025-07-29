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
    throw new Error(`Failed to get upload server: ${data.msg}. Api key tried: ${apiKey}`)
  }

  /**
   * Upload file to StreamWish using their API
   * @param {File} file - File to upload
   * @param {Object} account - Account credentials
   * @param {Function} progressCallback - Progress callback function
   */
  const uploadToStream2 = async (file, account, progressCallback) => {
    const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    let uploadedChunks = 0

    try {
      progressCallback({
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'initializing'
      })

      const uploadServer = await getUploadServer(account.api_key)

      const uploadChunk = async (chunk, chunkNumber) => {
        const formData = new FormData()
        // According to the documentation, the API key is sent in the 'key' field.
        formData.append('key', account.api_key)
        formData.append('file', chunk, file.name) // Pass filename
        // Streamwish might need chunk info, but their public API doc is sparse.
        // This is a guess based on common practices.
        // formData.append('chunk', chunkNumber);
        // formData.append('chunks', totalChunks);

        const response = await fetch(uploadServer, {
          method: 'POST',
          body: formData,
          headers: {
            Origin: 'https://streamwish.com' // Mimic legacy behavior to bypass CORS
          }
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Chunk upload failed: ${response.statusText} - ${errorText}`)
        }

        return response.json()
      }

      let finalFileCode = null

      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)

        const response = await uploadChunk(chunk, i)

        if (i === 0) { // First chunk response should contain the file code
          if (response.status === 200 && response.files && response.files.length > 0) {
            finalFileCode = response.files[0].filecode
          } else {
            throw new Error(response.msg || 'Failed to get file code from first chunk')
          }
        }

        uploadedChunks++
        const percentage = Math.round((uploadedChunks / totalChunks) * 100)
        progressCallback({
          percentage,
          bytesUploaded: end,
          bytesTotal: file.size,
          status: 'uploading'
        })
      }

      progressCallback({
        percentage: 100,
        bytesUploaded: file.size,
        bytesTotal: file.size,
        status: 'completed'
      })

      if (!finalFileCode) {
        throw new Error('File code was not retrieved after upload.')
      }

      return finalFileCode
    } catch (error) {
      progressCallback({
        percentage: 100,
        bytesUploaded: 0, // Or keep last known value
        bytesTotal: file.size,
        status: 'failed',
        error: error.message
      })
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

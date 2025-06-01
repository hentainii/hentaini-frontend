/**
 * Utility for handling chunked file uploads
 * @param {File} file - The file to upload
 * @param {string} url - Upload endpoint URL
 * @param {Object} additionalData - Additional form data
 * @param {Function} progressCallback - Progress callback function
 * @param {number} chunkSize - Size of each chunk in bytes
 */
export function useChunkedUpload () {
  const uploadInChunks = (file, url, additionalData = {}, progressCallback, chunkSize = 1 * 1024 * 1024) => {
    const totalChunks = Math.ceil(file.size / chunkSize)
    let currentChunk = 0
    let uploadedBytes = 0

    return new Promise((resolve, reject) => {
      const sendChunk = () => {
        const start = currentChunk * chunkSize
        const end = Math.min(file.size, start + chunkSize)
        const chunk = file.slice(start, end)

        const formData = new FormData()
        formData.append('chunk', chunk)
        formData.append('file_name', file.name)
        formData.append('chunk_number', currentChunk)
        formData.append('total_chunks', totalChunks)

        // Add additional data
        for (const key in additionalData) {
          formData.append(key, additionalData[key])
        }

        fetch(url, {
          method: 'POST',
          body: formData
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }
            return response.json()
          })
          .then((data) => {
            if (data.success) {
              uploadedBytes += chunk.size
              currentChunk++

              // Update progress
              const progress = {
                bytesUploaded: uploadedBytes,
                bytesTotal: file.size,
                percentage: Math.round((uploadedBytes / file.size) * 100),
                chunkNumber: currentChunk,
                totalChunks,
                status: currentChunk < totalChunks ? 'uploading' : 'processing'
              }

              progressCallback(progress)

              if (currentChunk < totalChunks) {
                // Send next chunk
                setTimeout(sendChunk, 100) // Small delay between chunks
              } else {
                // Upload complete
                resolve(data.file_code || data.message || 'Upload completed')
              }
            } else {
              reject(new Error(`Server error: ${data.error || 'Unknown error'}`))
            }
          })
          .catch((error) => {
            reject(new Error(`Network error: ${error.message}`))
          })
      }

      sendChunk()
    })
  }

  return {
    uploadInChunks
  }
}

/**
 * Upload file as a single request (non-chunked)
 * @param {File} file - The file to upload
 * @param {string} url - Upload endpoint URL
 * @param {Object} additionalData - Additional form data
 * @param {Function} progressCallback - Progress callback function
 */
export function useDirectUpload () {
  const uploadDirect = (file, url, additionalData = {}, progressCallback) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('file_name', file.name)

      // Add additional data
      for (const key in additionalData) {
        formData.append(key, additionalData[key])
      }

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = {
            bytesUploaded: event.loaded,
            bytesTotal: event.total,
            percentage: Math.round((event.loaded / event.total) * 100),
            status: event.loaded === event.total ? 'processing' : 'uploading'
          }
          progressCallback(progress)
        }
      })

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText)
            if (response.success) {
              resolve(response.file_code || response.message || 'Upload completed')
            } else {
              reject(new Error(`Server error: ${response.error || 'Unknown error'}`))
            }
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${xhr.responseText}`))
          }
        } else {
          reject(new Error(`HTTP error! status: ${xhr.status}`))
        }
      }

      xhr.onerror = () => {
        reject(new Error('Network error occurred'))
      }

      xhr.open('POST', url)
      xhr.send(formData)
    })
  }

  return {
    uploadDirect
  }
}

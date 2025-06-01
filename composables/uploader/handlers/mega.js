/**
 * Mega Upload Handler
 * Uses MegaJS library for file uploads to Mega.nz
 */

let Storage = null

// Load MegaJS dynamically from CDN
const loadMegaJS = async () => {
  if (Storage) { return Storage }

  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      throw new TypeError('MegaJS can only be loaded in browser environment')
    }

    // Load from CDN using dynamic import
    const module = await import(/* webpackIgnore: true */ 'https://unpkg.com/megajs/dist/main.browser-es.mjs')
    Storage = module.Storage
    return Storage
  } catch (error) {
    throw new Error(`Failed to load MegaJS: ${error.message}`)
  }
}

export function useMegaUpload () {
  /**
   * Upload file to Mega
   * @param {File} file - File to upload
   * @param {Object} account - Mega account credentials
   * @param {Function} progressCallback - Progress callback function
   */
  const uploadToMega = async (file, account, progressCallback) => {
    try {
      // Load MegaJS library
      const MegaStorage = await loadMegaJS()

      // Update progress
      progressCallback({
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'initializing'
      })

      // Initialize storage with credentials
      const storage = new MegaStorage({
        email: account.email,
        password: account.password,
        userAgent: 'Mozilla/5.0'
      }).ready

      const storageInstance = await storage

      progressCallback({
        percentage: 5,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'authenticating'
      })

      // Create upload instance
      const upload = storageInstance.upload({
        name: file.name,
        size: file.size
      })

      // Track upload progress
      upload.on('progress', (info) => {
        const percentage = Math.round((info.bytesUploaded / file.size) * 100)
        progressCallback({
          percentage,
          bytesUploaded: info.bytesUploaded,
          bytesTotal: file.size,
          status: 'uploading'
        })
      })

      return new Promise((resolve, reject) => {
        upload.on('error', (error) => {
          reject(new Error(`Mega upload error: ${error.message}`))
        })

        // Read file and upload
        const reader = new FileReader()
        reader.onload = async function (event) {
          try {
            const fileData = new Uint8Array(event.target.result)

            progressCallback({
              percentage: 10,
              bytesUploaded: 0,
              bytesTotal: file.size,
              status: 'processing'
            })

            // Write file data
            upload.write(fileData)
            upload.end()

            // Wait for upload completion
            const uploadedFile = await upload.complete

            progressCallback({
              percentage: 95,
              bytesUploaded: file.size,
              bytesTotal: file.size,
              status: 'generating_link'
            })

            // Get file link
            const link = await uploadedFile.link()

            // Extract embed code from link
            const embedCode = link.split('file/')[1]

            progressCallback({
              percentage: 100,
              bytesUploaded: file.size,
              bytesTotal: file.size,
              status: 'completed'
            })

            resolve(embedCode)
          } catch (uploadError) {
            reject(new Error(`Mega upload processing error: ${uploadError.message}`))
          }
        }

        reader.onerror = () => {
          reject(new Error('Failed to read file for Mega upload'))
        }

        reader.readAsArrayBuffer(file)
      })
    } catch (error) {
      throw new Error(`Mega initialization error: ${error.message}`)
    }
  }

  /**
   * Validate Mega account credentials
   * @param {Object} account - Account object with email and password
   */
  const validateMegaAccount = async (account) => {
    if (!account.email || !account.password) {
      throw new Error('Mega account requires email and password')
    }

    try {
      const MegaStorage = await loadMegaJS()
      const storage = new MegaStorage({
        email: account.email,
        password: account.password,
        userAgent: 'Mozilla/5.0'
      }).ready

      await storage
      return true
    } catch (error) {
      throw new Error(`Mega account validation failed: ${error.message}`)
    }
  }

  return {
    uploadToMega,
    validateMegaAccount,
    serviceName: 'Mega',
    serviceId: 'M'
  }
}

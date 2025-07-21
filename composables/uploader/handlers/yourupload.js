/**
 * YourUpload Upload Handler
 * Handles file uploads to YourUpload.com using their API
 */

export function useYourUpload () {
  /**
   * Get folder ID and session cookie
   * @param {Object} account - Account credentials
   * @returns {Promise<{folder: string, cookie: string}>} Folder ID and session cookie
   */
  const getFolderAndCookie = async (account) => {
    // First request to get initial cookie
    const formData = new FormData()
    formData.append('email', account.email)
    formData.append('password', account.password)

    const response = await fetch('https://www.yourupload.com/login', {
      method: 'POST',
      headers: {
        Origin: 'www.yourupload.com'
      },
      body: formData
    })

    const cookie = response.headers.get('set-cookie')
    if (!cookie) {
      throw new Error('Failed to obtain session cookie')
    }

    // Second request with cookie to get folder ID
    const response2 = await fetch('https://www.yourupload.com/login', {
      method: 'POST',
      headers: {
        Cookie: cookie.split(';')[0],
        Origin: 'www.yourupload.com'
      },
      body: formData
    })

    const html = await response2.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const folderElement = doc.getElementById('parentFolderId')

    if (!folderElement) {
      throw new Error('Failed to get folder ID')
    }

    return {
      folder: folderElement.getAttribute('data-value'),
      cookie: cookie.split(';')[0]
    }
  }

  /**
   * Upload file to YourUpload
   * @param {File} file - File to upload
   * @param {Object} account - Account credentials
   * @param {Function} progressCallback - Progress callback function
   */
  const uploadToYourUpload = async (file, account, progressCallback) => {
    try {
      progressCallback({
        percentage: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'initializing'
      })

      // Get folder and cookie
      progressCallback({
        percentage: 10,
        bytesUploaded: 0,
        bytesTotal: file.size,
        status: 'authenticating'
      })
      const { folder, cookie } = await getFolderAndCookie(account)

      // Prepare upload
      const formData = new FormData()
      formData.append('', file) // YourUpload expects an empty field name

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

              if (response.files?.['']?.doc?.jobHandle) {
                resolve(response.files[''].doc.jobHandle)
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

        xhr.open('POST', `https://io.yourupload.com/upload?folder=${folder}`)
        xhr.setRequestHeader('Cookie', cookie)
        xhr.send(formData)
      })
    } catch (error) {
      throw new Error(`YourUpload error: ${error.message}`)
    }
  }

  /**
   * Validate YourUpload account credentials
   * @param {Object} account - Account object with email and password
   */
  const validateYourUploadAccount = async (account) => {
    if (!account.email || !account.password) {
      throw new Error('YourUpload account requires email and password')
    }

    try {
      await getFolderAndCookie(account)
      return true
    } catch (error) {
      throw new Error(`YourUpload account validation failed: ${error.message}`)
    }
  }

  return {
    uploadToYourUpload,
    validateYourUploadAccount,
    serviceName: 'YourUpload',
    serviceId: 'YU'
  }
}

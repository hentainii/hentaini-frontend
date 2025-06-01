/**
 * Utility for handling retry logic with exponential backoff
 */
export function useRetryLogic () {
  /**
   * Execute a function with retry logic
   * @param {Function} fn - Function to execute
   * @param {number} maxRetries - Maximum number of retries
   * @param {number} baseDelay - Base delay between retries in milliseconds
   * @param {Function} onRetry - Callback called on each retry attempt
   */
  const withRetry = async (fn, maxRetries = 3, baseDelay = 1000, onRetry = null) => {
    let lastError

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn()
        return result
      } catch (error) {
        lastError = error

        if (attempt === maxRetries) {
          // Final attempt failed
          throw new Error(`Failed after ${maxRetries + 1} attempts. Last error: ${lastError.message}`)
        }

        // Calculate delay with exponential backoff and jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000

        if (onRetry) {
          onRetry(attempt + 1, error, delay)
        }

        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  /**
   * Check if an error is retryable
   * @param {Error} error - The error to check
   */
  const isRetryableError = (error) => {
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /502/,
      /503/,
      /504/,
      /500/
    ]

    return retryablePatterns.some(pattern =>
      pattern.test(error.message) || pattern.test(error.toString())
    )
  }

  /**
   * Execute upload with smart retry logic
   * @param {Function} uploadFn - Upload function to execute
   * @param {Object} options - Retry options
   */
  const withUploadRetry = (uploadFn, options = {}) => {
    const {
      maxRetries = 3,
      baseDelay = 2000,
      onRetry = null,
      onProgress = null
    } = options

    return withRetry(
      uploadFn,
      maxRetries,
      baseDelay,
      (attempt, error, delay) => {
        if (onRetry) {
          onRetry({
            attempt,
            error,
            delay,
            isRetryable: isRetryableError(error)
          })
        }

        if (onProgress) {
          onProgress({
            status: 'retrying',
            attempt,
            maxRetries,
            error: error.message
          })
        }
      }
    )
  }

  return {
    withRetry,
    withUploadRetry,
    isRetryableError
  }
}

/**
 * Queue manager for controlling concurrent uploads
 */
export function useUploadQueue () {
  const queue = []
  const running = []
  const maxConcurrent = 3

  const addToQueue = (uploadFn, priority = 0) => {
    return new Promise((resolve, reject) => {
      queue.push({
        uploadFn,
        priority,
        resolve,
        reject,
        id: Date.now() + Math.random()
      })

      // Sort by priority (higher first)
      queue.sort((a, b) => b.priority - a.priority)

      processQueue()
    })
  }

  const processQueue = async () => {
    if (running.length >= maxConcurrent || queue.length === 0) {
      return
    }

    const item = queue.shift()
    running.push(item)

    try {
      const result = await item.uploadFn()
      item.resolve(result)
    } catch (error) {
      item.reject(error)
    } finally {
      const index = running.findIndex(r => r.id === item.id)
      if (index > -1) {
        running.splice(index, 1)
      }

      // Process next item in queue
      processQueue()
    }
  }

  const getQueueStatus = () => {
    return {
      queued: queue.length,
      running: running.length,
      total: queue.length + running.length
    }
  }

  const clearQueue = () => {
    queue.forEach((item) => {
      item.reject(new Error('Upload cancelled'))
    })
    queue.length = 0
  }

  return {
    addToQueue,
    getQueueStatus,
    clearQueue
  }
}

/**
 * HLS Upload Handler
 * Real implementation that connects to backend FFmpeg conversion endpoint
 */

export const useHLSUpload = () => {
  const uploadToHLS = async (file, account, progressCallback, onComplete, onError, context) => {
    try {
      console.log(context.$store.$config)
      // Validar parámetros requeridos
      if (!context.selectedSerie || !context.episodeNumber) {
        throw new Error('seriesSlug y episodeNumber son requeridos para la subida HLS')
      }

      const { selectedSerie: seriesSlug, episodeNumber } = context
      const backendUrl = context.$store.$config.API_STRAPI_ENDPOINT || 'http://localhost:1337/api/'

      // Progreso inicial
      if (progressCallback) {
        progressCallback({
          progress: 0,
          status: 'Preparando archivo para conversión HLS...'
        })
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData()
      formData.append('video', file)
      formData.append('seriesSlug', seriesSlug)
      formData.append('episodeNumber', episodeNumber.toString())

      if (progressCallback) {
        progressCallback({
          progress: 5,
          status: 'Enviando video al servidor para conversión...'
        })
      }

      // Iniciar conversión en el backend
      const conversionResponse = await fetch(`${backendUrl}hls-converter/convert`, {
        method: 'POST',
        body: formData
      })

      if (!conversionResponse.ok) {
        const errorData = await conversionResponse.json()
        throw new Error(errorData.data?.errors?.join(', ') || 'Error iniciando conversión HLS')
      }

      const conversionData = await conversionResponse.json()
      const { jobId, hlsCode } = conversionData.data

      if (progressCallback) {
        progressCallback({
          progress: 10,
          status: 'Conversión iniciada, monitoreando progreso...'
        })
      }

      // Monitorear progreso de la conversión
      const finalResult = await monitorConversionProgress(backendUrl, jobId, progressCallback)

      if (finalResult.status === 'completado') {
        return hlsCode
      } else {
        throw new Error(finalResult.error || 'Error en la conversión HLS')
      }
    } catch (error) {
      throw new Error(`Error en subida HLS: ${error.message}`)
    }
  }

  /**
   * Monitorear el progreso de conversión HLS
   */
  const monitorConversionProgress = async (backendUrl, jobId, progressCallback) => {
    const maxAttempts = 120 // 10 minutos máximo (5 segundos * 120)
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const statusResponse = await fetch(`${backendUrl}hls-converter/status/${jobId}`)

        if (!statusResponse.ok) {
          throw new Error('Error obteniendo estado de conversión')
        }

        const statusData = await statusResponse.json()
        const job = statusData.data

        if (progressCallback) {
          progressCallback({
            progress: job.progress || 0,
            status: job.message || 'Procesando...'
          })
        }

        // Si la conversión está completa o falló
        if (job.status === 'completado' || job.status === 'error') {
          return job
        }

        // Esperar 5 segundos antes del siguiente chequeo
        await new Promise(resolve => setTimeout(resolve, 5000))
        attempts++
      } catch (error) {
        console.error('Error monitoreando progreso:', error)
        attempts++

        if (attempts >= maxAttempts) {
          throw new Error('Timeout monitoreando conversión HLS')
        }

        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    throw new Error('Timeout: La conversión HLS tomó demasiado tiempo')
  }

  /**
   * Validar configuración HLS
   */
  const validateHLSAccount = (credentials = {}) => {
    if (!credentials.seriesSlug || !credentials.episodeNumber) {
      throw new Error('HLS account requires seriesSlug and episodeNumber')
    }

    // Validar formato del slug
    if (!/^[a-zA-Z0-9-_]+$/.test(credentials.seriesSlug)) {
      throw new Error('seriesSlug debe contener solo letras, números, guiones y guiones bajos')
    }

    // Validar número de episodio
    const episodeNum = parseInt(credentials.episodeNumber)
    if (isNaN(episodeNum) || episodeNum < 1) {
      throw new Error('episodeNumber debe ser un número positivo')
    }

    return {
      valid: true,
      message: 'Configuración HLS válida'
    }
  }

  return {
    uploadToHLS,
    validateHLSAccount,
    monitorConversionProgress
  }
}

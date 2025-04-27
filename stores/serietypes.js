import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#app'

export const useSerieTypesStore = defineStore('serieTypes', () => {
  // State
  const serieTypes = ref([])
  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.API_STRAPI_ENDPOINT
  const token = ref(null) // Assuming token is managed elsewhere

  // Helper to set token
  function setAuthToken(newToken) {
    token.value = newToken
  }

  // Actions
  async function fetchSerieTypes() {
    if (!token.value) {
      console.error('Authentication token is missing for fetchSerieTypes');
      return;
    }
    try {
      // Endpoint is /serie-types, add sort if needed
      const response = await $fetch(`${apiBase}serie-types?sort=name:asc`, { // Added sort
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      serieTypes.value = response.data || []
    } catch (error) {
      console.error('Error fetching serie types:', error)
      serieTypes.value = [] // Reset on error
    }
  }

  // Exposed state and actions
  return {
    serieTypes,
    setAuthToken,
    fetchSerieTypes
  }
}) 
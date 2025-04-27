import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#app'
// import qs from 'qs' // qs might not be needed if no complex query params

export const useLanguageStore = defineStore('language', () => {
  // State
  const languageList = ref([])
  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.API_STRAPI_ENDPOINT
  const token = ref(null) // Assuming token is managed elsewhere

  // Helper to set token
  function setAuthToken(newToken) {
    token.value = newToken
  }

  // Actions
  async function fetchLanguages() {
    if (!token.value) {
      console.error('Authentication token is missing for fetchLanguages');
      return;
    }

    try {
      // Add sorting if desired, e.g., ?sort=name:asc
      const response = await $fetch(`${apiBase}languages?sort=name:asc`, { // Added sort
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      languageList.value = response.data || []
    } catch (error) {
      console.error('Error fetching languages:', error)
      languageList.value = [] // Reset on error
    }
  }

  // Exposed state and actions
  return {
    languageList,
    setAuthToken,
    fetchLanguages
  }
}) 
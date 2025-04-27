import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#app'

export const useStatusesStore = defineStore('statuses', () => {
  // State
  const statuses = ref([])
  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.strapiEndpoint
  const token = ref(null) // Assuming token is managed elsewhere

  // Helper to set token
  function setAuthToken(newToken) {
    token.value = newToken
  }

  // Actions
  async function fetchStatuses() {
    if (!token.value) {
      console.error('Authentication token is missing for fetchStatuses');
      return;
    }
    try {
      // Endpoint is /statuses, add sort if needed
      const response = await $fetch(`${apiBase}statuses?sort=name:asc`, { // Added sort
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      // The old mutation didn't access .data, but API responses usually have it.
      // Adjust if the actual API response for statuses is different.
      statuses.value = response.data || []
    } catch (error) {
      console.error('Error fetching statuses:', error)
      statuses.value = [] // Reset on error
    }
  }

  // Exposed state and actions
  return {
    statuses,
    setAuthToken,
    fetchStatuses
  }
}) 
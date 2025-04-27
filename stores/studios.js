import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#app'
import qs from 'qs'

export const useStudiosStore = defineStore('studios', () => {
  // State
  const studioList = ref([])
  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.strapiEndpoint
  const token = ref(null) // Assuming token is managed elsewhere

  // Helper to set token
  function setAuthToken(newToken) {
    token.value = newToken
  }

  // Actions
  async function fetchStudios(pageSize = 400) {
    if (!token.value) {
      console.error('Authentication token is missing for fetchStudios');
      return;
    }
    const query = qs.stringify({
      pagination: {
        pageSize: pageSize
      },
      sort: ['name:asc'] // Optional: Add default sorting
    }, {
      encodeValuesOnly: true
    })

    try {
      const response = await $fetch(`${apiBase}studios?${query}`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      studioList.value = response.data || []
    } catch (error) {
      console.error('Error fetching studios:', error)
      studioList.value = [] // Reset on error
    }
  }

  async function createStudio(studioData) {
    if (!token.value) {
      console.error('Authentication token is missing for createStudio');
      return false;
    }
    try {
      await $fetch(`${apiBase}studios`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: studioData
        }
      })
      // Add user feedback (e.g., "Studio created successfully")
      await fetchStudios() // Refresh the list
      return true
    } catch (error) {
      console.error('Error creating studio:', error)
      // Add user feedback
      return false
    }
  }

  // Exposed state and actions
  return {
    studioList,
    setAuthToken,
    fetchStudios,
    createStudio
  }
}) 
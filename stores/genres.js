import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp, useRuntimeConfig, navigateTo } from '#app'
import qs from 'qs'

export const useGenresStore = defineStore('genres', () => {
  // State
  const genres = ref([])
  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.API_STRAPI_ENDPOINT
  const token = ref(null) // Assuming token is managed elsewhere

  // Helper to set token
  function setAuthToken(newToken) {
    token.value = newToken
  }

  // Actions
  async function fetchGenres(pageSize = 400) { // Keep large default or make configurable
    const query = qs.stringify({
      pagination: {
        pageSize: pageSize
      },
      sort: ['name:asc'] // Optional: Add default sorting
    }, {
      encodeValuesOnly: true
    })

    try {
      const response = await $fetch(`${apiBase}genres?${query}`)
      genres.value = response.data || []
    } catch (error) {
      console.error('Error fetching genres:', error)
      genres.value = [] // Reset on error
    }
  }

  async function createGenre(genreData) {
    if (!token.value) {
      console.error('Authentication token is missing for createGenre');
      return false;
    }
    try {
      await $fetch(`${apiBase}genres`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: genreData
        }
      })
      // Navigate on success, maybe provide feedback
      await navigateTo({ path: '/panel/genre', query: { created: 'true' } }) // Adjusted path assumption
      await fetchGenres() // Refresh list after creation
      return true
    } catch (error) {
      console.error('Error creating genre:', error)
      // Add user feedback
      return false
    }
  }

  async function editGenre(id, genreData) {
    if (!token.value) {
      console.error('Authentication token is missing for editGenre');
      return false;
    }
    try {
      await $fetch(`${apiBase}genres/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: genreData
        }
      })
       await fetchGenres() // Refresh list after edit
       // Add user feedback (e.g., "Genre updated successfully")
      return true
    } catch (error) {
      console.error(`Error editing genre ${id}:`, error)
      // Add user feedback
      return false
    }
  }

  async function deleteGenre(id) {
    if (!token.value) {
      console.error('Authentication token is missing for deleteGenre');
      return false;
    }
    try {
      await $fetch(`${apiBase}genres/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      // Remove from local state or refetch
      genres.value = genres.value.filter(g => g.id !== id)
      // Add user feedback (e.g., "Genre deleted successfully")
      return true
    } catch (error) {
      console.error(`Error deleting genre ${id}:`, error)
      // Add user feedback
      return false
    }
  }

  // Exposed state and actions
  return {
    genres,
    setAuthToken,
    fetchGenres,
    createGenre,
    editGenre,
    deleteGenre
  }
}) 
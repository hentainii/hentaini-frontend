import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp, useRuntimeConfig, navigateTo } from '#app'
// import qs from 'qs' // qs might not be needed

export const usePlayersStore = defineStore('players', () => {
  // State
  const players = ref([])
  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.API_STRAPI_ENDPOINT
  const token = ref(null) // Assuming token is managed elsewhere

  // Helper to set token
  function setAuthToken(newToken) {
    token.value = newToken
  }

  // Actions
  async function fetchPlayers() {
    if (!token.value) {
      console.error('Authentication token is missing for fetchPlayers');
      return;
    }
    try {
      // Keep sort or adjust as needed
      const response = await $fetch(`${apiBase}players?sort=name:asc`, { // Sorted by name asc
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      players.value = response.data || []
    } catch (error) {
      console.error('Error fetching players:', error)
      players.value = [] // Reset on error
    }
  }

  async function createPlayer(playerData) {
    if (!token.value) {
      console.error('Authentication token is missing for createPlayer');
      return false;
    }
    try {
      await $fetch(`${apiBase}players`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: playerData
        }
      })
      // Navigate and refresh
      await navigateTo({ path: '/panel/player', query: { created: 'true' } }) // Adjusted path assumption
      await fetchPlayers() // Refresh list
      return true
    } catch (error) {
      console.error('Error creating player:', error)
      // Add user feedback
      return false
    }
  }

  // Exposed state and actions
  return {
    players,
    setAuthToken,
    fetchPlayers,
    createPlayer
  }
}) 
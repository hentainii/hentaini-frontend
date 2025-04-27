import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useEpisodesStore = defineStore('episodes', () => {
  // State
  const currentEpisode = ref(null)
  const token = ref(null)

  // Helper to set token
  function setAuthToken(newToken) {
    token.value = newToken
  }

  // Set episode from API response
  function setCurrentEpisode(episode) {
    currentEpisode.value = episode || null
  }

  // Add visit (puede quedarse si solo actualiza el estado local, si hace fetch debe ir al componente)
  function addVisit(serieId, visits) {
    // Este método debería ser solo para actualizar el estado local si no hace fetch
    // Si necesitas actualizar en el backend, hazlo en el componente
    // Aquí solo puedes actualizar el estado local si lo deseas
  }

  return {
    currentEpisode,
    setAuthToken,
    setCurrentEpisode,
    addVisit
  }
}) 
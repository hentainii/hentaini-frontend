import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFavoriteStore = defineStore('favorite', () => {
  // State
  const userFavorites = ref([]) // Holds the list of favorite entries for the current user
  const token = ref(null) // Set from user context
  const userId = ref(null) // Set from user context

  // Helper to set user context (call this on login/auth state change)
  function setUserContext(newToken, newUserId) {
    token.value = newToken
    userId.value = newUserId
    if (!newToken || !newUserId) {
      userFavorites.value = [] // Clear favorites on logout
    }
  }

  // Set favorites from API response
  function setFavorites(favorites) {
    userFavorites.value = favorites || []
  }

  // Helpers
  function isFavorited(serieId) {
    return userFavorites.value.some(fav => fav.serie?.id === serieId)
  }

  function findFavoriteEntryId(serieId) {
    const favoriteEntry = userFavorites.value.find(fav => fav.serie?.id === serieId)
    return favoriteEntry ? favoriteEntry.id : null
  }

  return {
    userFavorites,
    setUserContext,
    setFavorites,
    isFavorited,
    findFavoriteEntryId
  }
}) 
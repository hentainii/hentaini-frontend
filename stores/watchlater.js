import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useWatchLaterStore = defineStore('watchlater', () => {
  // State
  const userWatchLaters = ref([])
  const token = ref(null)
  const userId = ref(null)

  // Helper to set user context (call this on login/auth state change)
  function setUserContext(newToken, newUserId) {
    token.value = newToken
    userId.value = newUserId
    if (!newToken || !newUserId) {
      userWatchLaters.value = []
    }
  }

  // Set watchlaters from API response
  function setWatchLaters(watchLaters) {
    userWatchLaters.value = watchLaters || []
  }

  // Helpers
  function isInWatchLater(serieId, episodeNumber) {
    return userWatchLaters.value.some(wl => wl.serie?.id === serieId && wl.episode_number === Number(episodeNumber))
  }

  function findWatchLaterEntryId(serieId, episodeNumber) {
    const entry = userWatchLaters.value.find(wl => wl.serie?.id === serieId && wl.episode_number === Number(episodeNumber))
    return entry ? entry.id : null
  }

  return {
    userWatchLaters,
    setUserContext,
    setWatchLaters,
    isInWatchLater,
    findWatchLaterEntryId
  }
}) 
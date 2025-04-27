import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#app'
import qs from 'qs'
// Consider importing useUserStore if user ID and token are managed there
// import { useUserStore } from './user'

export const useFavoriteStore = defineStore('favorite', () => {
  // State
  const userFavorites = ref([]) // Holds the list of favorite entries for the current user
  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.strapiEndpoint
  const token = ref(null) // Assuming token is managed elsewhere (e.g., user store)
  const userId = ref(null) // Assuming user ID is managed elsewhere

  // Helper to set user context (call this on login/auth state change)
  function setUserContext(newToken, newUserId) {
    token.value = newToken
    userId.value = newUserId
    if (!newToken || !newUserId) {
      userFavorites.value = [] // Clear favorites on logout
    }
  }

  // Actions

  /**
   * Fetches the user's favorite entries.
   * Optionally filters by serieId.
   * Updates the local userFavorites state.
   */
  async function fetchFavorites(serieId = null) {
    if (!token.value || !userId.value) {
      console.error('User context (token/ID) missing for fetchFavorites');
      userFavorites.value = []
      return false;
    }

    const filters = {
      user: userId.value
    };
    if (serieId) {
      filters.serie = serieId;
    }

    const query = qs.stringify({
      filters,
      // Populate necessary fields, e.g., the associated serie details
      populate: {
          serie: {
              populate: { images: { fields: ['path', 'placeholder'] }, status: true } // Example: populate nested fields
          }
      }
    }, {
      encodeValuesOnly: true
    })

    try {
      const response = await $fetch(`${apiBase}favorites?${query}`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      // The old code added a `url` property manually, ensure the populated data includes what's needed
      // or adjust the consuming components.
      userFavorites.value = response.data || []
      return true;
    } catch (error) {
      console.error('Error fetching favorites:', error)
      userFavorites.value = []
      return false;
    }
  }

  /**
   * Checks if a specific serie is favorited by the current user.
   * Assumes fetchFavorites has been called or calls it if needed.
   */
  function isFavorited(serieId) {
    return userFavorites.value.some(fav => fav.serie?.id === serieId);
  }

  /**
    * Finds the ID of the favorite entry for a given serie ID.
    */
   function findFavoriteEntryId(serieId) {
     const favoriteEntry = userFavorites.value.find(fav => fav.serie?.id === serieId);
     return favoriteEntry ? favoriteEntry.id : null;
   }

  /**
   * Adds a serie to the user's favorites.
   */
  async function addFavorite(serieId) {
    if (!token.value || !userId.value) {
      console.error('User context (token/ID) missing for addFavorite');
      return null;
    }
    if (!serieId) {
        console.error('Serie ID missing for addFavorite');
        return null;
    }

    try {
      const response = await $fetch(`${apiBase}favorites`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: {
            user: userId.value,
            serie: serieId
          }
        }
      })
      // Optionally update local state optimistically or refetch
      await fetchFavorites() // Refetch to ensure consistency
      return response.data // Return the newly created favorite entry
    } catch (error) {
      console.error(`Error adding favorite for serie ${serieId}:`, error)
      return null
    }
  }

  /**
   * Removes a favorite entry by its ID.
   */
  async function removeFavorite(favoriteEntryId) {
    if (!token.value) {
      console.error('Token missing for removeFavorite');
      return false;
    }
     if (!favoriteEntryId) {
        console.error('Favorite entry ID missing for removeFavorite');
        return false;
    }

    try {
      await $fetch(`${apiBase}favorites/${favoriteEntryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      // Remove from local state or refetch
      userFavorites.value = userFavorites.value.filter(fav => fav.id !== favoriteEntryId)
      return true
    } catch (error) {
      console.error(`Error removing favorite entry ${favoriteEntryId}:`, error)
      return false
    }
  }

  /**
   * Toggles the favorite status for a given serie ID.
   * Adds if not favorited, removes if favorited.
   */
   async function toggleFavorite(serieId) {
    if (!serieId) return;

    const favoriteEntryId = findFavoriteEntryId(serieId);

    if (favoriteEntryId) {
      // Already favorited, so remove it
      return await removeFavorite(favoriteEntryId);
    } else {
      // Not favorited, so add it
      const result = await addFavorite(serieId);
      return !!result; // Return true if add was successful, false otherwise
    }
  }


  // Exposed state and actions
  return {
    userFavorites,
    setUserContext,
    fetchFavorites,
    isFavorited,
    findFavoriteEntryId,
    addFavorite,
    removeFavorite,
    toggleFavorite // Added convenience action
  }
}) 
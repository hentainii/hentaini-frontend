import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp, useRuntimeConfig, navigateTo } from '#app'
import qs from 'qs'

export const useEpisodesStore = defineStore('episodes', () => {
  // State
  const currentEpisode = ref(null)
  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.strapiEndpoint
  const token = ref(null) // Assuming token is managed elsewhere (e.g., user store)

  // Helper to set token
  function setAuthToken(newToken) {
    token.value = newToken
  }

  // Actions
  async function addVisit(serieId, visits) {
    // Consider moving this to seriesStore if it makes more sense semantically
    try {
      await $fetch(`${apiBase}series/${serieId}`, {
        method: 'PUT',
        body: {
          data: { visits }
        }
      })
      // No state update needed here as it modifies a different resource
    } catch (error) {
      console.error(`Error adding visit to serie ${serieId}:`, error)
    }
  }

  async function fetchEpisodePublic(serieUrl, episodeNumber) {
    const query = qs.stringify({
      filters: {
        serie: {
          url: {
            $eq: serieUrl
          }
        },
        episode_number: {
          $eq: episodeNumber
        }
      },
      populate: [
        'serie',
        'serie.images',
        'serie.images.image_type',
        'serie.genreList',
        'serie.episodes',
        'serie.status',
        'image'
      ],
      sort: ['createdAt:desc'] // Keep or adjust sorting if needed
    }, {
      encodeValuesOnly: true
    })

    try {
      const response = await $fetch(`${apiBase}episodes?${query}`)
      if (response.data && response.data.length > 0) {
        const episodeData = response.data[0]
        // Safely parse players JSON
        try {
            episodeData.players = episodeData.players ? JSON.parse(episodeData.players) : [];
        } catch (e) {
            console.error("Error parsing players JSON for public episode:", e);
            episodeData.players = []; // Default to empty array on parse error
        }
        currentEpisode.value = episodeData
        return episodeData // Return the fetched episode
      } else {
        currentEpisode.value = null
        console.warn(`Episode ${episodeNumber} for serie ${serieUrl} not found.`)
        return null
      }
    } catch (error) {
      console.error(`Error fetching public episode ${episodeNumber} for serie ${serieUrl}:`, error)
      currentEpisode.value = null
      return null
    }
  }

  async function fetchEpisode(episodeId, populateOptions = ['serie', 'image']) { // Default populate for panel
    if (!token.value) {
      console.error('Authentication token is missing for fetchEpisode');
      return null;
    }
    const query = qs.stringify({
        populate: populateOptions
      },
      {
        encodeValuesOnly: true
      })
    try {
      const response = await $fetch(`${apiBase}episodes/${episodeId}?${query}`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.data) {
           const episodeData = response.data;
            // Safely parse players JSON
            try {
                episodeData.players = episodeData.players ? JSON.parse(episodeData.players) : [];
            } catch (e) {
                console.error("Error parsing players JSON for episode:", e);
                episodeData.players = []; // Default to empty array on parse error
            }
           // Optionally update currentEpisode state if needed for panel editing
           currentEpisode.value = episodeData;
           return episodeData;
      } else {
          console.warn(`Episode with ID ${episodeId} not found.`);
          currentEpisode.value = null;
          return null;
      }
    } catch (error) {
      console.error(`Error fetching episode ${episodeId}:`, error)
       currentEpisode.value = null;
      return null
    }
  }

  async function editEpisode(episodeData) {
    if (!token.value) {
      console.error('Authentication token is missing for editEpisode');
      return;
    }
    // Ensure players/downloads are stringified if they are stored as JSON strings
    const dataToSend = {
        ...episodeData,
        players: typeof episodeData.players === 'string' ? episodeData.players : JSON.stringify(episodeData.players || []),
        downloads: typeof episodeData.downloads === 'string' ? episodeData.downloads : JSON.stringify(episodeData.downloads || [])
    };

    try {
      await $fetch(`${apiBase}episodes/${episodeData.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: dataToSend
        }
      })
      // Navigate back to the episode list for the specific series
      await navigateTo({ path: `/panel/serie/${episodeData.serie?.id || episodeData.serie}/episodes`, query: { edited: 'true' } })
    } catch (error) {
      console.error(`Error editing episode ${episodeData.id}:`, error)
      // Add user feedback
    }
  }

  async function createEpisode(episodeData) {
    if (!token.value) {
      console.error('Authentication token is missing for createEpisode');
      return null;
    }
     // Ensure players/downloads are stringified
     const dataToSend = {
        ...episodeData,
        players: typeof episodeData.players === 'string' ? episodeData.players : JSON.stringify(episodeData.players || []),
        downloads: typeof episodeData.downloads === 'string' ? episodeData.downloads : JSON.stringify(episodeData.downloads || [])
    };

    try {
      const response = await $fetch(`${apiBase}episodes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: dataToSend
        }
      })
      return response.data // Return the created episode data
    } catch (error) {
      console.error('Error creating episode:', error)
      return null
      // Add user feedback
    }
  }

  async function deleteEpisode(episodeId) {
    if (!token.value) {
      console.error('Authentication token is missing for deleteEpisode');
      return false;
    }
    try {
      await $fetch(`${apiBase}episodes/${episodeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      return true
    } catch (error) {
      console.error(`Error deleting episode ${episodeId}:`, error)
      return false
      // Add user feedback
    }
  }

  // Exposed state and actions
  return {
    currentEpisode,
    setAuthToken,
    addVisit,
    fetchEpisodePublic,
    fetchEpisode,
    editEpisode,
    createEpisode,
    deleteEpisode
  }
}) 
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useRuntimeConfig } from '#app'
import { navigateTo } from '#app'
import qs from 'qs' // Ensure 'qs' is installed (npm install qs)

export const useSeriesStore = defineStore('series', () => {
  // State
  const currentSerie = ref(null)
  const panelSerieList = ref([])
  const panelSerieListPagination = ref({})
  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.strapiEndpoint
  const token = ref(null) // Assuming token management will be handled, maybe in user store or passed directly

  // Actions (incorporating mutations logic)

  // Helper to set token (adjust based on actual auth implementation)
  function setAuthToken(newToken) {
    token.value = newToken
  }

  async function removeOldImage(imageId) {
    if (!token.value) {
      console.error('Authentication token is missing for removeOldImage');
      return false;
    }
    try {
      await $fetch(`${apiBase}images/${imageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })
      return true
    } catch (error) {
      console.error('Error removing old image:', error)
      return false
    }
  }

  async function editSerie(serieData) {
     if (!token.value) {
      console.error('Authentication token is missing for editSerie');
      return;
    }
    try {
      await $fetch(`${apiBase}series/${serieData.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: { // $fetch automatically stringifies
          data: serieData
        }
      })
      await navigateTo('/panel/serie') // Use navigateTo for routing
    } catch (error) {
      console.error('Error editing serie:', error)
      // Consider adding user feedback here (e.g., using a notification store)
    }
  }

  async function fetchSerie(serieId, populateOptions = ['status', 'episodes', 'images', 'genreList', 'studio', 'serie_type', 'language']) {
    const query = qs.stringify({
      populate: populateOptions
    }, {
      encodeValuesOnly: true
    })
    try {
      const response = await $fetch(`${apiBase}series/${serieId}?${query}`)
      currentSerie.value = response.data // Assuming response structure { data: {...} }
    } catch (error) {
      console.error(`Error fetching serie ${serieId}:`, error)
      currentSerie.value = null // Reset on error
    }
  }

  async function fetchPanelSerieList(options) {
    if (!token.value && options.requiresAuth) { // Check if auth is needed
        console.error('Authentication token is missing for fetchPanelSerieList');
        return;
    }

    const { pagination, sortBy = ['id'], sortDesc = [false], search = '' } = options;

    // Adapt sorting key if needed (example from Vuex)
    const sortKey = sortBy[0] === 'status' ? 'status.name' : sortBy[0];
    const sortOrder = sortDesc[0] ? 'desc' : 'asc';
    const sorted = `${sortKey}:${sortOrder}`;

    let filters = {}
    if (search) {
      filters = {
        title: {
          $contains: search
        }
      }
    }

    const query = qs.stringify({
      filters,
      populate: ['status', 'episodes'], // Minimal population for list view
      sort: [sorted],
      pagination: pagination
    }, {
      encodeValuesOnly: true
    })

    try {
        const headers = {};
        if (token.value && options.requiresAuth) {
            headers.Authorization = `Bearer ${token.value}`;
        }
        const response = await $fetch(`${apiBase}series?${query}`, { headers });

      if (response.data) {
        panelSerieList.value = response.data
        panelSerieListPagination.value = response.meta.pagination
      } else {
        panelSerieList.value = []
        panelSerieListPagination.value = {}
      }
    } catch (error) {
      console.error('Error fetching panel serie list:', error)
      panelSerieList.value = []
      panelSerieListPagination.value = {}
    }
  }

  async function setFeatured(serieId, featured) {
     if (!token.value) {
      console.error('Authentication token is missing for setFeatured');
      return;
    }
    try {
      await $fetch(`${apiBase}series/${serieId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: { featured }
        }
      })
      // Update local state optimistically or re-fetch
      const serieIndex = panelSerieList.value.findIndex(s => s.id === serieId)
      if (serieIndex !== -1) {
        panelSerieList.value[serieIndex].featured = featured
      }
    } catch (error) {
      console.error(`Error setting featured status for serie ${serieId}:`, error)
      // Revert optimistic update or show error
    }
  }

  async function saveStatus(serieId, statusName) {
     if (!token.value) {
      console.error('Authentication token is missing for saveStatus');
      return;
    }
    // Assuming status IDs: 1 for 'Airing', 2 for 'Finished' (adjust as needed)
    const statusId = statusName === 'Airing' ? 1 : 2;
    try {
      const updatedSerie = await $fetch(`${apiBase}series/${serieId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        body: {
          data: { status: statusId }
        }
      })
       // Update local state after successful API call
       const serieIndex = panelSerieList.value.findIndex(s => s.id === serieId);
       if (serieIndex !== -1 && updatedSerie.data.status) {
           // Find the status object in the local list or use a default structure
           const newStatus = { id: statusId, name: statusName }; // Simplification, might need to fetch full status object if needed elsewhere
           panelSerieList.value[serieIndex].status = newStatus;
       }
      // Removed snackbar logic - handle UI feedback in components
    } catch (error) {
      console.error(`Error saving status for serie ${serieId}:`, error)
       // Consider adding user feedback here
    }
  }

   // This mutation seems redundant if saveStatus updates the state.
   // If it's meant for purely local updates without API call, rename for clarity.
  // function updateLocalStatus(serieId, status) {
  //   const serieIndex = panelSerieList.value.findIndex(s => s.id === serieId);
  //   if (serieIndex !== -1) {
  //     panelSerieList.value[serieIndex].status = status;
  //   }
  // }


  // Exposed state and actions
  return {
    currentSerie,
    panelSerieList,
    panelSerieListPagination,
    setAuthToken, // Expose if token needs to be set from outside (e.g., user store)
    removeOldImage,
    editSerie,
    fetchSerie,
    fetchPanelSerieList,
    setFeatured,
    saveStatus
    // updateLocalStatus // Expose if needed
  }
}) 
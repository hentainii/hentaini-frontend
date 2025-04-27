import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#app'

export const useRrssStore = defineStore('rrss', () => {
  // State
  const rrss = ref([])
  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.strapiEndpoint
  // Removed token ref - assuming this should be public data
  // If auth IS required, add token management back

  // Actions
  async function fetchRrss() {
    try {
      // Assuming endpoint is /rrsses and it's public
      // Add sorting if needed, e.g., ?sort=order:asc
      const response = await $fetch(`${apiBase}rrsses?sort=name:asc`)
      rrss.value = response.data || []
    } catch (error) {
      console.error('Error fetching RRSS links:', error)
      rrss.value = [] // Reset on error
    }
  }

  // Exposed state and actions
  return {
    rrss,
    fetchRrss
  }
}) 
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNuxtApp, useRuntimeConfig } from '#app'
import qs from 'qs'

export const useUserStore = defineStore('userAdmin', () => { // Renamed store ID for clarity
  // State - Only for admin user list
  const usersList = ref([])
  const usersListPagination = ref({})

  const { $fetch } = useNuxtApp()
  const config = useRuntimeConfig()
  const apiBase = config.public.API_STRAPI_ENDPOINT

  // Actions for Admin Panel

  /**
   * Updates a specific user's password (Admin action).
   * Uses the endpoint from the original Nuxt 2 store.
   * NOTE: Standard Strapi endpoint is typically POST /api/auth/change-password and requires currentPassword.
   * This uses PUT /auth/change-password/:id which might be custom.
   * @param {string} authToken - The admin user's auth token.
   * @param {number|string} userId - The ID of the user whose password to update.
   * @param {string} newPassword - The new password.
   */
  async function updatePassword(authToken, userId, newPassword) {
    if (!authToken) {
      console.error('Admin auth token missing for updatePassword');
      return { success: false, error: 'Authentication required' };
    }
    if (!userId || !newPassword) {
        console.error('User ID or new password missing for updatePassword');
        return { success: false, error: 'User ID and new password are required' };
    }

    try {
      // Using the endpoint structure from the original __nuxt2/store/user.js
      await $fetch(`${apiBase}auth/change-password/${userId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: {
          // Assuming the custom endpoint expects password directly
          // Adjust payload if needed based on your specific Strapi backend implementation
           password: newPassword
          // Original code wrapped in data: { password: ... }, adjusting based on endpoint likelihood
        }
      });
      return { success: true };
    } catch (error) {
      console.error(`Error updating password for user ${userId}:`, error);
      return { success: false, error: error?.data?.error?.message || 'Password update failed' };
    }
  }

  /**
   * Fetches a paginated list of users (Admin action).
   * @param {string} authToken - The admin user's auth token.
   * @param {object} paginationOptions - Pagination settings (e.g., { page: 1, pageSize: 25 }).
   */
  async function fetchUsers(authToken, paginationOptions = { page: 1, pageSize: 25 }) {
    if (!authToken) {
      console.error('Admin auth token missing for fetchUsers');
      return;
    }

    const query = qs.stringify({
        pagination: paginationOptions,
        sort: ['username:asc'], // Optional sort
        populate: ['role']      // Populate role for admin view
      },
      {
        encodeValuesOnly: true
      })

    try {
      const response = await $fetch(`${apiBase}users?${query}`, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      })
      // Assuming Strapi v4/v5 response: array of users in `response`, pagination in `response.meta.pagination`
      // Adjust based on your actual Strapi version/response structure.
      // The original mutation just used `users.users` which seems unusual.
      if (Array.isArray(response)) { // Simple check if response is the array itself
          usersList.value = response;
          usersListPagination.value = {}; // Need meta for pagination
      } else if (response.data && response.meta) { // Standard Strapi v4/v5 structure
          usersList.value = response.data;
          usersListPagination.value = response.meta.pagination;
      } else {
          usersList.value = [];
          usersListPagination.value = {};
      }

    } catch (error) {
      console.error('Error fetching users:', error)
      usersList.value = []
      usersListPagination.value = {}
    }
  }

  // Exposed state and actions for admin panel
  return {
    usersList,
    usersListPagination,
    updatePassword,
    fetchUsers
  }
}) 
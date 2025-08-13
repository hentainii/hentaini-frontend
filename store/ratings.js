import qs from 'qs'

export const state = () => ({
  serieRatings: {},
  userRatings: {},
  loading: false
})

export const mutations = {
  SET_SERIE_RATING (state, { serieId, averageRating, totalVotes }) {
    state.serieRatings[serieId] = { averageRating, totalVotes }
  },
  SET_USER_RATING (state, { serieId, rating }) {
    state.userRatings[serieId] = rating
  },
  SET_LOADING (state, loading) {
    state.loading = loading
  },
  CLEAR_USER_RATING (state, serieId) {
    delete state.userRatings[serieId]
  }
}

export const actions = {
  async fetchSerieRating ({ commit, rootState }, { serieId, userId }) {
    try {
      commit('SET_LOADING', true)

      // Preparar headers con autenticación si el usuario está logueado
      const headers = {
        'Content-Type': 'application/json'
      }

      const token = rootState.auth?.token
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${this.app.$config.API_STRAPI_ENDPOINT}ratings/serie/${serieId}`, {
        headers
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const { averageRating, totalVotes, userRating } = data

      commit('SET_SERIE_RATING', { serieId, averageRating, totalVotes })

      if (userRating !== null) {
        commit('SET_USER_RATING', { serieId, rating: userRating })
      }

      return data
    } catch (error) {
      console.error('Error fetching serie rating:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async submitRating ({ commit, rootState }, { serieId, rating, userId }) {
    try {
      commit('SET_LOADING', true)

      // Preparar headers con autenticación
      const headers = {
        'Content-Type': 'application/json'
      }

      const token = rootState.auth?.token
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      const response = await fetch(`${this.app.$config.API_STRAPI_ENDPOINT}ratings/serie/${serieId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          rating,
          userId
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        // Actualizar el rating del usuario localmente
        commit('SET_USER_RATING', { serieId, rating })

        // Actualizar los datos de la serie si están disponibles
        if (data.averageRating !== undefined && data.totalVotes !== undefined) {
          commit('SET_SERIE_RATING', {
            serieId,
            averageRating: data.averageRating,
            totalVotes: data.totalVotes
          })
        }
      }

      return data
    } catch (error) {
      console.error('Error submitting rating:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async removeRating ({ commit, rootState }, { serieId, userId }) {
    try {
      commit('SET_LOADING', true)

      // Preparar headers con autenticación
      const headers = {
        'Content-Type': 'application/json'
      }

      const token = rootState.auth?.token
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }

      // Buscar el rating del usuario para eliminarlo
      const query = qs.stringify({
        filters: {
          user: userId,
          serie: serieId
        }
      })

      const existingRatingsResponse = await fetch(`${this.app.$config.API_STRAPI_ENDPOINT}ratings?${query}`, {
        headers
      })

      if (!existingRatingsResponse.ok) {
        throw new Error(`HTTP error! status: ${existingRatingsResponse.status}`)
      }

      const existingRatings = await existingRatingsResponse.json()

      if (existingRatings.data && existingRatings.data.length > 0) {
        const ratingId = existingRatings.data[0].id
        const deleteResponse = await fetch(`${this.app.$config.API_STRAPI_ENDPOINT}ratings/${ratingId}`, {
          method: 'DELETE',
          headers
        })

        if (!deleteResponse.ok) {
          throw new Error(`HTTP error! status: ${deleteResponse.status}`)
        }

        commit('CLEAR_USER_RATING', serieId)
      }

      return { success: true }
    } catch (error) {
      console.error('Error removing rating:', error)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

export const getters = {
  getSerieRating: state => (serieId) => {
    return state.serieRatings[serieId] || { averageRating: 0, totalVotes: 0 }
  },
  getUserRating: state => (serieId) => {
    return state.userRatings[serieId] || 0
  },
  isLoading: (state) => {
    return state.loading
  },
  hasUserRated: state => (serieId) => {
    return state.userRatings[serieId] > 0
  }
}

export const state = () => ({
  reactions: [],
  loading: false,
  error: null,
  currentContentType: null,
  currentContentId: null,
  reactionStats: {
    like: 0,
    love: 0,
    wow: 0,
    dislike: 0,
    sad: 0
  },
  userReaction: null
})

export const getters = {
  // Obtener estadísticas de reacciones
  getReactionStats: (state) => {
    return state.reactionStats
  },

  // Obtener la reacción del usuario actual
  getUserReaction: (state) => {
    return state.userReaction
  },

  // Verificar si el usuario ha reaccionado
  hasUserReacted: (state) => {
    return state.userReaction !== null
  }
}

export const mutations = {
  SET_LOADING (state, loading) {
    state.loading = loading
  },

  SET_ERROR (state, error) {
    state.error = error
  },

  SET_REACTIONS (state, reactions) {
    state.reactions = reactions
  },

  SET_CONTENT_INFO (state, { contentType, contentId }) {
    state.currentContentType = contentType
    state.currentContentId = contentId
  },

  SET_REACTION_STATS (state, stats) {
    state.reactionStats = stats
  },

  SET_USER_REACTION (state, reaction) {
    state.userReaction = reaction
  },

  UPDATE_REACTION_STATS (state, { reactionType, increment = true }) {
    if (increment) {
      state.reactionStats[reactionType]++
    } else {
      state.reactionStats[reactionType]--
    }
  },

  CLEAR_ERROR (state) {
    state.error = null
  }
}

export const actions = {
  // Cargar reacciones para un contenido específico
  async loadReactions ({ commit, rootState }, { contentType, contentId }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      commit('SET_CONTENT_INFO', { contentType, contentId })

      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          entity_type: {
            $eq: contentType
          },
          content_id: {
            $eq: contentId
          }
        },
        populate: ['user']
      }, {
        encodeValuesOnly: true
      })

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}reactions?${query}`)
      const result = await response.json()

      if (result.data) {
        commit('SET_REACTIONS', result.data)

        // Calcular estadísticas
        const stats = {
          like: 0,
          love: 0,
          wow: 0,
          dislike: 0,
          sad: 0
        }

        let userReaction = null
        const currentUser = rootState.auth

        result.data.forEach((reaction) => {
          const reactionData = reaction.attributes || reaction
          stats[reactionData.reaction_type]++

          // Verificar si es la reacción del usuario actual
          if (currentUser && currentUser.id) {
            const userData = reactionData.user?.data || reactionData.user
            if (userData && userData.id === currentUser.id) {
              userReaction = reaction
            }
          }
        })

        commit('SET_REACTION_STATS', stats)
        commit('SET_USER_REACTION', userReaction)
      }
    } catch (error) {
      console.error('Error loading reactions:', error)
      commit('SET_ERROR', error.message)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Crear o actualizar reacción
  async createOrUpdateReaction ({ commit, dispatch, rootState }, { contentType, contentId, reactionType }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      const token = rootState.auth.token
      if (!token) {
        throw new Error('Usuario no autenticado')
      }

      const payload = {
        data: {
          reaction_type: reactionType,
          entity_type: contentType,
          content_id: contentId,
          user: rootState.auth.id
        }
      }

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok) {
        // Recargar reacciones para actualizar estadísticas
        await dispatch('loadReactions', { contentType, contentId })
        return result
      } else {
        throw new Error(result.error?.message || 'Error al crear reacción')
      }
    } catch (error) {
      console.error('Error creating reaction:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Eliminar reacción
  async deleteReaction ({ commit, dispatch, state, rootState }, { contentType, contentId }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)

      const token = rootState.auth.token
      if (!token) {
        throw new Error('Usuario no autenticado')
      }

      if (!state.userReaction) {
        throw new Error('No hay reacción para eliminar')
      }

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}reactions/${state.userReaction.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        // Recargar reacciones para actualizar estadísticas
        await dispatch('loadReactions', { contentType, contentId })
        return true
      } else {
        throw new Error('Error al eliminar reacción')
      }
    } catch (error) {
      console.error('Error deleting reaction:', error)
      commit('SET_ERROR', error.message)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Alternar reacción (crear, cambiar o eliminar)
  async toggleReaction ({ commit, dispatch, state }, { contentType, contentId, reactionType }) {
    try {
      const currentReaction = state.userReaction

      if (!currentReaction) {
        // No hay reacción, crear nueva
        await dispatch('createOrUpdateReaction', { contentType, contentId, reactionType })
      } else {
        const currentReactionData = currentReaction.attributes || currentReaction

        if (currentReactionData.reaction_type === reactionType) {
          // Misma reacción, eliminar
          await dispatch('deleteReaction', { contentType, contentId })
        } else {
          // Reacción diferente, eliminar la actual y crear nueva
          await dispatch('deleteReaction', { contentType, contentId })
          await dispatch('createOrUpdateReaction', { contentType, contentId, reactionType })
        }
      }
    } catch (error) {
      console.error('Error toggling reaction:', error)
      commit('SET_ERROR', error.message)
      throw error
    }
  },

  // Limpiar error
  clearError ({ commit }) {
    commit('CLEAR_ERROR')
  }
}

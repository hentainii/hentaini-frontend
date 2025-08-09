// Función helper para acceder a los datos del comentario independientemente de la estructura
const getCommentData = (comment) => {
  if (!comment) { return null }
  // Si tiene attributes, usar esa estructura (Strapi 4 estándar)
  if (comment.attributes) {
    return comment.attributes
  }
  // Si no tiene attributes, los datos están directamente en el objeto (configuración sin clave intermedia)
  return comment
}

// Función helper para acceder a datos relacionales
const getRelationData = (relation) => {
  if (!relation) { return null }
  // Si es estructura estándar con data
  if (relation.data) {
    return relation.data
  }
  // Si no tiene data wrapper, devolver directamente
  return relation
}

export const state = () => ({
  comments: [],
  loading: false,
  error: null,
  totalComments: 0,
  currentContentType: null,
  currentContentId: null
})

export const getters = {
  // Obtener comentarios de nivel superior (sin padre)
  topLevelComments: (state) => {
    return state.comments.filter((comment) => {
      const commentData = getCommentData(comment)
      if (!commentData) {
        console.warn('Comentario sin estructura válida:', comment)
        return false
      }
      const replyData = getRelationData(commentData.reply)
      return !replyData
    })
  },

  // Obtener respuestas de un comentario específico
  getRepliesByParentId: state => (parentId) => {
    return state.comments.filter((comment) => {
      const commentData = getCommentData(comment)
      if (!commentData) {
        return false
      }
      const replyData = getRelationData(commentData.reply)
      return replyData?.id === parentId
    })
  },

  // Verificar si el usuario actual puede editar un comentario
  canEditComment: (state, getters, rootState) => (comment) => {
    const currentUser = rootState.auth
    const commentData = getCommentData(comment)

    if (!currentUser || !currentUser.id || !commentData) {
      return false
    }

    const authorData = getRelationData(commentData.author)
    return authorData?.id === currentUser.id || currentUser.level >= 2 // Admin level
  },

  // Verificar si el usuario dio like a un comentario
  hasUserLiked: (state, getters, rootState) => (comment) => {
    const currentUser = rootState.auth
    const commentData = getCommentData(comment)

    if (!currentUser || !currentUser.id || !commentData) {
      return false
    }

    const likedByData = getRelationData(commentData.liked_by)
    if (Array.isArray(likedByData)) {
      return likedByData.some(user => user.id === currentUser.id)
    }
    return false
  }
}

export const mutations = {
  SET_LOADING (state, loading) {
    state.loading = loading
  },

  SET_ERROR (state, error) {
    state.error = error
  },

  SET_COMMENTS (state, comments) {
    state.comments = comments
  },

  SET_CONTENT_INFO (state, { contentType, contentId }) {
    state.currentContentType = contentType
    state.currentContentId = contentId
  },

  ADD_COMMENT (state, comment) {
    state.comments.unshift(comment)
    state.totalComments += 1
  },

  UPDATE_COMMENT (state, updatedComment) {
    const index = state.comments.findIndex(comment => comment.id === updatedComment.id)
    if (index !== -1) {
      state.comments.splice(index, 1, updatedComment)
    }
  },

  REMOVE_COMMENT (state, commentId) {
    const index = state.comments.findIndex(comment => comment.id === commentId)
    if (index !== -1) {
      state.comments.splice(index, 1)
      state.totalComments -= 1
    }
  },

  ADD_REPLY (state, reply) {
    // Verificar si la respuesta ya existe
    const existingIndex = state.comments.findIndex(c => c.id === reply.id)
    if (existingIndex === -1) {
      state.comments.push(reply)
    } else {
      // Actualizar si ya existe
      state.comments.splice(existingIndex, 1, reply)
    }
  },

  TOGGLE_COMMENT_LIKE (state, { commentId, liked, likesCount }) {
    const comment = state.comments.find(c => c.id === commentId)
    if (comment) {
      const commentData = getCommentData(comment)
      if (commentData) {
        commentData.likes = likesCount
      }
    }
  },

  SET_TOTAL_COMMENTS (state, total) {
    state.totalComments = total
  },

  CLEAR_ERROR (state) {
    state.error = null
  }
}

export const actions = {
  // Cargar comentarios para un contenido específico
  async loadComments ({ commit }, { contentType, contentId }) {
    try {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      commit('SET_CONTENT_INFO', { contentType, contentId })

      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          comment_type: {
            $eq: contentType
          },
          content_id: {
            $eq: contentId
          },
          reply: {
            $null: true // Solo comentarios padre
          }
        },
        populate: [
          'author',
          'reply',
          'parent',
          'liked_by'
        ],
        sort: ['createdAt:desc']
      }, {
        encodeValuesOnly: true
      })

      const url = `${this.$config.API_STRAPI_ENDPOINT}comments?${query}`

      const response = await fetch(url)
      const result = await response.json()

      if (response.ok) {
        // Log detallado de la estructura de comentarios
        if (result.data && result.data.length > 0) {
          result.data.forEach((comment, index) => {
            getCommentData(comment)
          })
        }

        commit('SET_COMMENTS', result.data || [])
        commit('SET_TOTAL_COMMENTS', result.meta?.pagination?.total || result.data?.length || 0)
      } else {
        throw new Error(result.error?.message || 'Error cargando comentarios')
      }
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error cargando comentarios')
      console.error('Error cargando comentarios:', error)
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Crear nuevo comentario
  async createComment ({ commit, state, rootState }, payload) {
    try {
      const { content, contentType, contentId } = payload
      const currentUser = rootState.auth
      const token = rootState.auth?.token

      if (!currentUser || !currentUser.id) {
        throw new Error('Debes estar autenticado para comentar')
      }

      const commentData = {
        content,
        comment_type: contentType || state.currentContentType,
        content_id: contentId || state.currentContentId,
        author: currentUser.id,
        likes: 0,
        is_edited: false,
        is_deleted: false
      }

      // Crear el comentario con populate
      const qs = require('qs')
      const populateQuery = qs.stringify({
        populate: ['author', 'reply', 'liked_by']
      }, {
        encodeValuesOnly: true
      })

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}comments?${populateQuery}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data: commentData
        })
      })

      // Verificar si la respuesta es JSON válida
      const responseContentType = response.headers.get('content-type')
      if (!responseContentType || !responseContentType.includes('application/json')) {
        const textResponse = await response.text()
        console.error('Respuesta no JSON:', textResponse)
        throw new Error(`Error del servidor (${response.status}): ${textResponse}`)
      }

      const result = await response.json()

      if (response.ok) {
        // Normalizar el comentario independientemente de la estructura
        let commentWithPopulation = result.data

        // Si no tiene structure attributes, agregar estructura mínima para compatibilidad
        if (!commentWithPopulation.attributes) {
          // Asegurar que tenga las relaciones necesarias inicializadas
          if (!commentWithPopulation.author) {
            commentWithPopulation.author = null
          }
          if (!commentWithPopulation.reply) {
            commentWithPopulation.reply = null
          }
          if (!commentWithPopulation.liked_by) {
            commentWithPopulation.liked_by = []
          }
        } else {
          // Estructura con attributes (estándar)
          commentWithPopulation = {
            ...result.data,
            attributes: {
              ...result.data.attributes,
              author: result.data.attributes.author || { data: null },
              reply: result.data.attributes.reply || { data: null },
              liked_by: result.data.attributes.liked_by || { data: [] }
            }
          }
        }

        commit('ADD_COMMENT', commentWithPopulation)
        return commentWithPopulation
      } else {
        console.error('Error en respuesta JSON:', result)
        throw new Error(result.error?.message || `Error ${response.status}: ${result.message || 'Error creando comentario'}`)
      }
    } catch (error) {
      console.error('Error completo al crear comentario:', error)
      commit('SET_ERROR', error.message || 'Error creando comentario')
      throw error
    }
  },

  // Editar comentario
  async editComment ({ commit, rootState }, { commentId, content }) {
    try {
      const token = rootState.auth?.token

      if (!token) {
        throw new Error('Debes estar autenticado para editar')
      }

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            content,
            is_edited: true
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        commit('UPDATE_COMMENT', result.data)
        return result.data
      } else {
        throw new Error(result.error?.message || 'Error editando comentario')
      }
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error editando comentario')
      throw error
    }
  },

  // Eliminar comentario (soft delete)
  async deleteComment ({ commit, rootState }, commentId) {
    try {
      const token = rootState.auth?.token

      if (!token) {
        throw new Error('Debes estar autenticado para eliminar')
      }

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          data: {
            is_deleted: true,
            content: '[Comentario eliminado]'
          }
        })
      })

      const result = await response.json()

      if (response.ok) {
        commit('UPDATE_COMMENT', result.data)
        return result.data
      } else {
        throw new Error(result.error?.message || 'Error eliminando comentario')
      }
    } catch (error) {
      commit('SET_ERROR', error.message || 'Error eliminando comentario')
      throw error
    }
  },

  // Crear respuesta a un comentario
  async createReply ({ commit, rootState }, { parentId, content }) {
    try {
      const token = rootState.auth?.token

      if (!token) {
        throw new Error('Debes estar autenticado para responder')
      }

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}comments/${parentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: content.trim()
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Agregar la respuesta al store
        commit('ADD_REPLY', result.data)
        return result.data
      } else {
        throw new Error(result.error?.message || 'Error creando respuesta')
      }
    } catch (error) {
      console.error('Error creando respuesta:', error)
      commit('SET_ERROR', error.message || 'Error creando respuesta')
      throw error
    }
  },

  // Obtener respuestas de un comentario específico
  async loadReplies ({ commit }, { parentId, page = 1, pageSize = 10 }) {
    try {
      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}comments/${parentId}/replies?page=${page}&pageSize=${pageSize}`)
      const result = await response.json()

      if (response.ok) {
        // Las respuestas se agregan al array principal de comentarios
        if (result.data && Array.isArray(result.data)) {
          result.data.forEach((reply) => {
            // Verificar si la respuesta ya existe
            const existingReply = commit.state?.comments?.find(c => c.id === reply.id)
            if (!existingReply) {
              commit('ADD_REPLY', reply)
            }
          })
        }
        return result
      } else {
        throw new Error(result.error?.message || 'Error cargando respuestas')
      }
    } catch (error) {
      console.error('Error cargando respuestas:', error)
      throw error
    }
  },

  // Toggle like en un comentario
  async toggleLike ({ commit, rootState }, commentId) {
    try {
      const token = rootState.auth?.token

      if (!token) {
        throw new Error('Debes estar autenticado para dar like')
      }

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      const result = await response.json()

      if (response.ok) {
        // Actualizar el comentario en el store
        commit('UPDATE_COMMENT', result.data)

        // También devolver la metadata del like
        return {
          comment: result.data,
          liked: result.meta.liked,
          likesCount: result.meta.likesCount
        }
      } else {
        throw new Error(result.error?.message || 'Error procesando like')
      }
    } catch (error) {
      console.error('Error en toggle like:', error)
      commit('SET_ERROR', error.message || 'Error procesando like')
      throw error
    }
  },

  // Obtener estadísticas de un comentario
  async getCommentStats ({ commit }, commentId) {
    try {
      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}comments/${commentId}/stats`)
      const result = await response.json()

      if (response.ok) {
        return result.data
      } else {
        throw new Error(result.error?.message || 'Error obteniendo estadísticas')
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      throw error
    }
  },

  // Obtener respuestas de un comentario específico (método original para compatibilidad)
  async getReplies ({ commit }, parentId) {
    try {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          reply: {
            $eq: parentId
          }
        },
        populate: [
          'author',
          'liked_by'
        ],
        sort: ['createdAt:asc']
      }, {
        encodeValuesOnly: true
      })

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}comments?${query}`)
      const result = await response.json()

      if (response.ok) {
        return result.data || []
      } else {
        throw new Error(result.error?.message || 'Error obteniendo respuestas')
      }
    } catch (error) {
      console.error('Error obteniendo respuestas:', error)
      throw error
    }
  },

  // Limpiar error
  clearError ({ commit }) {
    commit('CLEAR_ERROR')
  },

  // Método temporal para verificar conectividad
  async testCommentsEndpoint ({ commit }) {
    try {
      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}comments`)

      if (response.ok) {
        const result = await response.json()
        return { success: true, data: result }
      } else {
        const textResponse = await response.text()
        return { success: false, error: textResponse, status: response.status }
      }
    } catch (error) {
      console.error('Test GET falló:', error)
      return { success: false, error: error.message }
    }
  }
}

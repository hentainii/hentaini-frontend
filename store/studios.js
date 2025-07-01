export const state = () => {
  return {
    producers: [],
    studios: [],
    currentProducer: null,
    currentStudio: null,
    producersPagination: {
      page: 1,
      pageCount: 1,
      pageSize: 24,
      total: 0
    },
    studiosPagination: {
      page: 1,
      pageCount: 1,
      pageSize: 24,
      total: 0
    }
  }
}

export const mutations = {
  setProducers (state, { producers, pagination }) {
    state.producers = producers
    state.producersPagination = pagination
  },
  setStudios (state, { studios, pagination }) {
    state.studios = studios
    state.studiosPagination = pagination
  },
  setCurrentProducer (state, producer) {
    state.currentProducer = producer
  },
  setCurrentStudio (state, studio) {
    state.currentStudio = studio
  },
  updateProducer (state, producer) {
    const index = state.producers.findIndex(p => p.id === producer.id)
    if (index !== -1) {
      state.producers.splice(index, 1, producer)
    }
  },
  updateStudio (state, studio) {
    const index = state.studios.findIndex(s => s.id === studio.id)
    if (index !== -1) {
      state.studios.splice(index, 1, studio)
    }
  }
}

export const actions = {
  async getProducers ({ commit }, payload = {}) {
    try {
      const qs = require('qs')

      let filters = {}
      if (payload.search) {
        filters = {
          name: {
            $contains: payload.search
          }
        }
      }

      let sort = ['name:asc']
      if (payload.sort) {
        sort = [payload.sort]
      }

      const pagination = payload.pagination || {
        page: 1,
        pageSize: 24
      }

      const query = qs.stringify({
        filters,
        sort,
        pagination,
        populate: ['studios', 'series']
      }, {
        encodeValuesOnly: true
      })

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}producers?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(payload.token && { Authorization: `Bearer ${payload.token}` })
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const producers = data.data.map(producer => ({
        ...producer,
        studiosCount: producer.studios?.length || 0,
        seriesCount: producer.series?.length || 0
      }))

      commit('setProducers', {
        producers,
        pagination: data.meta?.pagination || pagination
      })

      return { success: true, data: producers }
    } catch (error) {
      console.error('Error fetching producers:', error)
      return { success: false, error: error.message }
    }
  },

  async getStudios ({ commit }, payload = {}) {
    try {
      const qs = require('qs')

      const filters = {}
      if (payload.search) {
        filters.name = {
          $contains: payload.search
        }
      }
      if (payload.producerId) {
        filters.producers = {
          id: payload.producerId
        }
      }
      if (payload.producerName) {
        filters.producers = {
          name: payload.producerName
        }
      }

      let sort = ['name:asc']
      if (payload.sort) {
        sort = [payload.sort]
      }

      const pagination = payload.pagination || {
        page: 1,
        pageSize: 400
      }

      const query = qs.stringify({
        filters,
        sort,
        pagination,
        populate: ['producers', 'series']
      }, {
        encodeValuesOnly: true
      })

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(payload.token && { Authorization: `Bearer ${payload.token}` })
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      const studios = data.data.map(studio => ({
        ...studio,
        seriesCount: studio.series?.length || 0,
        producerName: studio.producers?.[0]?.name || 'Unknown'
      }))

      commit('setStudios', {
        studios,
        pagination: data.meta?.pagination || pagination
      })

      return { success: true, data: studios }
    } catch (error) {
      console.error('Error fetching studios:', error)
      return { success: false, error: error.message }
    }
  },

  async getProducer ({ commit }, payload) {
    try {
      const qs = require('qs')
      const query = qs.stringify({
        populate: ['studios', 'series', 'studios.series']
      }, {
        encodeValuesOnly: true
      })

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}producers/${payload.id}?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(payload.token && { Authorization: `Bearer ${payload.token}` })
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const producer = {
        ...data.data,
        studiosCount: data.data.studios?.length || 0,
        seriesCount: data.data.series?.length || 0
      }

      commit('setCurrentProducer', producer)
      return { success: true, data: producer }
    } catch (error) {
      console.error('Error fetching producer:', error)
      return { success: false, error: error.message }
    }
  },

  async getStudio ({ commit }, payload) {
    try {
      const qs = require('qs')
      const query = qs.stringify({
        populate: ['producers', 'series', 'series.images', 'series.status', 'series.genreList']
      }, {
        encodeValuesOnly: true
      })

      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios/${payload.id}?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(payload.token && { Authorization: `Bearer ${payload.token}` })
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const studio = {
        ...data.data,
        seriesCount: data.data.series?.length || 0,
        producerName: data.data.producers?.[0]?.name || 'Unknown'
      }

      commit('setCurrentStudio', studio)
      return { success: true, data: studio }
    } catch (error) {
      console.error('Error fetching studio:', error)
      return { success: false, error: error.message }
    }
  },

  async createProducer ({ dispatch }, payload) {
    try {
      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}producers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({
          data: payload.producerData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Error creating producer:', error)
      return { success: false, error: error.message }
    }
  },

  async updateProducer ({ commit }, payload) {
    try {
      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}producers/${payload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({
          data: payload.producerData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      commit('updateProducer', data.data)
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Error updating producer:', error)
      return { success: false, error: error.message }
    }
  },

  async createStudio ({ dispatch }, payload) {
    try {
      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({
          data: payload.studioData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Error creating studio:', error)
      return { success: false, error: error.message }
    }
  },

  async updateStudio ({ commit }, payload) {
    try {
      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios/${payload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({
          data: payload.studioData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      commit('updateStudio', data.data)
      return { success: true, data: data.data }
    } catch (error) {
      console.error('Error updating studio:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteProducer ({ dispatch }, payload) {
    try {
      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}producers/${payload.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting producer:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteStudio ({ dispatch }, payload) {
    try {
      const response = await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios/${payload.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return { success: true }
    } catch (error) {
      console.error('Error deleting studio:', error)
      return { success: false, error: error.message }
    }
  }
}

export const getters = {
  getProducerById: state => (id) => {
    return state.producers.find(producer => producer.id === id)
  },
  getStudioById: state => (id) => {
    return state.studios.find(studio => studio.id === id)
  },
  getStudiosByProducer: state => (producerId) => {
    return state.studios.filter(studio =>
      studio.producers && studio.producers.some(p => p.id === producerId)
    )
  }
}

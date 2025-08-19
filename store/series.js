export const state = () => {
  return {
    currentSerie: null,
    panelSerieList: [],
    panelSerieListPagination: []
  }
}
export const mutations = {
  getSerie (state, serie) {
    state.currentSerie = serie
  },
  getPanelSerieList (state, { series, pagination }) {
    state.panelSerieList = series
    state.panelSerieListPagination = pagination
  },
  setFeatured (state, payload) {
    state.panelSerieList.find(serie => serie.id === payload.serieId).featured = payload.featured
  },
  updateStatus (state, payload) {
    state.panelSerieList.find(serie => serie.id === payload.serieId).status = payload.status
  },
  updateStudio (state, payload) {
    state.panelSerieList.find(serie => serie.id === payload.serieId).studio = payload.studio
  },
  updateProducer (state, payload) {
    state.panelSerieList.find(serie => serie.id === payload.serieId).producer = payload.producer
  }
}
export const actions = {
  async removeOldImage ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}images/${payload.imageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    }).then((input) => {
      if (input.status === 200) {
        return true
      } else {
        return false
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  async editSerie ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}series/${payload.serieData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: payload.serieData
      })
    }).then((input) => {
      if (input.status === 200) {
        this.$router.push('/panel/serie')
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  async getSerie ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      populate: payload.populate
    },
    {
      encodeValuesOnly: true
    })
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}series/${payload.serieId}?${query}`)
      .then(res => res.json())
      .then((serie) => {
        commit('getSerie', serie.data)
      })
  },
  async getPanelSerieList ({ commit }, payload) {
    const sortBy = payload.options.sortBy[0]
    if (sortBy === 'status') {
      payload.options.sortBy[0] = 'status.name'
    }
    const sorted = `${payload.options.sortBy[0]}:${payload.options.sortDesc[0] ? 'desc' : 'asc'}`
    let filters = {}
    if (payload.search !== '') {
      filters = {
        title: {
          $contains: payload.search
        }
      }
    }
    const qs = require('qs')
    const query = qs.stringify({
      filters,
      populate: [
        'status',
        'episodes',
        'studio',
        'producer'
      ],
      sort: [sorted],
      pagination: payload.pagination
    },
    {
      encodeValuesOnly: true
    })
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((seriList) => {
        if (seriList.data !== null) {
          const pagination = seriList.meta.pagination
          const series = seriList.data
          commit('getPanelSerieList', {
            series,
            pagination
          })
        }
      })
  },
  setFeatured ({ commit }, payload) {
    fetch(`${this.$config.API_STRAPI_ENDPOINT}series/${payload.serieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: {
          featured: payload.featured
        }
      })
    }).then((result) => {
      if (result.status === 200) {
        commit('setFeatured', payload)
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  async saveStatus ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}series/${payload.serieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: {
          status: payload.status === 'Airing' ? 1 : 2
        }
      })
    }).then((input) => {
      if (input.status === 200) {
        this.snack = true
        this.snackColor = 'info'
        this.snackText = 'Status changed successfully!'
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  updateStatus ({ commit }, payload) {
    commit('updateStatus', payload)
  },
  async saveStudio ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}series/${payload.serieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: {
          studio: payload.studio
        }
      })
    }).then((input) => {
      if (input.status === 200) {
        this.snack = true
        this.snackColor = 'info'
        this.snackText = 'Studio changed successfully!'
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  async saveProducer ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}series/${payload.serieId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: {
          producer: payload.producer
        }
      })
    }).then((input) => {
      if (input.status === 200) {
        this.snack = true
        this.snackColor = 'info'
        this.snackText = 'Producer changed successfully!'
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  updateStudio ({ commit }, payload) {
    commit('updateStudio', payload)
  },
  updateProducer ({ commit }, payload) {
    commit('updateProducer', payload)
  }
}

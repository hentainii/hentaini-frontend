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
  }
}
export const actions = {
  async editSerie ({ commit }, payload) {
    await fetch(`${process.env.API_STRAPI_ENDPOINT}series/${payload.serieData.id}`, {
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
    await fetch(`${process.env.API_STRAPI_ENDPOINT}series/${payload.serieId}?${query}`)
      .then(res => res.json())
      .then((serie) => {
        commit('getSerie', serie.data)
      })
  },
  async getPanelSerieList ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      populate: [
        'status',
        'episodes'
      ],
      sort: ['createdAt:desc'],
      pagination: payload.pagination
    },
    {
      encodeValuesOnly: true
    })
    await fetch(`${process.env.API_STRAPI_ENDPOINT}series?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((seriList) => {
        const pagination = seriList.meta.pagination
        const series = seriList.data
        commit('getPanelSerieList', {
          series,
          pagination
        })
      })
  },
  setFeatured ({ commit }, payload) {
    fetch(`${process.env.API_STRAPI_ENDPOINT}series/${payload.serieId}`, {
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
    await fetch(`${process.env.API_STRAPI_ENDPOINT}series/${payload.serieId}`, {
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
  }
}

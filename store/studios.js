export const state = () => {
  return {
    studioList: []
  }
}
export const mutations = {
  getStudios (state, studios) {
    state.studioList = studios.data
  }
}
export const actions = {
  async getStudios ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      pagination: {
        pageSize: 400
      }
    },
    {
      encodeValuesOnly: true
    })
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((studios) => {
        commit('getStudios', studios)
      })
  },
  async createStudio ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}studios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: payload.studio
      })
    }).then((response) => {
      if (response.status === 200) {
        // Studio creado correctamente
      } else {
        throw new Error('Error creating studio')
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  }
}

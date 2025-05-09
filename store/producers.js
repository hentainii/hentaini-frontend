export const state = () => {
  return {
    producerList: []
  }
}
export const mutations = {
  getProducers (state, producers) {
    state.producerList = producers.data
  }
}
export const actions = {
  async getProducers ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      pagination: {
        pageSize: 400
      }
    },
    {
      encodeValuesOnly: true
    })
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}producers?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((producers) => {
        commit('getProducers', producers)
      })
  },
  async createProducer ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}producers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: payload.producer
      })
    }).then((response) => {
      if (response.status === 200) {
        // Producer creado correctamente
      } else {
        throw new Error('Error creating producer')
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  }
}

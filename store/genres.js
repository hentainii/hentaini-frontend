export const state = () => {
  return {
    genres: []
  }
}
export const mutations = {
  getGenres (state, genres) {
    state.genres = genres.data
  }
}
export const actions = {
  async getGenres ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      pagination: {
        pageSize: 400
      }
    },
    {
      encodeValuesOnly: true
    })
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}genres?${query}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then((genres) => {
        commit('getGenres', genres)
      })
  },
  async createGenre ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}genres`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: payload.genre
      })
    }).then((response) => {
      if (response.status === 200) {
        this.$router.push({ path: '/panel/genre/create', query: { created: true } })
      } else {
        throw new Error('Error creating genre')
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  }
}

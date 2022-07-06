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
    await fetch(`${process.env.API_STRAPI_ENDPOINT}genres`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((genres) => {
        commit('getGenres', genres)
      })
  }
}

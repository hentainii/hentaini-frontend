export const state = () => {
  return {
    serieTypes: []
  }
}
export const mutations = {
  getSerieTypes (state, serieTypes) {
    state.serieTypes = serieTypes.data
  }
}
export const actions = {
  async getSerieTypes ({ commit }, payload) {
    await fetch(`${process.env.API_STRAPI_ENDPOINT}serie-types`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((serieTypes) => {
        commit('getSerieTypes', serieTypes)
      })
  }
}

export const state = () => {
  return {
    statuses: []
  }
}
export const mutations = {
  getStatuses (state, statuses) {
    state.statuses = statuses
  }
}
export const actions = {
  async getStatuses ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}statuses`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((statuses) => {
        commit('getStatuses', statuses.data)
      })
  }
}

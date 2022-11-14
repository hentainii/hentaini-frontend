export const state = () => {
  return {
    languageList: []
  }
}
export const mutations = {
  getLanguages (state, languageList) {
    state.languageList = languageList.data
  }
}
export const actions = {
  async getLanguages ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}languages`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((languages) => {
        commit('getLanguages', languages)
      })
  }
}

export const state = () => {
  return {
    rrss: []
  }
}
export const mutations = {
  getRrss (state, rrss) {
    state.rrss = rrss.data
  }
}
export const actions = {
  async getRrss ({ commit }, payload) {
    await fetch(`${process.env.API_STRAPI_ENDPOINT}rrsses`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((rrss) => {
        commit('getRrss', rrss)
      })
  }
}

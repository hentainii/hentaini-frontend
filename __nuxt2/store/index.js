const cookieparser = process.server ? require('cookieparser') : undefined

export const state = () => {
  return {
    auth: null,
    isDesktop: false
  }
}
export const mutations = {
  isDesktop (state, payload) {
    state.isDesktop = payload
  },
  setAuth (state, auth) {
    state.auth = auth
  }
}
export const actions = {
  nuxtServerInit ({ commit }, { req }) {
    let auth = null
    if (req.headers.cookie) {
      const parsed = cookieparser.parse(req.headers.cookie)
      try {
        auth = JSON.parse(parsed.auth)
      } catch (err) {
        // No valid cookie found
      }
    }
    commit('setAuth', auth)
  }
}

export const state = () => {
  return {
    users: [],
    usersListPagination: {}
  }
}
export const mutations = {
  getUsers (state, users) {
    state.users = users.users
  }
}
export const actions = {
  updatePassword ({ commit }, payload) {
    return new Promise((resolve, reject) => {
      fetch(`${this.$config.API_STRAPI_ENDPOINT}auth/change-password/${payload.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({
          data: {
            password: payload.password
          }
        })
      })
        .then(res => res.json())
        .then((users) => {
          resolve(users)
        })
        .catch((err) => {
          reject(err)
        })
    })
  },
  async getUsers ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      pagination: payload.pagination
    },
    {
      encodeValuesOnly: true
    })
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}users?${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((users) => {
        commit('getUsers', {
          users
        })
      })
  }
}

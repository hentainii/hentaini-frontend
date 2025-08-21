export const state = () => {
  return {
    users: [],
    usersListPagination: {}
  }
}
export const mutations = {
  getUsers (state, payload) {
    state.users = payload.users
    state.usersListPagination = payload.pagination
  }
}
export const actions = {
  updatePassword ({ commit }, payload) {
    return new Promise((resolve, reject) => {
      fetch(`${this.$config.API_STRAPI_ENDPOINT}users/${payload.id}`, {
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
      pagination: {
        page: payload.pagination.page,
        pageSize: payload.pagination.itemsPerPage
      }
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
      .then((response) => {
        commit('getUsers', {
          users: response.data || response,
          pagination: {
            page: response.meta?.pagination?.page || payload.pagination.page,
            pageSize: response.meta?.pagination?.pageSize || payload.pagination.itemsPerPage,
            pageCount: response.meta?.pagination?.pageCount || Math.ceil((response.meta?.pagination?.total || response.length) / payload.pagination.itemsPerPage),
            total: response.meta?.pagination?.total || response.length
          }
        })
      })
  }
}

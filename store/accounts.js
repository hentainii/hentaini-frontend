export const state = () => {
  return {
    accounts: [],
    availableAccounts: []
  }
}

export const mutations = {
  getAccounts (state, accounts) {
    state.accounts = accounts.data
  },
  getAvailableAccounts (state, accounts) {
    state.availableAccounts = accounts.data
  }
}

export const actions = {
  async getAccounts ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      populate: ['player'],
      sort: ['createdAt:desc']
    }, {
      encodeValuesOnly: true
    })

    await fetch(`${this.$config.API_STRAPI_ENDPOINT}accounts?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((accounts) => {
        commit('getAccounts', accounts)
      })
  },

  async getAvailableAccounts ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      populate: ['player'],
      filters: {
        up_available: true,
        player: {
          up_available: true
        }
      },
      sort: ['service:asc']
    }, {
      encodeValuesOnly: true
    })

    await fetch(`${this.$config.API_STRAPI_ENDPOINT}accounts?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((accounts) => {
        commit('getAvailableAccounts', accounts)
      })
  },

  async createAccount ({ commit }, payload) {
    return await fetch(`${this.$config.API_STRAPI_ENDPOINT}accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: payload.account
      })
    }).then((response) => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error('Error creating account')
      }
    })
  },

  async updateAccount ({ commit }, payload) {
    return await fetch(`${this.$config.API_STRAPI_ENDPOINT}accounts/${payload.accountId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: payload.account
      })
    }).then((response) => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error('Error updating account')
      }
    })
  },

  async deleteAccount ({ commit }, payload) {
    return await fetch(`${this.$config.API_STRAPI_ENDPOINT}accounts/${payload.accountId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    }).then((response) => {
      if (response.status === 200) {
        return true
      } else {
        throw new Error('Error deleting account')
      }
    })
  }
}

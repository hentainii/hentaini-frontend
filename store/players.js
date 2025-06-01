export const state = () => {
  return {
    players: [],
    playersWithAccounts: [],
    currentPlayer: null
  }
}
export const mutations = {
  getPlayers (state, players) {
    state.players = players.data
  },
  getPlayersWithAccounts (state, players) {
    state.playersWithAccounts = players.data
  },
  setCurrentPlayer (state, player) {
    state.currentPlayer = player
  }
}
export const actions = {
  async getPlayers ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}players?sort=createdAt:desc`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((players) => {
        commit('getPlayers', players)
      })
  },
  async getPlayersWithAccounts ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      populate: ['accounts'],
      filters: {
        up_available: true
      },
      sort: ['name:asc']
    }, {
      encodeValuesOnly: true
    })

    await fetch(`${this.$config.API_STRAPI_ENDPOINT}players?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((players) => {
        commit('getPlayersWithAccounts', players)
      })
  },
  createPlayer ({ commit }, payload) {
    return fetch(`${this.$config.API_STRAPI_ENDPOINT}players`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: payload.player
      })
    }).then((response) => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error('Error creating player')
      }
    })
  },
  async editPlayer ({ commit }, payload) {
    return await fetch(`${this.$config.API_STRAPI_ENDPOINT}players/${payload.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: payload.player
      })
    }).then((response) => {
      if (response.status === 200) {
        return response.json()
      } else {
        throw new Error('Error editing player')
      }
    })
  },
  async deletePlayer ({ commit }, payload) {
    return await fetch(`${this.$config.API_STRAPI_ENDPOINT}players/${payload.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    }).then((response) => {
      if (response.status === 200) {
        return true
      } else {
        throw new Error('Error deleting player')
      }
    })
  }
}

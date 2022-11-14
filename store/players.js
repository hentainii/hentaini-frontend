export const state = () => {
  return {
    players: []
  }
}
export const mutations = {
  getPlayers (state, players) {
    state.players = players.data
  }
}
export const actions = {
  async getPlayers ({ commit }, payload) {
    await fetch(`${process.env.API_STRAPI_ENDPOINT}players?sort=createdAt:desc`, {
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
  createPlayer ({ commit }, payload) {
    fetch(`${process.env.API_STRAPI_ENDPOINT}players`, {
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
        this.$router.push({ path: '/panel/player/create', query: { created: true } })
      } else {
        throw new Error('Error creating player')
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  }
}

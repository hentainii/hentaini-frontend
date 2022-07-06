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
    await fetch(`${process.env.API_STRAPI_ENDPOINT}players`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((players) => {
        this.players = players
      })
  }
}

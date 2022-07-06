export const state = () => {
  return {
    currentEpisode: {}
  }
}
export const mutations = {
  getEpisode (state, episode) {
    state.currentEpisode = episode.data
  }
}
export const actions = {
  async getEpisode ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      populate: payload.populate
    },
    {
      encodeValuesOnly: true
    })
    await fetch(`${process.env.API_STRAPI_ENDPOINT}episodes/${payload.episodeId}?${query}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    })
      .then(res => res.json())
      .then((episode) => {
        commit('getEpisode', episode)
      })
  }
}

export const state = () => {
  return {}
}
export const mutations = {
  getEpisode (state, episode) {
    episode.data.players = JSON.parse(episode.data.players)

    state.currentEpisode = episode.data
  },
  addPlayer (state) {
    state.currentEpisode.players.push({
      name: '',
      url: ''
    })
  }
}
export const actions = {
  getEpisode ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      populate: payload.populate
    },
    {
      encodeValuesOnly: true
    })
    return new Promise((resolve, reject) => {
      fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes/${payload.episodeId}?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((episode) => {
          resolve(episode)
        })
    })
  },
  async editEpisode ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes/${payload.episode.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: payload.episode
      })
    }).then((response) => {
      if (response.status === 200) {
        this.$router.push({ path: `/panel/serie/${payload.episode.serie.id}/episodes`, query: { edited: true } })
      } else {
        throw new Error('Error creating serie')
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  },
  async createEpisode ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      },
      body: JSON.stringify({
        data: payload.episode
      })
    }).then((response) => {
      if (response.status === 200) {
        this.$router.push({ path: `/panel/serie/${payload.episode.serie}/episodes`, query: { created: true } })
      } else {
        throw new Error('Error creating serie')
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  }
}

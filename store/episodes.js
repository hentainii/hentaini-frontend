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
  addVisit ({ commit }, payload) {
    return new Promise((resolve, reject) => {
      fetch(`${this.$config.API_STRAPI_ENDPOINT}series/${payload.serieId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            visits: payload.visits
          }
        })
      })
        .then(res => res.json())
        .then((episode) => {
          resolve(episode)
        })
    })
  },
  getEpisodePublic ({ commit }, payload) {
    try {
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          serie: {
            url: {
              $eq: payload.serieId
            }
          },
          episode_number: {
            $eq: payload.episode_number
          }
        },
        populate: [
          'serie',
          'serie.episodes',
          'serie.status',
          'image'
        ],
        sort: ['createdAt:desc']
      },
      {
        encodeValuesOnly: true
      })
      return new Promise((resolve, reject) => {
        fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes?${query}`)
          .then(res => res.json())
          .then((episode) => {
            resolve(episode.data[0])
          })
      })
    } catch (error) {
      console.log(error)
    }
  },
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
  editEpisode ({ commit }, payload) {
    return new Promise((resolve, reject) => {
      fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes/${payload.episode.id}`, {
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
  },
  async deleteEpisode ({ commit }, payload) {
    await fetch(`${this.$config.API_STRAPI_ENDPOINT}episodes/${payload.episodeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${payload.token}`
      }
    }).then((response) => {
      if (response.status === 200) {
        return true
      } else {
        throw new Error('Error deleting serie')
      }
    }).catch((error) => {
      // eslint-disable-next-line no-console
      console.error(error)
    })
  }
}

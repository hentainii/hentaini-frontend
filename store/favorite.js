export const state = () => {

}
export const mutations = {

}
export const actions = {
  getFavorites ({ commit }, payload) {
    const qs = require('qs')
    const query = qs.stringify({
      filters: {
        serie: payload.serie.id,
        user: payload.user.id
      },
      populate: ['serie']
    },
    {
      encodeValuesOnly: true
    })
    return new Promise((resolve, reject) => {
      fetch(`${this.$config.API_STRAPI_ENDPOINT}favorites?${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((favorites) => {
          favorites.data.map((favorite) => {
            favorite.h_id = favorite.serie.h_id
            return favorite
          })
          resolve(favorites.data)
        })
    })
  },
  setNewFavorite ({ commit }, payload) {
    return new Promise((resolve, reject) => {
      fetch(`${this.$config.API_STRAPI_ENDPOINT}favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        },
        body: JSON.stringify({
          data: {
            user: payload.user.id,
            serie: payload.serie.id
          }
        })
      })
        .then(res => res.json())
        .then((favorite) => {
          resolve(favorite)
        })
    })
  },
  removeFavorite ({ commit }, payload) {
    return new Promise((resolve, reject) => {
      fetch(`${this.$config.API_STRAPI_ENDPOINT}favorites/${payload.favorite.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${payload.token}`
        }
      })
        .then(res => res.json())
        .then((favorite) => {
          resolve(favorite)
        })
    })
  }
}

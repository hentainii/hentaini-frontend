<template>
  <v-autocomplete
    v-model="internalValue"
    :items="episodeOptions"
    label="Selecciona un episodio"
    item-text="title"
    item-value="id"
    dense
    clearable
    outlined
    :search-input.sync="episodeSearch"
    :loading="isSearching"
    hide-no-data
    hide-details
    @update:search-input="onSearch"
    @change="onEpisodeSelect"
  />
</template>

<script>
import qs from 'qs'

export default {
  name: 'EpisodeAutocomplete',
  props: {
    value: {
      type: [String, Number, Object],
      default: null
    }
  },
  data () {
    return {
      episodeSearch: '',
      internalValue: this.value,
      episodes: [], // últimos 25
      episodeOptions: [],
      isSearching: false,
      lastApiResults: []
    }
  },
  watch: {
    value (val) {
      this.internalValue = val
    },
    internalValue (val) {
      this.$emit('input', val)
      this.$emit('change', this.episodes.concat(this.lastApiResults).find(e => e.id === val) || null)
    }
  },
  async mounted () {
    await this.fetchLatestEpisodes()
    this.episodeOptions = this.episodes
  },
  methods: {
    async fetchLatestEpisodes () {
      const token = this.$store.state.auth.token
      // Buscar las últimas 25 series y popular todos sus episodios
      const query = qs.stringify({
        sort: ['createdAt:desc'],
        populate: ['episodes'],
        pagination: { page: 1, pageSize: 25 }
      }, { encodeValuesOnly: true })
      const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      // Aplanar todos los episodios de las series
      this.episodes = data.data.flatMap((serie) => {
        if (!serie.episodes) { return [] }
        return (serie.episodes || []).map(ep => ({
          id: ep.id,
          title: `Serie: ${serie.title} - Episodio ${ep.episode_number}`,
          episode_number: ep.episode_number,
          serie: { id: serie.id, title: serie.title }
        }))
      })
      this.episodeOptions = this.episodes
    },
    async onSearch (term) {
      const searchTerm = (term || '').toLowerCase()
      // Si no hay término, mostrar los últimos 25
      if (!searchTerm) {
        this.episodeOptions = this.episodes
        this.lastApiResults = []
        return
      }
      // Buscar en los últimos 25 episodios
      const localResults = this.episodes.filter(e => (e.title || '').toLowerCase().includes(searchTerm))
      if (localResults.length > 0) {
        this.episodeOptions = localResults
        this.lastApiResults = []
        return
      }
      // Si no hay resultados locales, buscar en la API de series por nombre
      this.isSearching = true
      const token = this.$store.state.auth.token
      const query = qs.stringify({
        filters: {
          title: { $containsi: searchTerm }
        },
        populate: ['episodes'],
        sort: ['createdAt:desc'],
        pagination: { page: 1, pageSize: 25 }
      }, { encodeValuesOnly: true })
      const res = await fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      const data = await res.json()
      this.lastApiResults = data.data.flatMap((serie) => {
        if (!serie.episodes) { return [] }
        return (serie.episodes || []).map(ep => ({
          id: ep.id,
          title: `Serie: ${serie.title} - Episodio ${ep.episode_number}`,
          episode_number: ep.episode_number,
          serie: { id: serie.id, title: serie.title }
        }))
      })
      this.episodeOptions = this.lastApiResults
      this.isSearching = false
    },
    onEpisodeSelect (val) {
      this.internalValue = val
    }
  }
}
</script>

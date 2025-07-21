<template>
  <v-autocomplete
    v-model="internalValue"
    :items="serieOptions"
    label="Selecciona una serie"
    item-text="title"
    item-value="id"
    dense
    clearable
    outlined
    :search-input.sync="serieSearch"
    :loading="isSearching"
    hide-no-data
    hide-details
    @update:search-input="onSearch"
    @change="onSerieSelect"
  />
</template>

<script>
import qs from 'qs'

export default {
  name: 'SerieAutocomplete',
  props: {
    value: {
      type: [String, Number, Object],
      default: null
    }
  },
  data () {
    return {
      serieSearch: '',
      internalValue: this.value,
      series: [], // últimas 25
      serieOptions: [],
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
      this.$emit('change', this.series.concat(this.lastApiResults).find(s => s.id === val) || null)
    }
  },
  async mounted () {
    await this.fetchLatestSeries()
    this.serieOptions = this.series
  },
  methods: {
    async fetchLatestSeries () {
      const token = this.$store.state.auth.token
      // Buscar las últimas 25 series
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
      this.series = data.data.map(serie => ({
        id: serie.id,
        title: `${serie.title} (${serie.episodes?.length || 0} eps)`,
        rawTitle: serie.title
      }))
      this.serieOptions = this.series
    },
    async onSearch (term) {
      const searchTerm = (term || '').toLowerCase()
      // Si no hay término, mostrar las últimas 25
      if (!searchTerm) {
        this.serieOptions = this.series
        this.lastApiResults = []
        return
      }
      // Buscar en las últimas 25 series
      const localResults = this.series.filter(s => (s.rawTitle || '').toLowerCase().includes(searchTerm))
      if (localResults.length > 0) {
        this.serieOptions = localResults
        this.lastApiResults = []
        return
      }
      // Si no hay resultados locales, buscar en la API
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
      this.lastApiResults = data.data.map(serie => ({
        id: serie.id,
        title: `${serie.title} (${serie.episodes?.length || 0} eps)`,
        rawTitle: serie.title
      }))
      this.serieOptions = this.lastApiResults
      this.isSearching = false
    },
    onSerieSelect (val) {
      this.internalValue = val
    }
  }
}
</script>

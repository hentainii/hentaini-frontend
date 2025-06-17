<template>
  <v-autocomplete
    v-model="internalValue"
    :items="studioOptions"
    label="Studio (Animation Studio)"
    item-text="name"
    item-value="id"
    dense
    clearable
    outlined
    chips
    :search-input.sync="studioSearch"
    :return-object="false"
    @change="onStudioSelect"
  />
</template>

<script>
export default {
  name: 'StudioAutocomplete',
  props: {
    value: {
      type: [String, Number, Object],
      default: null
    }
  },
  data () {
    return {
      studioSearch: '',
      internalValue: this.value
    }
  },
  computed: {
    studioList () {
      return this.$store.state.studios.studioList || this.$store.state.studios.studios || []
    },
    studioOptions () {
      const input = this.studioSearch && this.studioSearch.trim()
      const exists = this.studioList.some(
        s => s.name.toLowerCase() === input?.toLowerCase()
      )
      const options = [...this.studioList]
      if (input && !exists) {
        options.unshift({
          id: '__create__',
          name: `Crear nuevo estudio: "${input}"`
        })
      }
      return options
    }
  },
  watch: {
    value (val) {
      this.internalValue = val
    },
    internalValue (val) {
      this.$emit('input', val)
    }
  },
  mounted () {
    this.getStudios()
  },
  methods: {
    async getStudios () {
      await this.$store.dispatch('studios/getStudios', {
        token: this.$store.state.auth.token
      })
    },
    async createStudio (studioName) {
      await this.$store.dispatch('studios/createStudio', {
        token: this.$store.state.auth.token,
        studioData: { name: studioName }
      })
      await this.getStudios()
      const created = this.studioList.find(s => s.name.toLowerCase() === studioName.toLowerCase())
      if (created) {
        this.internalValue = created.id
      }
    },
    async onStudioSelect (val) {
      if (val === '__create__' || (val && val.id === '__create__')) {
        const name = this.studioSearch.trim()
        await this.createStudio(name)
        this.studioSearch = ''
      } else {
        this.internalValue = val && val.id ? val.id : val
      }
    }
  }
}
</script>

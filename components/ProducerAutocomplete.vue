<template>
  <v-autocomplete
    v-model="internalValue"
    :items="producerOptions"
    label="Producer (Production Company)"
    item-text="name"
    item-value="id"
    dense
    clearable
    outlined
    chips
    :search-input.sync="producerSearch"
    :return-object="false"
    @change="onProducerSelect"
  />
</template>

<script>
export default {
  name: 'ProducerAutocomplete',
  props: {
    value: {
      type: [String, Number, Object],
      default: null
    }
  },
  data () {
    return {
      producerSearch: '',
      internalValue: this.value
    }
  },
  computed: {
    producerList () {
      return this.$store.state.producers.producerList || this.$store.state.producers.producers || []
    },
    producerOptions () {
      const input = this.producerSearch && this.producerSearch.trim()
      const exists = this.producerList.some(
        s => s.name.toLowerCase() === input?.toLowerCase()
      )
      const options = [...this.producerList]
      if (input && !exists) {
        options.unshift({
          id: '__create__',
          name: `Crear nueva productora: "${input}"`
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
    this.getProducers()
  },
  methods: {
    async getProducers () {
      await this.$store.dispatch('producers/getProducers', {
        token: this.$store.state.auth.token
      })
    },
    onProducerSelect (val) {
      if (val === '__create__' || (val && val.id === '__create__')) {
        const name = this.producerSearch.trim()
        this.createProducer(name)
        this.producerSearch = ''
        this.$emit('change', this.internalValue)
      } else {
        this.internalValue = val && val.id ? val.id : val
        this.$emit('change', this.internalValue)
      }
    },
    async createProducer (producerName) {
      await this.$store.dispatch('producers/createProducer', {
        token: this.$store.state.auth.token,
        producer: { name: producerName }
      })
      await this.getProducers()
      const created = this.producerList.find(s => s.name.toLowerCase() === producerName.toLowerCase())
      if (created) {
        this.$emit('input', created.id)
      }
    }
  }
}
</script>

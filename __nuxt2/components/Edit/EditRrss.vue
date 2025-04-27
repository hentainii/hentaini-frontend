<template>
  <div>
    <v-alert
      v-if="alertBox"
      type="info"
      :class="alertBoxColor"
      tile
      dismissible
    >
      {{ createdMessage }}
    </v-alert>
    <v-form v-model="valid">
      <!-- <v-text-field
        v-model="Rrss.name"
        label="Name"
        required
        dense
      /> -->
      <v-text-field
        v-model="Rrss.url"
        label="Url"
        required
        dense
      />
      <!-- <v-select
        v-model="Rrss.active"
        :items="items"
        label="Active?"
        required
        dense
      /> -->
      <v-btn
        class="mr-4"
        color="success"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="updateRrss"
      >
        Edit Social Network
      </v-btn>
    </v-form>
  </div>
</template>

<script>
/* eslint-disable vue/prop-name-casing */

export default {
  name: 'EditForm',
  apollo: {
    Rrss () {
      return {
        query: `
        query{
          Rrss{
            name
            url
          }
        }
      `
      }
    }
  },
  props: {
    Rrss: {
      type: Object,
      default: () => {},
      name: {
        type: String,
        default: ''
      },
      url: {
        type: Number,
        default: 1
      },
      active: {
        type: String,
        default: ''
      }
    }
  },
  data: () => {
    return {
      valid: false,
      alertBox: false,
      alertBoxColor: '',
      createdMessage: '',
      isSubmitting: false,
      items: ['YES', 'NO']
    }
  },
  methods: {
    updateRrss () {
      this.$apollo.mutate({
        mutation: gql`mutation ($input: inputRrss){
          updateRrss(input: $input){
            success
            errors{
              path
              message
            }
          }
        }`,
        variables: {
          input: {
            name: this.Rrss.name,
            url: this.Rrss.url,
            active: this.Rrss.active
          }
        }
      }).then((input) => {
        if (input.data.updateRrss.success) {
          this.$emit('updateRrss', this.Rrss)
          // window.location.reload(true)
        } else {
          this.alertBox = true
          this.alertBoxColor = 'red darken-4'
          this.createdMessage = input.data.updateRrss.errors[0].message
          this.isSubmitting = false
        }
      }).catch((error) => {
        this.alertBox = true
        this.alertBoxColor = 'red darken-4'
        this.createdMessage = error
        this.isSubmitting = false
      })
    }
  }
}
</script>

<style>

</style>

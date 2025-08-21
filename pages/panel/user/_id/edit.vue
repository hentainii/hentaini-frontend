<template>
  <v-container>
    <v-row>
      <v-col>
        <!-- Alert for success message -->
        <v-alert
          v-if="successMessage"
          type="success"
          dismissible
          class="mb-4"
          @input="successMessage = ''"
        >
          {{ successMessage }}
        </v-alert>

        <!-- Alert for error message -->
        <v-alert
          v-if="errorMessage"
          type="error"
          dismissible
          class="mb-4"
          @input="errorMessage = ''"
        >
          {{ errorMessage }}
        </v-alert>

        <v-card>
          <v-card-title>
            Modify user password
          </v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="password"
                :rules="passwordRules"
                label="Password"
                required
                type="password"
                hide-details="auto"
                class="mb-5"
                :disabled="loading"
              />
              <v-text-field
                v-model="passwordConfirm"
                :rules="passwordConfirmRules"
                label="Confirm password"
                required
                type="password"
                hide-details="auto"
                :disabled="loading"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              :disabled="!valid || loading"
              :loading="loading"
              @click="submit"
            >
              Confirm
            </v-btn>
            <v-btn
              text
              :disabled="loading"
              @click="$router.push('/panel/user')"
            >
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'UserEdit',
  layout: 'panel',
  data () {
    return {
      valid: false,
      loading: false,
      password: '',
      passwordConfirm: '',
      successMessage: '',
      errorMessage: '',
      passwordRules: [
        v => !!v || 'Password is required',
        v => (v && v.length >= 8) || 'Password must be more than 8 characters'
      ],
      passwordConfirmRules: [
        v => !!v || 'Password confirmation is required',
        v => (v && v.length >= 8) || 'Password confirmation must be more than 8 characters',
        v => (v && v === this.password) || 'Password confirmation must be the same as password'
      ]
    }
  },
  head () {
    return {
      title: 'Modify user password | Hentaini'
    }
  },
  methods: {
    submit () {
      // Clear previous messages
      this.successMessage = ''
      this.errorMessage = ''

      // Validate form before submitting
      if (!this.$refs.form.validate()) {
        this.errorMessage = 'Please fix the form errors before submitting'
        return
      }

      this.loading = true

      this.$store.dispatch('user/updatePassword', {
        token: this.$store.state.auth.token,
        id: this.$route.params.id,
        password: this.password
      }).then((response) => {
        this.loading = false
        this.successMessage = 'Password updated successfully!'

        // Clear form
        this.password = ''
        this.passwordConfirm = ''
        this.$refs.form.resetValidation()

        // Redirect after showing success message
        setTimeout(() => {
          this.$router.push('/panel/user')
        }, 2000)
      }).catch((err) => {
        this.loading = false
        console.error('Error updating password:', err)

        // Show user-friendly error message
        if (err.response && err.response.data && err.response.data.error) {
          this.errorMessage = err.response.data.error.message || 'Failed to update password'
        } else if (err.message) {
          this.errorMessage = err.message
        } else {
          this.errorMessage = 'An error occurred while updating the password. Please try again.'
        }
      })
    }
  }
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col>
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
              />
              <v-text-field
                v-model="passwordConfirm"
                :rules="passwordConfirmRules"
                label="Confirm password"
                required
                type="password"
                hide-details="auto"
              />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="primary"
              :disabled="!valid"
              @click="submit"
            >
              Confirm
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
      password: '',
      passwordConfirm: '',
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
      this.$store.dispatch('user/updatePassword', {
        token: this.$store.state.auth.token,
        id: this.$route.params.id,
        password: this.password
      }).then((_) => {
        // this.$router.push('/panel/user')
      }).catch((err) => {
        console.log(err)
      })
    }
  }
}
</script>

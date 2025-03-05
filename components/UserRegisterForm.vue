<template>
  <v-card
    flat
    color="rgba(51,51,51,0.5)"
  >
    <v-card-title class="justify-center">
      Register a new Account
    </v-card-title>
    <v-card-text>
      <form>
        <v-text-field
          v-model="username"
          :rules="usernameRules"
          label="Username"
          required
        />
        <v-text-field
          v-model="email"
          label="Email (Optional)"
          hint="You can't recover your account if you forgot your password if you not define an email."
        />
        <v-text-field
          v-model="password"
          :rules="passwordRules"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          hint="Enter your password"
          required
          counter
          @click:append="showPassword = !showPassword"
        />
        <v-text-field
          v-model="confirmPassword"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Confirm Password"
          hint="Confirm your password"
          required
          counter
          @blur="matchPasswords"
          @click:append="showPassword = !showPassword"
        />
      </form>
    </v-card-text>
    <v-card-text>
      <v-btn block text class="my-2 yellow darken-4" @click="createUser">
        Register
      </v-btn>
      <v-btn block text class="gray darken-4" href="/">
        Back to home
      </v-btn>
    </v-card-text>
    <v-card-text>
      <h4 class="text-center">
        Aready a member?
      </h4>
      <p class="text-center">
        Log into your account and navigate for your favorite Hentai
      </p>
      <v-btn block tile text class="primary" href="/login">
        Login
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>

export default {

  data: () => ({
    username: '',
    usernameRules: [
      v => !!v || 'Username is required',
      v => (v && v.length <= 32) || 'Name must be less than 32 characters'
    ],
    email: '',
    password: '',
    passwordRules: [
      v => !!v || 'Really men?',
      v => (v && v.length >= 8) || 'Your password must be at least 8 characters or more.'
    ],
    confirmPassword: '',
    confirmPasswordRules: [
      v => !!v || 'U want a hug?'
    ],
    showPassword: false,
    valid: false
  }),

  methods: {
    matchPasswords () {
      if (this.password === this.confirmPassword) {
        this.valid = true
      } else {
        this.valid = false
      }
    },
    clear () {
      this.$v.$reset()
      this.name = ''
      this.email = ''
      this.select = null
      this.checkbox = false
    },
    async createUser () {
      if (!this.email) {
        this.email = 'noemail@mail.com'
      }
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}auth/local/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.username,
          email: this.email,
          password: this.password
        })
      }).then((input) => {
        if (input.status === 200) {
          this.$router.push({ path: '/login?firstTime=true' })
        } else {
          this.loginFailed = true
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
      })
    }
  }
}
</script>

<style>

</style>

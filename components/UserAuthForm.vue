<template>
  <v-card
    flat
    color="rgba(51,51,51,0.5)"
    style="backdrop-filter:blur(5px);"
  >
    <v-alert
      v-if="firstTime"
      type="info"
      class="primary"
      tile
    >
      Welcome to Hentaini. Now you can log into your account.
    </v-alert>
    <v-alert
      v-if="loginFailed"
      type="error"
      tile
    >
      Invalid login credentials. Try again.
    </v-alert>
    <v-card-title class="justify-center">
      Login into your account
    </v-card-title>
    <v-card-text>
      <form @keyup.enter="login">
        <v-text-field
          v-model="username"
          label="Username"
          required
        />
        <v-text-field
          v-model="password"
          :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          hint="Enter your password"
          required
          @click:append="showPassword = !showPassword"
        />
      </form>
    </v-card-text>
    <v-card-text>
      <v-btn rounded text block class="my-2 primary" @click.enter="login">
        Login
      </v-btn>
      <v-btn block rounded text class="gray darken-4" href="/">
        Back to home
      </v-btn>
    </v-card-text>
    <v-card-text>
      <h4 class="text-center">
        Not registered yet?
      </h4>
      <p class="text-center">
        Join us and access the best Hentai in the interwebs!
      </p>
      <v-btn block rounded text class="yellow darken-4" href="/register">
        Register
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script>

import Cookie from 'js-cookie'

export default {

  data: () => ({
    username: '',
    password: '',
    showPassword: false,
    firstTime: false,
    loginFailed: false
  }),
  mounted () {
    if (this.$route.query.firstTime) {
      this.firstTime = true
    }
    if (this.$route.query.loginFailed) {
      this.loginFailed = true
    }
  },
  methods: {
    clear () {
      this.username = ''
      this.password = ''
    },
    async login () {
      await fetch(`${this.$config.API_STRAPI_ENDPOINT}auth/local`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: this.username,
          password: this.password
        })
      }).then((input) => {
        if (input.status === 200) {
          Promise.resolve(input.json())
            .then((res) => {
              const auth = {
                token: res.jwt,
                username: res.user.username,
                id: res.user.id,
                level: res.user.level
              }
              this.$store.commit('setAuth', auth)
              Cookie.set('auth', JSON.stringify(auth))
              this.$router.replace('/')
            })
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

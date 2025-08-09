<template>
  <v-app dark>
    <LayoutToolBar header="Hentaini Panel" />
    <v-main>
      <nuxt />
    </v-main>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  background: #222;
}

a {
  color: #666;
  text-decoration: none;
}

ul {
  list-style: none;
}

</style>

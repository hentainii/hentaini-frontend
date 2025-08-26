<template>
  <v-app dark>
    <v-main>
      <nuxt />
    </v-main>
    <LayoutFooter />
  </v-app>
</template>

<script>
export default {
  mounted () {
    if (process.browser) {
      this.$gtag('config', 'G-CC7E5GXL8F', {
        page_title: this.$metaInfo.title,
        page_path: this.$route.fullPath
      })
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
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background-color: #222;
}
::-webkit-scrollbar-thumb {
  background: #6d6d6d;
}
::-webkit-scrollbar-thumb:hover {
  background: #dfca42;
}
</style>

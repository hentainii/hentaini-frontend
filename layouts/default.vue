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
  background: #f4f4f4;
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
  background: #e4e429;
}
::-webkit-scrollbar-thumb:hover {
  background: #dfca42;
}
.v-application a {
  color: #f8f829;
}
</style>

<template>
  <v-app dark>
    <v-main>
      <nuxt />
    </v-main>
    <LayoutFooter />
    <MobileHeader class="d-md-none" />
  </v-app>
</template>

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

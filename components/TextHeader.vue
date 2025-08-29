<template>
  <v-card class="text-center my-0 text-header-card" elevation="0">
    <v-card-text>
      <h1 class="header-title">
        <span class="gradient-text">Hentaini.</span> Watch and save your favorite Hentai online in HD for free.
      </h1>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.text-header-card {
  background: transparent;
  overflow: hidden;
  position: relative;
  margin-bottom: 10px;
}

.header-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  position: relative;
  z-index: 1;
  line-height: 1.3;
  text-wrap: balance;
}

.gradient-text {
  background: linear-gradient(45deg, #FF6B6B, #FFE66D, #6B66FF);
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: gradientFlow 8s ease infinite;
}

.animated-underline {
  height: 3px;
  width: 0;
  background: linear-gradient(90deg, #FF6B6B, #FFE66D, #6B66FF);
  margin: 0 auto;
  animation: expandLine 0.8s forwards ease-out;
  border-radius: 2px;
  margin-bottom: 20px;
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes expandLine {
  0% { width: 0; }
  100% { width: 60%; }
}

/* Ajustes para dispositivos móviles */
@media (max-width: 600px) {
  .header-title {
    font-size: 1.5rem;
    line-height: 1.4;
    padding: 0.8rem;
  }
}
</style>

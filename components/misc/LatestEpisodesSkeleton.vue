<template>
  <v-container class="latest-episodes-skeleton-container">
    <div class="section-header-skeleton">
      <div class="header-content">
        <v-skeleton-loader
          type="text"
          width="120"
          class="subtitle-skeleton"
          dark
        ></v-skeleton-loader>
        <v-skeleton-loader
          type="heading"
          width="250"
          class="mt-1"
          dark
        ></v-skeleton-loader>
      </div>
      <div class="animated-bar-skeleton"></div>
    </div>

    <v-row class="episodes-grid-skeleton">
      <v-col
        v-for="n in 12"
        :key="n"
        cols="6"
        xl="2"
        lg="3"
        md="4"
        sm="6"
        xs="6"
        class="episode-item-skeleton"
      >
        <v-skeleton-loader
          class="episode-skeleton-card"
          type="card"
          height="200"
          dark
        >
          <div class="skeleton-card-content">
            <v-skeleton-loader
              type="text"
              width="70%"
              class="mt-2"
              dark
            ></v-skeleton-loader>
            <v-skeleton-loader
              type="text"
              width="40%"
              class="mt-1"
              dark
            ></v-skeleton-loader>
          </div>
        </v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LatestEpisodesSkeleton'
}
</script>

<style scoped>
.latest-episodes-skeleton-container {
  position: relative;
  padding-top: 10px;
  padding-bottom: 20px;
}

.section-header-skeleton {
  margin-bottom: 20px;
  position: relative;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.subtitle-skeleton {
  max-width: 120px;
  border-radius: 4px;
}

.animated-bar-skeleton {
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #1a1a1a, #2c2c2c, #1a1a1a);
  border-radius: 3px;
  margin-bottom: 12px;
  animation: pulse 1.5s infinite;
}

.episodes-grid-skeleton {
  margin-top: 12px;
}

.episode-item-skeleton {
  animation: fadeUp 0.3s forwards;
}

.episode-skeleton-card {
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(to right, #1a1a1a, #2c2c2c, #1a1a1a);
  height: 100%;
  animation: pulse 1.5s infinite;
}

.skeleton-card-content {
  padding: 8px;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    opacity: 0.7;
  }
}

/* Staggered animation for skeleton items */
.episode-item-skeleton:nth-child(1) { animation-delay: 0.05s; }
.episode-item-skeleton:nth-child(2) { animation-delay: 0.08s; }
.episode-item-skeleton:nth-child(3) { animation-delay: 0.11s; }
.episode-item-skeleton:nth-child(4) { animation-delay: 0.14s; }
.episode-item-skeleton:nth-child(5) { animation-delay: 0.17s; }
.episode-item-skeleton:nth-child(6) { animation-delay: 0.2s; }
.episode-item-skeleton:nth-child(7) { animation-delay: 0.23s; }
.episode-item-skeleton:nth-child(8) { animation-delay: 0.26s; }
.episode-item-skeleton:nth-child(9) { animation-delay: 0.29s; }
.episode-item-skeleton:nth-child(10) { animation-delay: 0.32s; }
.episode-item-skeleton:nth-child(11) { animation-delay: 0.35s; }
.episode-item-skeleton:nth-child(12) { animation-delay: 0.38s; }
</style>

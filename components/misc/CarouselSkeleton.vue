<template>
  <div class="d-none d-md-block">
    <v-skeleton-loader
      class="carousel-skeleton rounded-xl elevation-10 overflow-hidden"
      type="image"
      style="height: 450px;"
      dark
    >
      <div class="carousel-skeleton-gradient fill-height" />
      <v-row align="end" class="lightbox white--text pa-0 ma-0 fill-height">
        <v-col cols="12" md="8" lg="6" class="carousel-skeleton-content pa-6">
          <!-- Featured badge skeleton -->
          <v-skeleton-loader
            type="chip"
            width="100"
            dark
            class="mb-2"
          />
          <!-- Status chip skeleton -->
          <v-skeleton-loader
            type="chip"
            width="90"
            dark
            class="mt-2 mb-2"
          />
          <!-- Title skeleton -->
          <v-skeleton-loader
            type="heading"
            class="mt-2 mb-2"
            dark
          />

          <!-- Genre chips skeleton -->
          <div class="d-flex mt-2 mb-3">
            <v-skeleton-loader
              v-for="i in 3"
              :key="i"
              type="chip"
              width="60"
              class="mr-2"
              dark
            />
          </div>

          <!-- Synopsis skeleton -->
          <v-skeleton-loader
            type="paragraph"
            class="mt-2"
            dark
          />
          <!-- Button skeleton -->
          <v-skeleton-loader
            type="button"
            class="mt-4"
            width="150"
            dark
          />
        </v-col>
      </v-row>

      <!-- Indicator dots skeleton -->
      <div class="carousel-skeleton-indicators">
        <div v-for="i in 4" :key="i" class="skeleton-indicator-dot" />
      </div>
    </v-skeleton-loader>
  </div>
</template>

<script>
export default {
  name: 'CarouselSkeleton'
}
</script>

<style scoped>
.carousel-skeleton {
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(to right, #1a1a1a, #2c2c2c, #1a1a1a);
  animation: pulse 1.5s infinite;
  position: relative;
}

.carousel-skeleton-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 30%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.1) 80%,
    rgba(0, 0, 0, 0) 100%
  ), linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.7) 15%,
    rgba(0, 0, 0, 0.4) 30%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0) 70%
  );
  z-index: 1;
}

.carousel-skeleton-content {
  position: relative;
  z-index: 2;
}

.carousel-skeleton-indicators {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  z-index: 3;
}

.skeleton-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  margin: 0 4px;
  animation: pulseDot 1.5s infinite;
}

.skeleton-indicator-dot:first-child {
  width: 20px;
  border-radius: 4px;
  background-color: rgba(255, 193, 7, 0.5);
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

@keyframes pulseDot {
  0% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 0.3;
  }
}
</style>

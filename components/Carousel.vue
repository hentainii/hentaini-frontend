<template>
  <v-container class="carousel-container pa-0 d-none d-md-block" fluid>
    <v-carousel
      :show-arrows="false"
      hide-delimiters
      :height="450"
      cycle
      interval="5000"
      class="rounded-xl overflow-hidden"
    >
      <v-carousel-item
        v-for="(serie) in featuredSeries"
        :key="serie.id"
        :src="getScreenshotUrl(serie)"
        :lazy-src="getScreenshotPlaceholderUrl(serie)"
        :to="localePath(`/h/${serie.url}`)"
      >
        <template #default>
          <div class="carousel-gradient fill-height" />
          <v-row align="end" class="fill-height pa-0 ma-0 align-center">
            <v-col cols="12" md="8" lg="6" class="carousel-content pa-6">
              <!-- Title with animation -->
              <h1 class="carousel-title mb-2">
                {{ serie.title }}
              </h1>

              <!-- Genres -->
              <div class="genre-chips mb-3">
                <v-chip
                  v-for="(genre, i) in serie.genreList"
                  :key="i"
                  x-small
                  outlined
                  class="mr-1 genre-chip"
                  color="rgba(255, 255, 255, 0.7)"
                >
                  {{ genre.name }}
                </v-chip>
              </div>

              <!-- Synopsis -->
              <p class="carousel-synopsis">
                {{ trimTextToLength(serie.synopsis, 300) }}
              </p>

              <!-- Watch button -->
              <v-btn
                :to="localePath(`/h/${serie.url}`)"
                color="primary"
                class="mt-4 font-weight-bold"
                rounded
                elevation="2"
              >
                <v-icon left>
                  mdi-play-circle
                </v-icon>
                {{ $t('landpage.watch_now') || 'Watch Now' }}
              </v-btn>
            </v-col>
          </v-row>
        </template>
      </v-carousel-item>
    </v-carousel>
  </v-container>
</template>

<script>
export default {
  name: 'Carousel',
  props: {
    featuredSeries: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      loading: true
    }
  },
  methods: {
    trimTextToLength (text, length) {
      if (!text) { return '' }
      if (text.length > length) {
        return text.substring(0, length) + '...'
      }
      return text
    },
    getScreenshotUrl (serie) {
      const screenshotImage = serie.images?.find(image => image.image_type?.name === 'screenshot')
      if (screenshotImage?.cf_path) {
        return `${screenshotImage.cf_path}`
      }
      return screenshotImage?.path ? `${this.$config.SCREENSHOT_ENDPOINT}${screenshotImage.path}` : ''
    },
    getScreenshotPlaceholderUrl (serie) {
      const screenshotImage = serie.images?.find(image => image.image_type?.name === 'screenshot')
      if (screenshotImage?.cf_placeholder) {
        return `${screenshotImage.cf_placeholder}`
      }
      if (screenshotImage?.cf_path) {
        return `${screenshotImage.cf_path}`
      }
      const placeholderPath = screenshotImage?.placeholder || screenshotImage?.path
      return placeholderPath ? `${this.$config.SCREENSHOT_ENDPOINT}${placeholderPath}` : ''
    }
  }
}
</script>

<style scoped>
.carousel-container {
  margin-bottom: 1rem;
}

.carousel-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    #121212,
    rgba(0, 0, 0, 0.7) 30%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.1) 80%,
    rgba(0, 0, 0, 0) 100%
  ), linear-gradient(
    to top,
    #121212,
    rgba(0, 0, 0, 0.7) 15%,
    rgba(0, 0, 0, 0.4) 30%,
    rgba(0, 0, 0, 0.1) 50%,
    rgba(0, 0, 0, 0) 70%
  );
  z-index: 1;
}

.carousel-content {
  position: relative;
  z-index: 2;
  animation: fadeInUp 0.5s ease-out;
}

.carousel-title {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.2;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  color: white;
}

.carousel-synopsis {
  font-size: 1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1rem;
  max-width: 90%;
}

.genre-chips {
  display: flex;
  flex-wrap: wrap;
}

.genre-chip {
  margin-bottom: 0.25rem;
  font-size: 0.7rem;
}

.carousel-nav-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.carousel-nav-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.carousel-prev-btn {
  position: absolute;
  top: 50%;
  left: 10px;
  transform: translateY(-50%);
  z-index: 3;
}

.carousel-next-btn {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  z-index: 3;
}

.carousel-indicators {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  z-index: 3;
}

.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  margin: 0 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator-dot.active {
  background-color: #FFC107;
  width: 20px;
  border-radius: 4px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (min-width: 960px) and (max-width: 1264px) {
  .carousel-title {
    font-size: 1.6rem;
  }

  .carousel-synopsis {
    font-size: 0.9rem;
  }
}

@media (min-width: 1264px) {
  .carousel-title {
    font-size: 2rem;
  }

  .carousel-content {
    padding-bottom: 2rem !important;
  }
}
</style>

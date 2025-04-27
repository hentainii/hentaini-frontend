<template>
  <v-container class="carousel-container pa-0 d-none d-md-block">
    <misc-carousel-skeleton v-if="loading" />
    <v-carousel
      v-else-if="$store.state.isDesktop && !loading"
      v-model="model"
      :show-arrows="false"
      hide-delimiters
      :height="400"
      cycle
      interval="5000"
      class="rounded-xl elevation-10 overflow-hidden"
    >
      <v-carousel-item
        v-for="(serie) in featuredSeries"
        :key="serie.title"
        :src="`${$config.SCREENSHOT_ENDPOINT}${serie.images.find(
          image => image.image_type.name === 'screenshot'
        ).path}`"
        :lazy-src="`${$config.SCREENSHOT_ENDPOINT}${serie.images.find(
          image => image.image_type.name === 'screenshot'
        ).placeholder ? serie.images.find(
          image => image.image_type.name === 'screenshot'
        ).placeholder : serie.images.find(
          image => image.image_type.name === 'screenshot'
        ).path}`"
        :to="localePath(`/h/${serie.url}`)"
      >
        <template v-slot:default>
          <div class="carousel-gradient fill-height"></div>
          <v-row align="end" class="fill-height pa-0 ma-0">
            <v-col cols="12" md="8" lg="6" class="carousel-content pa-6">
              <!-- Featured badge -->
              <div class="featured-badge">
                <v-icon small class="mr-1 yellow--text">mdi-star</v-icon>
                <span>{{ $t('landpage.featured') || 'Featured' }}</span>
              </div>

              <!-- Title with animation -->
              <h1 class="carousel-title mb-2">{{ serie.title }}</h1>

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
                <v-icon left>mdi-play-circle</v-icon>
                {{ $t('landpage.watch_now') || 'Watch Now' }}
              </v-btn>
            </v-col>
          </v-row>

          <!-- Indicators dots -->
          <div class="carousel-indicators">
            <div
              v-for="(_, i) in featuredSeries"
              :key="i"
              class="indicator-dot"
              :class="{ 'active': i === model }"
              @click="model = i"
            ></div>
          </div>
        </template>
      </v-carousel-item>
    </v-carousel>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      featuredSeries: [],
      model: 0,
      CDN: process.env.CDN_URI,
      loading: true
    }
  },
  mounted () {
    this.getFeaturedSeries()
  },
  methods: {
    getFeaturedSeries () {
      this.loading = true
      const qs = require('qs')
      const query = qs.stringify({
        filters: {
          featured: true
        },
        populate: [
          'images',
          'images.image_type',
          'status',
          'genreList'
        ],
        sort: ['createdAt:desc']
      },
      {
        encodeValuesOnly: true
      })
      fetch(`${this.$config.API_STRAPI_ENDPOINT}series?${query}`)
        .then(res => res.json())
        .then((series) => {
          series.data.map((serie) => {
            serie.genres = JSON.parse(serie.genres)
            return serie
          })
          this.featuredSeries = series.data
          this.loading = false
        })
        .catch((error) => {
          console.error('Error loading featured series:', error)
          this.loading = false
        })
    },
    trimTextToLength (text, length) {
      if (!text) { return '' }
      if (text.length > length) {
        return text.substring(0, length) + '...'
      }
      return text
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

.carousel-content {
  position: relative;
  z-index: 2;
  animation: fadeInUp 0.5s ease-out;
}

.featured-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  color: #FFEB3B;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.carousel-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  color: white;
  /* Gradient text effect */
  background: linear-gradient(to right, #ffffff, #f0f882);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
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
    font-size: 2rem;
  }

  .carousel-synopsis {
    font-size: 0.9rem;
  }
}

@media (min-width: 1264px) {
  .carousel-title {
    font-size: 2.8rem;
  }

  .carousel-content {
    padding-bottom: 2rem !important;
  }
}
</style>

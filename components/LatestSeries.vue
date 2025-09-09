<template>
  <v-container class="latest-series-container" fluid>
    <div class="section-header">
      <nuxt-link :to="localePath('/explore')" class="section-link">
        <div class="header-content">
          <h2 class="title">
            {{ $t('landpage.latest_series') }}
          </h2>
          <span class="subtitle">
            {{ $t('landpage.latest_series_little') }}
          </span>
        </div>
      </nuxt-link>
    </div>
    <v-row class="series-grid">
      <v-col
        v-for="(serie) in series"
        :key="serie._id"
        cols="6"
        lg="2"
        md="4"
        sm="4"
        xs="4"
        class="serie-item"
      >
        <article>
          <SerieCard
            :serie="serie"
          />
        </article>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'LatestSeries',
  props: {
    series: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      loading: true
    }
  }
}
</script>

<style scoped>
.latest-series-container {
  position: relative;
  padding-top: 10px;
  padding-bottom: 30px;
}

.section-header {
  margin-bottom: 20px;
  position: relative;
}

.section-link {
  text-decoration: none;
}

.header-content {
  display: flex;
  flex-direction: column;
}

.subtitle {
  font-size: 0.8rem;
  color: #a4a578;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  opacity: 0;
  animation: fadeIn 0.3s forwards;
  background: rgba(var(--v-primary-base), 0.15);
  display: inline-block;
  border-radius: 4px;
  margin-bottom: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 6px;
  color: #ffffff;
  opacity: 0;
  animation: fadeIn 0.4s 0.1s forwards;
  line-height: 1.1;
}

.animated-bar {
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #6B66FF, #FFC107);
  border-radius: 3px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  opacity: 0;
  animation: expandWidth 0.4s 0.1s forwards;
}

.animated-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
  transform: translateX(-100%);
  animation: shimmer 2s infinite;
}

.series-grid {
  margin-top: 12px;
}

.serie-item {
  opacity: 0;
  transform: translateY(15px);
  animation: fadeUp 0.3s forwards;
}

@media (min-width: 1264px) {
    .col-lg-2 {
        flex: 0 0 19.999999999% !important;
        max-width: 19.999999999%;
    }
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

@keyframes expandWidth {
  from {
    width: 0;
    opacity: 1;
  }
  to {
    width: 40px;
    opacity: 1;
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* Staggered animation for series items */
.serie-item:nth-child(1) { animation-delay: 0.05s; }
.serie-item:nth-child(2) { animation-delay: 0.08s; }
.serie-item:nth-child(3) { animation-delay: 0.11s; }
.serie-item:nth-child(4) { animation-delay: 0.14s; }
.serie-item:nth-child(5) { animation-delay: 0.17s; }
.serie-item:nth-child(6) { animation-delay: 0.2s; }
.serie-item:nth-child(7) { animation-delay: 0.23s; }
.serie-item:nth-child(8) { animation-delay: 0.26s; }
.serie-item:nth-child(9) { animation-delay: 0.29s; }
.serie-item:nth-child(10) { animation-delay: 0.32s; }
.serie-item:nth-child(11) { animation-delay: 0.35s; }
.serie-item:nth-child(12) { animation-delay: 0.38s; }
</style>

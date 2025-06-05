<template>
  <v-card
    class="producer-card elevation-2"
    hover
    @click="$emit('click')"
  >
    <!-- Content -->
    <v-card-text class="pa-4">
      <!-- Header with icon -->
      <div class="d-flex align-center mb-3">
        <div class="icon-container mr-3">
          <v-icon color="white" size="20">
            mdi-office-building
          </v-icon>
        </div>
        <div class="flex-grow-1">
          <h3 class="card-title mb-1 text-truncate">
            {{ producer.name }}
          </h3>
          <p class="card-subtitle mb-0">
            Producer
          </p>
        </div>
      </div>

      <p v-if="producer.description" class="card-description mb-4">
        {{ producer.description }}
      </p>

      <!-- Stats -->
      <div class="stats-container mb-4">
        <div class="stat-item">
          <span class="stat-value">{{ producer.studiosCount || 0 }}</span>
          <span class="stat-label">Studios</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-value">{{ producer.seriesCount || 0 }}</span>
          <span class="stat-label">Series</span>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="buttons-container">
        <v-btn
          small
          class="action-btn action-btn-primary"
          depressed
          @click.stop="$emit('view-details')"
        >
          <v-icon left small>
            mdi-eye
          </v-icon>
          <span class="d-none d-sm-inline">Detalles</span>
          <span class="d-inline d-sm-none">Ver</span>
        </v-btn>
        <v-btn
          small
          class="action-btn action-btn-secondary"
          text
          @click.stop="$emit('view-studios')"
        >
          <v-icon left small>
            mdi-camera-outline
          </v-icon>
          <span class="d-none d-sm-inline">Studios</span>
          <span class="d-inline d-sm-none">Est.</span>
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'ProducerCard',
  props: {
    producer: {
      type: Object,
      required: true
    }
  },
  emits: ['click', 'view-details', 'view-studios']
}
</script>

<style scoped>
.producer-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
}

.producer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25) !important;
  border-color: rgba(249, 168, 37, 0.3);
}

.icon-container {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f9a825, #f57c00);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(249, 168, 37, 0.3);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
}

.card-subtitle {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.card-description {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stats-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 16px;
}

.buttons-container {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  border-radius: 10px !important;
  font-weight: 500;
  text-transform: none;
  font-size: 0.875rem;
}

.action-btn-primary {
  background: linear-gradient(135deg, #f9a825, #f57c00) !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(249, 168, 37, 0.3);
}

.action-btn-primary:hover {
  box-shadow: 0 6px 16px rgba(249, 168, 37, 0.4) !important;
  transform: translateY(-1px);
}

.action-btn-secondary {
  color: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.action-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

/* Mobile optimizations */
@media (max-width: 599px) {
  .producer-card {
    min-height: 200px;
  }

  .buttons-container {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
  }

  .stats-container {
    padding: 10px 12px;
  }

  .stat-divider {
    margin: 0 12px;
  }
}

/* Small mobile optimizations */
@media (max-width: 360px) {
  .icon-container {
    width: 40px;
    height: 40px;
  }

  .card-title {
    font-size: 1rem;
  }
}
</style>

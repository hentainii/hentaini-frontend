<template>
  <v-card
    class="producer-card rounded-lg elevation-2"
    hover
    @click="$emit('click')"
  >
    <!-- Header with icon and type -->
    <div class="card-header pa-4 primary darken-1">
      <div class="d-flex align-center mb-2">
        <v-icon color="white" class="mr-2" size="24">
          mdi-office-building
        </v-icon>
        <span class="white--text text-caption font-weight-medium">PRODUCTORA</span>
      </div>
    </div>

    <!-- Content -->
    <v-card-text class="pa-4">
      <h3 class="text-h6 font-weight-bold mb-3">
        {{ producer.name }}
      </h3>

      <p v-if="producer.description" class="text-body-2 grey--text mb-4 line-clamp-3">
        {{ producer.description }}
      </p>

      <!-- Stats chips -->
      <div class="d-flex align-center flex-wrap mb-3">
        <v-chip x-small color="blue" outlined class="mr-2 mb-1">
          <v-icon left x-small>
            mdi-camera-outline
          </v-icon>
          {{ producer.studiosCount || 0 }} Studios
        </v-chip>
        <v-chip x-small color="green" outlined class="mb-1">
          <v-icon left x-small>
            mdi-play-circle-outline
          </v-icon>
          {{ producer.seriesCount || 0 }} Series
        </v-chip>
      </div>

      <!-- Action buttons -->
      <div class="d-flex gap-2">
        <v-btn
          small
          color="primary"
          depressed
          @click.stop="$emit('view-details')"
        >
          <v-icon left x-small>
            mdi-eye
          </v-icon>
          Detalles
        </v-btn>
        <v-btn
          small
          color="blue"
          outlined
          @click.stop="$emit('view-studios')"
        >
          <v-icon left x-small>
            mdi-camera-outline
          </v-icon>
          Studios
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
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 200px;
}

.producer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3) !important;
}

.card-header {
  border-radius: 8px 8px 0 0;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  max-height: 4.2em;
}

.gap-2 > * {
  margin-right: 8px;
}

.gap-2 > *:last-child {
  margin-right: 0;
}

@media (max-width: 599px) {
  .producer-card {
    margin-bottom: 8px;
    min-height: 180px;
  }
}
</style>

<template>
  <v-card
    class="studio-card rounded-lg elevation-2"
    hover
    @click="$emit('click')"
  >
    <!-- Header with icon and type -->
    <div class="card-header pa-4 blue darken-1">
      <div class="d-flex align-center mb-2">
        <v-icon color="white" class="mr-2" size="24">
          mdi-camera-outline
        </v-icon>
        <span class="white--text text-caption font-weight-medium">STUDIO</span>
      </div>
    </div>

    <!-- Content -->
    <v-card-text class="pa-4">
      <h3 class="text-h6 font-weight-bold mb-3">
        {{ studio.name }}
      </h3>

      <p v-if="studio.description" class="text-body-2 grey--text mb-4 line-clamp-3">
        {{ studio.description }}
      </p>

      <!-- Stats chips -->
      <div class="d-flex align-center flex-wrap mb-3">
        <v-chip x-small color="orange" outlined class="mr-2 mb-1">
          <v-icon left x-small>
            mdi-office-building
          </v-icon>
          {{ studio.producer || studio.producerName || 'Unknown Producer' }}
        </v-chip>
        <v-chip x-small color="green" outlined class="mb-1">
          <v-icon left x-small>
            mdi-play-circle-outline
          </v-icon>
          {{ studio.seriesCount || 0 }} {{ studio.seriesCount === 1 ? 'Serie' : 'Series' }}
        </v-chip>
      </div>

      <!-- Action buttons -->
      <div class="d-flex gap-2">
        <v-btn
          small
          color="blue"
          depressed
          @click.stop="$emit('view-series')"
        >
          <v-icon left x-small>
            mdi-play-circle-outline
          </v-icon>
          Ver Series
        </v-btn>
        <v-btn
          small
          color="orange"
          outlined
          @click.stop="$emit('view-producer')"
        >
          <v-icon left x-small>
            mdi-office-building
          </v-icon>
          Productora
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'StudioCard',
  props: {
    studio: {
      type: Object,
      required: true
    }
  },
  emits: ['click', 'view-series', 'view-producer']
}
</script>

<style scoped>
.studio-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: 1px solid rgba(255, 255, 255, 0.05);
  min-height: 200px;
}

.studio-card:hover {
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
  .studio-card {
    margin-bottom: 8px;
    min-height: 180px;
  }
}
</style>

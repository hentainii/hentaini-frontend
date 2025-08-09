<template>
  <div class="rating-display" :class="{ 'compact': compact }">
    <div v-if="!compact" class="rating-full">
      <div class="rating-stars">
        <StarRating
          :value="averageRating"
          :size="24"
          readonly
          color="#FFD700"
          empty-color="#E0E0E0"
        />
      </div>
      <div class="rating-info mt-2">
        <div class="rating-average">
          <span class="text-h6 font-weight-bold">{{ formattedRating }}</span>
          <span class="text-caption grey--text ml-1">/5</span>
        </div>
        <div class="rating-votes">
          <span class="text-caption grey--text">
            {{ $t('rating.display.votes', totalVotes) }}
          </span>
        </div>
      </div>
    </div>

    <div v-else class="rating-compact d-flex align-center">
      <v-icon color="#FFD700" size="16" class="mr-1">
        mdi-star
      </v-icon>
      <span class="text-caption font-weight-medium mr-1">
        {{ formattedRating }}
      </span>
      <span class="text-caption grey--text">
        ({{ totalVotes }})
      </span>
    </div>
  </div>
</template>

<script>
import StarRating from './StarRating.vue'

export default {
  name: 'RatingDisplay',
  components: {
    StarRating
  },
  props: {
    averageRating: {
      type: Number,
      default: 0
    },
    totalVotes: {
      type: Number,
      default: 0
    },
    compact: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    formattedRating () {
      if (this.averageRating === 0) {
        return '0.0'
      }
      return this.averageRating.toFixed(1)
    }
  }
}
</script>

<style scoped>
.rating-display {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rating-full {
  text-align: center;
}

.rating-stars {
  display: flex;
  justify-content: center;
}

.rating-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.rating-average {
  display: flex;
  align-items: baseline;
}

.rating-compact {
  display: flex;
  align-items: center;
  gap: 2px;
}

.compact {
  flex-direction: row;
  align-items: center;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .rating-display {
    padding: 8px;
  }

  .rating-info {
    gap: 2px;
  }
}
</style>

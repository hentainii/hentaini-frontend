<template>
  <div class="star-rating" :class="{ 'readonly': readonly }">
    <div
      v-for="star in 5"
      :key="star"
      class="star-container"
      @click="!readonly && selectStar(star)"
      @mouseover="!readonly && hoverStar(star)"
      @mouseleave="!readonly && resetHover()"
    >
      <v-icon
        :color="getStarColor(star)"
        :size="size"
        class="star-icon"
      >
        {{ getStarIcon(star) }}
      </v-icon>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StarRating',
  props: {
    value: {
      type: Number,
      default: 0
    },
    size: {
      type: [String, Number],
      default: 48
    },
    readonly: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: '#FFD700'
    },
    emptyColor: {
      type: String,
      default: '#E0E0E0'
    }
  },
  data () {
    return {
      hoverValue: 0
    }
  },
  computed: {
    displayValue () {
      return this.hoverValue || this.value
    }
  },
  methods: {
    selectStar (star) {
      this.$emit('input', star)
    },
    hoverStar (star) {
      this.hoverValue = star
    },
    resetHover () {
      this.hoverValue = 0
    },
    getStarIcon (star) {
      return star <= this.displayValue ? 'mdi-star' : 'mdi-star-outline'
    },
    getStarColor (star) {
      return star <= this.displayValue ? this.color : this.emptyColor
    }
  }
}
</script>

<style scoped>
.star-rating {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
}

.star-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.star-container:not(.readonly) {
  cursor: pointer;
}

.star-container:not(.readonly):hover {
  background-color: rgba(255, 215, 0, 0.1);
}

.star-icon {
  transition: all 0.2s ease;
  user-select: none;
}

.readonly .star-container {
  cursor: default;
}

.readonly .star-container:hover {
  background-color: transparent;
}

/* Mobile optimizations */
@media (max-width: 600px) {
  .star-rating {
    gap: 6px;
    padding: 12px;
  }

  .star-container {
    min-height: 40px;
    min-width: 40px;
  }
}
</style>

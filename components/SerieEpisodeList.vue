<template>
  <div class="flex flex-col gap-2">
    <NuxtLink
      v-for="(episode, idx) in episodes"
      :key="idx"
      :to="localePath(`/h/${serie.url}/${episode.episode_number}`)"
      class="flex items-center gap-3 p-3 rounded hover:bg-primary-900/30 border-b border-white/10 transition"
    >
      <Icon name="mdi:play" class="w-5 h-5 text-white" />
      <span class="text-white font-semibold">{{ serie.title }} episode {{ episode.episode_number }}</span>
    </NuxtLink>
  </div>
</template>

<script setup>
import { useLocalePath } from '#imports'
const props = defineProps({
  serie: { type: Object, required: true },
  episodes: { type: Array, required: true }
})
const localePath = useLocalePath()
</script>
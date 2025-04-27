<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-[#070d24]">
    <a href="/">
      <img src="/img/404.jpg" alt="404 Not Found" class="max-w-xs md:max-w-md rounded shadow-lg" />
    </a>
    <h1 class="mt-6 text-white text-xl font-bold">404 not Found, Son.</h1>
    <p v-if="error?.statusCode" class="text-gray-400 mt-2">Error {{ error.statusCode }}: {{ error.message }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  error: {
    type: Object,
    default: null
  }
})
</script> 
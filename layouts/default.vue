<template>
  <div class="min-h-screen flex flex-col bg-neutral-950">
    <main class="flex-1">
      <NuxtPage />
    </main>
    <LayoutFooter />
  </div>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 5px;
}
::-webkit-scrollbar-track {
  background-color: #222;
}
::-webkit-scrollbar-thumb {
  background: #6d6d6d;
}
::-webkit-scrollbar-thumb:hover {
  background: #dfca42;
}
</style>

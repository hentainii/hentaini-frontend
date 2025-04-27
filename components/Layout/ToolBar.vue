<template>
  <nav class="bg-neutral-900 text-white shadow flex items-center px-4 h-16 relative z-10">
    <button
      v-if="responsive"
      @click="nav = !nav"
      class="mr-4 p-2 rounded hover:bg-neutral-800 focus:outline-none"
      aria-label="Open menu"
    >
      <Icon name="mdi:view-list" size="24" />
    </button>
    <span class="font-light text-lg flex-1">
      {{ header }} <span v-if="serie">{{ serie }}</span>
    </span>
    <div class="flex items-center space-x-2">
      <NuxtLink to="/" class="p-2 rounded hover:bg-neutral-800">
        <Icon name="mdi:home" size="24" />
      </NuxtLink>
      <button class="p-2 rounded hover:bg-neutral-800" aria-label="Logout">
        <Icon name="mdi:power" size="24" />
      </button>
    </div>
  </nav>

  <!-- Drawer -->
  <aside
    v-if="nav"
    class="fixed top-0 left-0 h-full w-64 bg-neutral-950 shadow-lg z-20 flex flex-col"
  >
    <div class="p-4 border-b border-neutral-800">
      <div class="font-bold">{{ username }}</div>
      <div class="text-xs text-neutral-400">Back to home</div>
    </div>
    <nav class="flex-1 overflow-y-auto">
      <ul>
        <li v-for="link in navs" :key="link.id">
          <NuxtLink
            :to="link.url"
            class="flex items-center px-4 py-3 hover:bg-neutral-800 transition"
            @click="nav = false"
          >
            <Icon :name="link.icon" size="20" class="mr-3" />
            <span>{{ link.name }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>
  </aside>
  <!-- Overlay for drawer -->
  <div v-if="nav" class="fixed inset-0 bg-black bg-opacity-40 z-10" @click="nav = false"></div>
</template>

<script setup>
import { ref, computed } from 'vue'
const props = defineProps({
  header: { type: String, default: 'Hentaini Panel' },
  serie: { type: String, default: '' }
})

const nav = ref(false)
const responsive = ref(false) // Puedes implementar lógica de breakpoint si lo necesitas

const navs = [
  { id: 1, name: 'Panel Home', url: '/panel/', icon: 'mdi:home' },
  { id: 2, name: 'Create Serie', url: '/panel/serie/create', icon: 'mdi:plus-circle' },
  { id: 3, name: 'List Series', url: '/panel/serie', icon: 'mdi:format-list-bulleted-square' },
  { id: 4, name: 'Create Genre', url: '/panel/genre/create', icon: 'mdi:account-circle' },
  { id: 5, name: 'Create Player', url: '/panel/player/create', icon: 'mdi:play-circle' },
  { id: 6, name: 'Episode Reports', url: '/panel/reports', icon: 'mdi:flag' },
  { id: 7, name: 'Users', url: '/panel/user', icon: 'mdi:account' },
  { id: 8, name: 'Sitemap', url: '/panel/sitemap', icon: 'mdi:sitemap' }
]

const username = computed(() => 'Usuario')
</script>
<template>
  <header class="w-full bg-neutral-950 text-white shadow relative z-50">
    <div class="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
      <!-- Logo y menú móvil -->
      <div class="flex items-center">
        <button class="md:hidden mr-2" @click="nav = !nav" aria-label="Open menu">
          <Icon name="mdi:view-list" size="28" />
        </button>
        <NuxtLink :to="localePath('/')" class="flex items-center">
          <LayoutLogo class="h-8 w-auto" />
        </NuxtLink>
      </div>
      <!-- Menú desktop -->
      <ul class="hidden md:flex items-center space-x-2">
        <li>
          <NuxtLink :to="localePath('/explore')" class="flex items-center px-3 py-2 rounded hover:bg-neutral-800">
            <Icon name="mdi:book-outline" size="20" class="mr-2" />
            {{ t('menu.explore') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink :to="user ? localePath('/watchlater') : localePath('/login')" class="flex items-center px-3 py-2 rounded hover:bg-neutral-800">
            <Icon name="mdi:history" size="20" class="mr-2" />
            {{ t('watch_later.title') }}
          </NuxtLink>
        </li>
        <li>
          <NuxtLink :to="user ? localePath('/favorites') : localePath('/login')" class="flex items-center px-3 py-2 rounded hover:bg-neutral-800">
            <Icon name="mdi:heart" size="20" class="mr-2 text-red-400" />
            {{ t('favorites.title') }}
          </NuxtLink>
        </li>
        <li v-for="rs in rrss" :key="rs.name">
          <a :href="rs.url" target="_blank" class="flex items-center px-2 py-2 rounded hover:bg-neutral-800" :aria-label="rs.name">
            <Icon :name="`mdi:${rs.name.toLowerCase()}`" size="20" />
          </a>
        </li>
      </ul>
      <!-- Search y acciones -->
      <div class="hidden md:flex items-center space-x-2">
        <UtilsSearch />
        <!-- Idiomas -->
        <div class="relative group">
          <button class="p-2 rounded hover:bg-neutral-800" aria-label="Change language">
            <Icon name="mdi:translate" size="22" />
          </button>
          <div class="absolute right-0 mt-2 w-32 bg-neutral-900 rounded shadow-lg py-2 z-50 hidden group-hover:block">
            <NuxtLink v-for="lang in availableLocales" :key="lang.code" :to="switchLocalePath(lang.code)" class="block px-4 py-2 hover:bg-neutral-800">
              {{ lang.name }}
            </NuxtLink>
          </div>
        </div>
        <!-- Login/Profile -->
        <NuxtLink v-if="!user" to="/login" class="p-2 rounded hover:bg-neutral-800" aria-label="Login">
          <Icon name="mdi:account" size="22" />
        </NuxtLink>
        <div v-else class="flex items-center space-x-1">
          <NuxtLink :to="localePath('/favorites')" class="p-2 rounded hover:bg-neutral-800" aria-label="Profile">
            <Icon name="mdi:account" size="22" class="text-blue-400" />
          </NuxtLink>
          <NuxtLink v-if="user.level === 2" to="/panel" class="p-2 rounded hover:bg-neutral-800" aria-label="Admin panel">
            <Icon name="mdi:cog" size="22" />
          </NuxtLink>
          <button @click="logout" class="p-2 rounded hover:bg-neutral-800" aria-label="Logout">
            <Icon name="mdi:exit-to-app" size="22" />
          </button>
        </div>
      </div>
    </div>
    <!-- Drawer móvil -->
    <transition name="fade">
      <aside v-if="nav" class="fixed inset-0 z-40 bg-black bg-opacity-60 flex">
        <div class="w-64 bg-neutral-950 h-full flex flex-col p-4 relative">
          <button class="absolute top-2 right-2 p-2" @click="nav = false" aria-label="Close menu">
            <Icon name="mdi:close" size="24" />
          </button>
          <div class="flex flex-col items-center mb-4">
            <img src="/img/user_default.jpg" class="w-16 h-16 rounded-full mb-2" alt="User" />
            <div class="font-bold text-lg">{{ user ? user.username : t('menu.login_register_nav') }}</div>
          </div>
          <UtilsSearch class="mb-4" />
          <ul class="flex-1">
            <li v-for="link in navs" :key="link.id">
              <NuxtLink :to="link.url" class="flex items-center px-4 py-3 hover:bg-neutral-800 rounded transition" @click="nav = false">
                <Icon :name="link.icon" size="20" class="mr-3" />
                <span>{{ link.name }}</span>
              </NuxtLink>
            </li>
          </ul>
          <LayoutLogo class="mt-8 mx-auto" />
        </div>
        <div class="flex-1" @click="nav = false"></div>
      </aside>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocalePath, useSwitchLocalePath } from '#imports'

const { t, locale, availableLocales } = useI18n()
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const nav = ref(false)
// Simula usuario y rrss, reemplaza por store/composable real
const user = ref({ username: 'DemoUser', level: 2 })
const rrss = ref([
  { name: 'Twitter', url: 'https://twitter.com/' },
  { name: 'Discord', url: 'https://discord.com/' }
])
const navs = [
  { id: 1, name: t('menu.explore'), url: '/explore', icon: 'mdi:home' },
  { id: 2, name: t('favorites.title'), url: '/favorites', icon: 'mdi:heart' },
  { id: 3, name: t('watch_later.title'), url: '/watchlater', icon: 'mdi:history' }
]
function logout () {
  // Aquí deberías limpiar el auth real
  user.value = null
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<template>
  <div
      class="flex flex-col min-h-screen
           bg-gray-50 dark:bg-gray-900
           text-gray-800 dark:text-gray-200
           font-sans transition-colors"
  >

    <header class="bg-white dark:bg-gray-800 shadow-md">
      <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-primary">MiniGames Hub</h1>
        <nav class="flex items-center space-x-4">
          <router-link to="/" class="hover:text-primary transition">Головна</router-link>
          <router-link
              v-if="userStore.username"
              to="/history"
              class="hover:text-primary transition"
          >
            Історія
          </router-link>
          <router-link
              v-if="!userStore.username"
              to="/login"
              class="hover:text-primary transition"
          >
            Увійти
          </router-link>
          <router-link
              v-if="!userStore.username"
              to="/register"
              class="hover:text-primary transition"
          >
            Реєстрація
          </router-link>
          <button
              v-if="userStore.username"
              @click="logout"
              class="hover:text-red-500 transition font-medium"
          >
            Вийти
          </button>
          <button
              @click="toggleDark"
              class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              :aria-label="isDark ? 'Світла тема' : 'Темна тема'"
          >
            <span v-if="!isDark">🌙</span>
            <span v-else>☀️</span>
          </button>
        </nav>
      </div>
    </header>


    <main class="flex-grow container mx-auto px-6 py-8">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800">
      <div class="container mx-auto px-6 text-center py-4 text-sm">
        &copy; {{ new Date().getFullYear() }} MiniGames Hub. Всі права захищені.
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'

const isDark = ref(false)


onMounted(() => {
  isDark.value = document.documentElement.classList.contains('dark')
})


function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
}


const userStore = useUserStore()


function logout() {
  userStore.logoutUser()
}
</script>

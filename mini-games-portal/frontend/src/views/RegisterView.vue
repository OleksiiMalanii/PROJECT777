<template>
  <div
      class="flex items-center justify-center min-h-screen
           bg-gradient-to-br from-primary-light to-primary-dark
           dark:from-gray-800 dark:to-gray-900
           px-4
           rounded-3xl"
  >
    <div
        class="w-full max-w-md
             bg-white dark:bg-gray-800
             p-8
             rounded-3xl
             shadow-lg
             transition-colors"
    >
      <h2
          class="text-2xl font-bold text-gray-800 dark:text-gray-100 text-center mb-6"
      >
        Реєстрація
      </h2>
      <form @submit.prevent="onRegister" class="space-y-4">
        <div>
          <label
              class="block mb-1 text-gray-700 dark:text-gray-300"
              for="email"
          >
            Email
          </label>
          <input
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full px-4 py-2
                   rounded-xl
                   border border-gray-300 dark:border-gray-600
                   bg-gray-50 dark:bg-gray-700
                   text-gray-900 dark:text-gray-100
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label
              class="block mb-1 text-gray-700 dark:text-gray-300"
              for="password"
          >
            Пароль
          </label>
          <input
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2
                   rounded-xl
                   border border-gray-300 dark:border-gray-600
                   bg-gray-50 dark:bg-gray-700
                   text-gray-900 dark:text-gray-100
                   placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
            type="submit"
            class="w-full py-2
                 bg-primary text-white
                 rounded-2xl
                 hover:bg-primary-dark transition"
        >
          Зареєструватися
        </button>
      </form>
      <p class="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Вже є акаунт?
        <router-link
            to="/login"
            class="text-primary hover:underline dark:text-primary-light"
        >
          Увійти
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'

const email = ref('')
const password = ref('')
const router = useRouter()

async function onRegister() {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    router.push('/login')
  } catch (err) {
    alert('Не вдалося зареєструватися: ' + err.message)
  }
}
</script>

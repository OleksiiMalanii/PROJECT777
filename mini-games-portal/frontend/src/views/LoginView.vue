<template>
  <div
      class="flex items-center justify-center min-h-screen
           bg-green-600
           dark:bg-gray-800
           px-4
           rounded-3xl"
  >
    <div
        class="w-full max-w-md
             bg-green-400 dark:bg-gray-900
             p-8
             rounded-3xl
             shadow-lg
             transition-colors"
    >
      <LoginForm @login="onLogin" />
      <p class="mt-4 text-center text-sm text-green-600 dark:text-gray-400">
        Ще немає акаунту?
        <router-link
            to="/register"
            class="text-green-900 hover:underline dark:text-primary-light"
        >
          Зареєструватися
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'
import LoginForm from '@/components/LoginForm.vue'

const router = useRouter()
const userStore = useUserStore()

async function onLogin({ email, password }) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password)
    userStore.loginUser(user.email)
    router.push('/')
  } catch (err) {
    alert('Помилка входу: ' + err.message)
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background dark:bg-gray-900 px-4">
    <div class="w-full max-w-md bg-primary-light dark:bg-gray-800 p-8 rounded-3xl shadow-lg">
      <h2 class="text-2xl font-bold text-primary-dark text-center mb-6">Реєстрація</h2>
      <form @submit.prevent="onRegister" class="space-y-6">
        <div>
          <label class="block mb-1 text-primary-dark" for="email">Email</label>
          <input id="email" v-model="email" type="email" required placeholder="you@example.com"
                 class="
              w-full px-4 py-2 rounded-xl border border-primary-dark bg-background text-primary-dark placeholder-primary-dark
              focus:outline-none focus:ring-2 focus:ring-primary-light
            "
          />
        </div>
        <div>
          <label class="block mb-1 text-primary-dark" for="password">Пароль</label>
          <input id="password" v-model="password" type="password" required placeholder="••••••••"
                 class="
              w-full px-4 py-2 rounded-xl border border-primary-dark bg-background text-primary-dark placeholder-primary-dark
              focus:outline-none focus:ring-2 focus:ring-primary-light
            "
          />
        </div>

        <button type="submit"
                class="w-full py-3 bg-primary-dark text-white font-semibold rounded-2xl shadow-lg hover:bg-primary focus:ring-4 focus:ring-primary-light transition"
        >Зареєструватися</button>
      </form>

      <p class="mt-4 text-center text-sm text-primary-dark">
        Вже є акаунт?
        <router-link to="/login" class="font-medium text-primary-dark hover:underline">Увійти</router-link>
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
    await createUserWithEmailAndPassword(auth,email.value,password.value)
    router.push('/login')
  } catch(e) { alert('Помилка: '+e.message) }
}
</script>
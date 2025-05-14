<template>
  <form
      @submit.prevent="submit"
      class="space-y-4"
  >
    <h2
        class="text-2xl font-bold text-green-900 dark:text-gray-100 text-center"
    >
      Увійти
    </h2>

    <div>
      <label
          class="block mb-1 text-green-900 dark:text-gray-300"
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
               border border-green-600 dark:border-gray-600
               bg-green-400 dark:bg-gray-700
               text-gray-900 dark:text-gray-100
               placeholder-green-900 dark:placeholder-gray-400
               focus:outline-none focus:ring-2 focus:ring-green-600 focus:dark:ring-gray-500"
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
               border border-green-600 dark:border-gray-600
               bg-green-400 dark:bg-gray-700
               text-gray-900 dark:text-gray-100
               placeholder-green-900 dark:placeholder-gray-400
               focus:outline-none focus:ring-2 focus:ring-green-600 focus:dark:ring-gray-500"
      />
    </div>

    <button
        type="submit"
        class="w-full py-2
             bg-green-600 dark:bg-primary
             text-green-400 dark:text-white
             rounded-2xl
             hover:bg-green-800
             hover:dark:bg-primary-dark transition"
    >
      Увійти
    </button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
const email = ref('')
const password = ref('')
const emit = defineEmits(['login'])

function submit() {
  emit('login', { email: email.value, password: password.value })
}
</script>

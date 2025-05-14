<template>
  <form @submit.prevent="submit" class="space-y-6">
    <h2 class="text-2xl font-bold text-primary-dark text-center">Увійти</h2>
    <div>
      <label class="block mb-1 text-primary-dark" for="email">Email</label>
      <input id="email" v-model="email" type="email" required placeholder="you@example.com"
             class="
          w-full px-4 py-2 rounded-xl border border-primary-dark
          bg-background text-primary-dark placeholder-primary-dark
          focus:outline-none focus:ring-2 focus:ring-primary-light
        "
      />
    </div>
    <div>
      <label class="block mb-1 text-primary-dark" for="password">Пароль</label>
      <input id="password" v-model="password" type="password" required placeholder="••••••••"
             class="
          w-full px-4 py-2 rounded-xl border border-primary-dark
          bg-background text-primary-dark placeholder-primary-dark
          focus:outline-none focus:ring-2 focus:ring-primary-light
        "
      />
    </div>
    <button type="submit"
            class="w-full py-3 bg-primary-dark text-white font-semibold rounded-2xl shadow-lg hover:bg-primary focus:ring-4 focus:ring-primary-light transition"
    >Увійти</button>
  </form>
</template>

<script setup>
import { ref } from 'vue'
const email = ref('')
const password = ref('')
const emit = defineEmits(['login'])
function submit() { emit('login',{email:email.value,password:password.value}) }
</script>
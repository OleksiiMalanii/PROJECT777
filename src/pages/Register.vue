<template>
  <section class="flex h-screen bg-gradient-to-t from-gray-900 to-indigo-950 text-white font-sci-fi">
    <!-- Decorations -->
    <img
        src="/src/assets/General/Scifi1.png"
        alt="Scifi Decoration 1"
        draggable="false"
        class="absolute top-40 left-30 w-80 z-5 unselectable"
    />
    <img
        src="/src/assets/General/Scifi1.png"
        alt="Scifi Decoration 1"
        draggable="false"
        class="absolute bottom-30 left-110 w-80 z-5 unselectable scale-x-[1]"
    />
    <img
        src="/src/assets/General/Scifi3.png"
        alt="Scifi Decoration 3"
        draggable="false"
        class="absolute bottom-10 left-120 w-80 z-5 unselectable scale-x-[-1]"
    />

    <!-- Soldier Image -->
    <div class="hidden md:flex w-2/3 items-end justify-center">
      <img src="/src/assets/Soldier.png" alt="Soldier" draggable="false" class="h-[90vh] object-contain z-10 unselectable" />
    </div>

    <!-- Register Form -->
    <div class="flex flex-col justify-center items-start px-10 md:px-20 w-full md:w-1/2">
      <h2 class="text-4xl font-bold mb-8">Register</h2>
      <form class="w-full max-w-sm space-y-6" @submit.prevent="submit">
        <input
            v-model="username"
            type="text"
            placeholder="Username"
            required
            class="w-full p-3 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-orange-500 unselectable"
        />
        <input
            v-model="email"
            type="email"
            placeholder="Email"
            required
            class="w-full p-3 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-orange-500 unselectable"
        />
        <div class="relative">
          <input
              :type="showPassword ? 'text' : 'password'"
              v-model="password"
              placeholder="Password"
              required
              class="w-full p-3 pr-12 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-orange-500 unselectable"
          />
          <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-orange-500 focus:outline-none"
          >
          <span class="material-symbols-outlined text-xl">
            {{ showPassword ? 'visibility' : 'visibility_off' }}
          </span>
          </button>
        </div>
        <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            required
            class="w-full p-3 bg-gray-800 text-white rounded-lg outline-none focus:ring-2 focus:ring-orange-500 unselectable"
        />
        <button
            type="submit"
            class="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full transition unselectable"
        >
          Sign Up
        </button>
        <p v-if="error" class="text-red-400 text-sm mt-2">{{ error }}</p>
      </form>
      <p class="mt-4 text-sm">
        Already have an account?
        <router-link to="/login" class="text-orange-500 hover:underline">Log in</router-link>
      </p>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '/src/composables/useAuth';

const { register } = useAuth();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');

const showPassword = ref(false);
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const submit = async () => {
  error.value = '';
  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    return;
  }

  try {
    await register(email.value, password.value, username.value);
    await router.push('/');
  } catch (e) {
    error.value = e.message || 'Registration failed.';
  }
};
</script>

<style scoped>
.unselectable {
  user-select: none;
  -webkit-user-drag: none;
}
.material-symbols-outlined {
  font-variation-settings:
      'FILL' 1,
      'wght' 700,
      'GRAD' 200,
      'opsz' 48;
}
</style>

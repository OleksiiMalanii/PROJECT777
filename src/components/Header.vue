<template>
  <header class="fixed top-5 left-8 right-5 z-50 flex justify-between items-center px-5 py-4 text-white font-sci-fi">
    <h1 class="text-3xl font-bold tracking-wide">Tap&Play</h1>

    <!-- Profile Dropdown or Sign In -->
    <div v-if="user" class="relative" v-click-outside="handleClickOutside">
      <button
          @click="toggleDropdown"
          class="text-white hover:text-orange-500 transition unselectable"
      >
        <span class="material-symbols-outlined" style="font-size: 40px !important">settings</span>
      </button>

      <!-- Dropdown -->
      <div
          v-if="showDropdown"
          class="absolute right-0 mt-2 w-44 bg-gray-800 rounded-lg shadow-lg py-2 z-50"
      >
        <router-link
            to="/profile"
            class="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition unselectable"
            @click="showDropdown = false"
        >
          <span class="material-symbols-outlined">person</span>
          Profile
        </router-link>
        <router-link
            to="/badges"
            class="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition unselectable"
            @click="showDropdown = false"
        >
          <span class="material-symbols-outlined">star</span>
          Badges
        </router-link>
        <router-link
            to="/records"
            class="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition unselectable"
            @click="showDropdown = false"
        >
          <span class="material-symbols-outlined">trophy</span>
          Records
        </router-link>
        <button
            @click="logout"
            class="flex items-center gap-2 w-full text-left px-4 py-2 text-red-500 hover:bg-red-800 hover:text-white transition unselectable"
        >
          <span class="material-symbols-outlined">logout</span>
          Log out
        </button>
      </div>
    </div>

    <!-- When user is not logged in -->
    <router-link
        v-else
        to="/login"
        class="text-white hover:text-orange-500 transition unselectable"
    >
      <span class="material-symbols-outlined" style="font-size: 40px !important">login</span>
    </router-link>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '/src/firebase';
import { useRouter } from 'vue-router';

const user = ref(null);
const showDropdown = ref(false);
const router = useRouter();

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser;
  });
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const logout = async () => {
  await signOut(auth);
  showDropdown.value = false;
  router.push('/');
};

const handleClickOutside = () => {
  showDropdown.value = false;
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,700,1,200');

.font-sci-fi {
  font-family: 'Orbitron', sans-serif;
}
.unselectable {
  user-select: none;
}
.material-symbols-outlined {
  font-variation-settings:
      'FILL' 1,
      'wght' 700,
      'GRAD' 200,
      'opsz' 48;
  line-height: 1;
}
</style>

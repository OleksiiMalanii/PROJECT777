<template>
  <section class="flex h-screen bg-gradient-to-t from-gray-900 to-indigo-950 text-white font-sci-fi">
    <!-- Decorative Images -->
    <img src="/src/assets/General/Scifi1.png" alt="" class="absolute top-40 left-30 w-80 z-5 unselectable" draggable="false" />
    <img src="/src/assets/General/Scifi1.png" alt="" class="absolute bottom-30 left-110 w-80 z-5 unselectable scale-x-[1]" draggable="false" />
    <img src="/src/assets/General/Scifi3.png" alt="" class="absolute bottom-10 left-120 w-80 z-5 unselectable scale-x-[-1]" draggable="false" />

    <!-- Soldier Image -->
    <div class="hidden md:flex w-2/3 items-end justify-center">
      <img src="/src/assets/Soldier.png" alt="Soldier" draggable="false" class="h-[90vh] object-contain z-10 unselectable" />
    </div>

    <!-- Profile Content -->
    <div class="flex flex-col justify-center items-start px-10 md:px-20 w-full md:w-1/2">
      <h2 class="text-4xl font-bold mb-6">My Profile</h2>

      <!-- Username -->
      <div class="text-xl mb-6">
        <span class="font-semibold">Username:</span>
        <span class="ml-2">{{ username }}</span>
      </div>

      <!-- Badges -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Badges</h3>
        <div class="flex gap-4 mb-6">
          <div v-for="(badge, index) in displayedBadges" :key="index" class="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-lg text-3xl">
            <template v-if="badge">
              <img :src="badge" alt="Badge" class="w-12 h-12 object-contain" />
            </template>
            <template v-else>
              <span class="material-symbols-outlined text-gray-400">add</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Edit Button -->
      <button
          @click="editProfile"
          class="bg-orange-500 hover:bg-orange-600 text-white py-2 px-6 rounded-full transition unselectable"
      >
        Edit Profile
      </button>
    </div>
    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black opacity-90 flex z-50">
    </div>
    <div v-if="showModal" class="fixed inset-0  flex items-center justify-center z-50">
      <div class="bg-gray-900 rounded-xl p-6 w-96">
        <h3 class="text-xl font-bold mb-4">Edit Username</h3>
        <input
            v-model="newUsername"
            type="text"
            class="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4 unselectable"
            placeholder="Enter new username"
        />
        <div class="flex justify-end gap-2">
          <button @click="showModal = false" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded unselectable">Cancel</button>
          <button @click="saveUsername" class="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded unselectable">Save</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { onAuthStateChanged, updateProfile } from 'firebase/auth';
import { auth } from '/src/firebase';

const username = ref('Loading...');
const newUsername = ref('');
const showModal = ref(false);
const badges = ref([null, null, null]);

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      username.value = user.displayName || 'Unnamed Soldier';
    }
  });
});

const displayedBadges = computed(() => {
  return [...badges.value, ...Array(3 - badges.value.length).fill(null)].slice(0, 3);
});

const editProfile = () => {
  newUsername.value = username.value;
  showModal.value = true;
};

const saveUsername = async () => {
  const user = auth.currentUser;
  if (user && newUsername.value.trim() !== '') {
    await updateProfile(user, {
      displayName: newUsername.value.trim(),
    });
    username.value = newUsername.value.trim();
    showModal.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,700,1,200');

.unselectable {
  user-select: none;
}
</style>

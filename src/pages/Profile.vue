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
        <h3 class="text-lg font-semibold mb-2">Latest Badges</h3>
        <div v-if="loadingBadges" class="text-gray-400 mb-6">Loading badges...</div>
        <div v-else class="flex gap-4 mb-6">
          <div v-for="(badge, index) in displayedBadges" :key="index" class="w-16 h-16 flex items-center justify-center bg-gray-800 rounded-lg">
            <template v-if="badge">
              <img
                  :src="badge.iconUrl"
                  :alt="badge.name"
                  :title="badge.name + ' - ' + badge.description"
                  class="w-12 h-12 object-contain"
                  @error="handleImageError"
              />
            </template>
            <template v-else>
              <span class="material-symbols-outlined text-gray-400">add</span>
            </template>
          </div>
        </div>
        <p class="text-sm text-gray-400 mb-6">
          Total badges: {{ totalBadges }} |
          <router-link to="/badges" class="text-orange-400 hover:text-orange-300 underline">View all badges</router-link>
        </p>
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
import { auth, db } from '/src/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

const username = ref('Loading...');
const newUsername = ref('');
const showModal = ref(false);
const allBadges = ref([]);
const loadingBadges = ref(true);

const totalBadges = computed(() => {
  return allBadges.value.length;
});

const displayedBadges = computed(() => {
  // Показуємо останні 3 отримані бейджі
  const latest = allBadges.value.slice(-3).reverse();
  return [...latest, ...Array(3 - latest.length).fill(null)].slice(0, 3);
});

const fetchUserBadges = async (uid) => {
  try {
    loadingBadges.value = true;
    const userBadgeSnap = await getDocs(collection(db, 'users', uid, 'badges'));
    const badges = [];

    for (const docSnap of userBadgeSnap.docs) {
      const gameId = docSnap.id;
      const badgeData = docSnap.data();

      if (badgeData.badgeIds?.length) {
        try {
          const gameBadgeSnap = await getDocs(collection(db, 'badges', gameId, 'badgeList'));
          const availableBadges = {};

          for (const badge of gameBadgeSnap.docs) {
            availableBadges[badge.id] = {
              ...badge.data(),
              id: badge.id
            };
          }

          const gameBadges = badgeData.badgeIds
              .filter(badgeId => availableBadges[badgeId])
              .map((badgeId) => ({
                id: badgeId,
                name: availableBadges[badgeId]?.name || 'Unknown Badge',
                description: availableBadges[badgeId]?.description || 'No description available',
                iconUrl: availableBadges[badgeId]?.iconUrl || '/src/assets/Games/Badge.png',
                gameId: gameId
              }));

          badges.push(...gameBadges);
        } catch (error) {
          console.error(`Error fetching badges for game ${gameId}:`, error);
        }
      }
    }

    allBadges.value = badges;
  } catch (error) {
    console.error('Error fetching user badges:', error);
  } finally {
    loadingBadges.value = false;
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      username.value = user.displayName || 'Unnamed Soldier';
      fetchUserBadges(user.uid);
    } else {
      loadingBadges.value = false;
    }
  });
});

const editProfile = () => {
  newUsername.value = username.value;
  showModal.value = true;
};

const saveUsername = async () => {
  const user = auth.currentUser;
  if (user && newUsername.value.trim() !== '') {
    try {
      await updateProfile(user, {
        displayName: newUsername.value.trim(),
      });
      username.value = newUsername.value.trim();
      showModal.value = false;
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  }
};

const handleImageError = (event) => {
  event.target.src = '/src/assets/Games/Badge.png';
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Orbitron&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,700,1,200');

.unselectable {
  user-select: none;
}
</style>
<template>
  <section class="pt-28 pb-20 pl-20 pr-6 md:pl-32 md:pr-12 text-white min-h-screen font-sci-fi">
    <h1 class="text-4xl font-bold text-center mb-4">BADGES</h1>
    <div class="h-1 w-37 bg-white mx-auto mb-10 rounded-full"></div>

    <div v-if="loading" class="text-gray-300 text-2xl text-center">Loading badges...</div>
    <div v-else-if="Object.keys(userBadges).length === 0" class="text-gray-400 text-xl text-center">
      No badges earned yet. Start playing games to collect badges!
    </div>
    <div v-else>
      <div v-for="(gameBadges, gameId) in userBadges" :key="gameId" class="mb-8">
        <h2 class="text-2xl mb-4 capitalize">{{ gameId }} ({{ gameBadges.length }})</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div
              v-for="badge in gameBadges"
              :key="badge.id"
              class="bg-gray-800 rounded-xl flex flex-col items-center justify-center p-4 hover:bg-gray-700 transition-colors cursor-pointer"
              :title="badge.description"
          >
            <img
                :src="badge.iconUrl"
                :alt="badge.name"
                class="w-16 h-16 object-contain mb-2 unselectable"
                draggable="false"
                @error="handleImageError"
            />
            <p class="text-sm text-center">{{ badge.name }}</p>
            <p class="text-xs text-gray-400 text-center mt-1">{{ badge.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Debug info (remove in production) -->
    <div v-if="debugMode" class="mt-8 p-4 bg-gray-800 rounded">
      <h3 class="text-lg mb-2">Debug Info:</h3>
      <pre class="text-xs">{{ JSON.stringify(userBadges, null, 2) }}</pre>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { auth, db } from '/src/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

const userBadges = ref({});
const loading = ref(true);
const debugMode = ref(false); // Set to true for debugging

const fetchBadges = async (uid) => {
  try {
    console.log('Fetching badges for user:', uid);

    const userBadgeSnap = await getDocs(collection(db, 'users', uid, 'badges'));
    console.log('User badge documents found:', userBadgeSnap.size);

    const badgesByGame = {};

    for (const docSnap of userBadgeSnap.docs) {
      const gameId = docSnap.id;
      const badgeData = docSnap.data();

      console.log(`Processing game ${gameId}:`, badgeData);

      if (badgeData.badgeIds?.length) {
        try {
          console.log(`Fetching badge definitions for game: ${gameId}`);
          const gameBadgeSnap = await getDocs(collection(db, 'badges', gameId, 'badgeList'));
          console.log(`Found ${gameBadgeSnap.size} badge definitions for ${gameId}`);

          const availableBadges = {};

          for (const badge of gameBadgeSnap.docs) {
            availableBadges[badge.id] = {
              ...badge.data(),
              id: badge.id
            };
            console.log(`Loaded badge definition:`, badge.id, badge.data());
          }

          const userGameBadges = badgeData.badgeIds
              .filter(badgeId => {
                const exists = availableBadges[badgeId];
                if (!exists) {
                  console.warn(`Badge ${badgeId} not found in available badges for ${gameId}`);
                }
                return exists;
              })
              .map((badgeId) => ({
                id: badgeId,
                name: availableBadges[badgeId]?.name || 'Unknown Badge',
                description: availableBadges[badgeId]?.description || 'No description available',
                iconUrl: availableBadges[badgeId]?.iconUrl || '/src/assets/Games/Badge.png',
              }));

          if (userGameBadges.length > 0) {
            badgesByGame[gameId] = userGameBadges;
            console.log(`Added ${userGameBadges.length} badges for ${gameId}`);
          }
        } catch (error) {
          console.error(`Error fetching badges for game ${gameId}:`, error);
        }
      } else {
        console.log(`No badges found for game ${gameId}`);
      }
    }

    console.log('Final badges object:', badgesByGame);
    userBadges.value = badgesByGame;
  } catch (error) {
    console.error('Error fetching user badges:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log('User authenticated:', user.uid);
      fetchBadges(user.uid);
    } else {
      console.log('No user authenticated');
      loading.value = false;
    }
  });
});

const handleImageError = (event) => {
  console.warn('Image failed to load:', event.target.src);
  event.target.src = '/src/assets/Games/Badge.png';
};
</script>

<style scoped>
.unselectable {
  user-select: none;
}
</style>
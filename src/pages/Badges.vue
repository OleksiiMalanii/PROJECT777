<template>
  <section class="pt-28 pb-20 pl-20 pr-6 md:pl-32 md:pr-12 text-white min-h-screen font-sci-fi">
  <h1 class="text-4xl font-bold mb-6">My Badges</h1>

    <div v-if="loading" class="text-gray-300">Loading badges...</div>
    <div v-else>
      <div v-for="(gameBadges, gameId) in userBadges" :key="gameId" class="mb-8">
        <h2 class="text-2xl font-semibold mb-4 capitalize">{{ gameId }}</h2>
        <div class="flex gap-4 flex-wrap">
          <div
              v-for="badge in gameBadges"
              :key="badge.id"
              class="w-25 h-35 bg-gray-800 rounded-xl flex flex-col items-center justify-center p-2"
          >
            <img :src="badge.iconUrl" alt="badge" class="w-15 h-15 object-contain mb-1 unselectable" draggable="false"/>
            <p class="text-l text-center">{{ badge.name }}</p>
          </div>
        </div>
      </div>
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

const fetchBadges = async (uid) => {
  const userBadgeSnap = await getDocs(collection(db, 'users', uid, 'badges'));
  const badgesByGame = {};

  for (const docSnap of userBadgeSnap.docs) {
    const gameId = docSnap.id;
    const badgeData = docSnap.data(); // expected to have badgeIds: [ 'badge1', 'badge2' ]

    if (badgeData.badgeIds?.length) {
      const gameBadgeSnap = await getDocs(collection(db, 'badges', gameId, 'badgeList'));
      const availableBadges = {};

      for (const badge of gameBadgeSnap.docs) {
        availableBadges[badge.id] = badge.data();
      }

      badgesByGame[gameId] = badgeData.badgeIds.map((badgeId) => ({
        id: badgeId,
        name: availableBadges[badgeId]?.name || 'Unknown',
        iconUrl: availableBadges[badgeId]?.iconUrl || 'src/assets/Games/placeholder.png',
      }));
    }
  }

  userBadges.value = badgesByGame;
  loading.value = false;
};

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      fetchBadges(user.uid);
    } else {
      loading.value = false;
    }
  });
});
</script>

<style scoped>
.font-sci-fi {
  font-family: 'Orbitron', sans-serif;
}
.unselectable {
  user-select: none;
}
</style>

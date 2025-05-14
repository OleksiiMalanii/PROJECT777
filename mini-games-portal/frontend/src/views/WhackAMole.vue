<template>
  <div class="text-center">
    <h1 class="text-3xl font-bold mb-1 mt-2">Whack A Mole</h1>
    <p class="text-lg mb-4">Score: {{ score }}</p>

    <div class="grid grid-cols-5 gap-2 max-w-lg mx-auto">
      <div
          v-for="(tile, index) in tiles"
          :key="index"
          class="w-16 h-16 bg-green-600 dark:bg-gray-500 rounded-md flex items-center justify-center text-2xl cursor-pointer hover:bg-green-700 hover:dark:bg-gray-400"
          @click="handleClick(index)"
      >
        <span v-if="tile === 'mole'">🐹</span>
        <span v-else-if="tile === 'bomb'">💣</span>
      </div>
    </div>
  </div>
  <div class="text-center mt-10">
    <button
        @click="endGame"
        class="px-6 py-2 bg-green-600 dark:bg-primary text-green-200 dark:text-white rounded-2xl hover:bg-green-800 hover:dark:bg-primary-dark transition"
    >
      Завершити гру та зберегти
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const tiles = ref(Array(25).fill(null))
const score = ref(0)

const MAX_ENTITIES = 5 // max total moles + bombs

let gameInterval = null

function spawnRandom() {
  // Reset all tiles
  tiles.value = Array(25).fill(null)

  const totalEntities = Math.floor(Math.random() * MAX_ENTITIES) + 1
  const availableIndices = Array.from({ length: 25 }, (_, i) => i)

  for (let i = 0; i < totalEntities; i++) {
    if (availableIndices.length === 0) break

    const randIndex = Math.floor(Math.random() * availableIndices.length)
    const tileIndex = availableIndices.splice(randIndex, 1)[0]

    const chance = Math.random()
    tiles.value[tileIndex] = chance < 0.7 ? 'mole' : 'bomb'
  }
}

function handleClick(index) {
  const type = tiles.value[index]

  if (type === 'mole') {
    score.value += 15
  } else if (type === 'bomb') {
    score.value = Math.max(0, score.value - 40)
  } else {
    score.value = Math.max(0, score.value - 5)
  }

  tiles.value[index] = null
}

onMounted(() => {
  spawnRandom()
  gameInterval = setInterval(spawnRandom, 1000)
})

onUnmounted(() => {
  clearInterval(gameInterval)
})

function endGame(){userStore.addGameToHistory('Candy Crush',score.value);router.push('/')}
</script>

<template>
  <div>
    <h2 class="text-2xl font-semibold mb-6">Оберіть гру</h2>

    <!-- Search bar -->
    <div class="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <input
          v-model="searchTerm"
          type="text"
          placeholder="Пошук за назвою..."
          class="p-2 rounded-md border bg-green-300 dark:bg-gray-300 dark:text-black w-full md:w-1/3"
      />

      <!-- Tag filter -->
      <div class="flex flex-wrap gap-2">
        <button
            v-for="tag in availableTags"
            :key="tag"
            @click="selectedTag = selectedTag === tag ? null : tag"
            :class="[
            'px-3 py-1 rounded-full text-sm font-medium border border-green-700 dark:border-gray-600',
            selectedTag === tag ? 'bg-green-700 dark:bg-gray-950 text-white' : 'bg-green-300 dark:bg-gray-700  text-green-900 dark:text-white'
          ]"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Our best games -->
    <h3 class="text-xl font-semibold mt-8 mb-4">Наші найкращі ігри</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <GameCard
          v-for="game in filteredBestGames"
          :key="game.name"
          :game="game"
          @play="startGame"
      />
    </div>

    <!-- Other games -->
    <h3 class="text-xl font-semibold mt-10 mb-4">Інші ігри</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <GameCard
          v-for="game in filteredOtherGames"
          :key="game.name"
          :game="game"
          @play="startGame"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import GameCard from '@/components/GameCard.vue'

const router = useRouter()
const userStore = useUserStore()

const searchTerm = ref('')
const selectedTag = ref(null)

const availableTags = ["Reaction", "Memory", "Logic", "Fun"]

const games = ref([
  { name: 'WhackAMole', title: 'Whack A Mole', img: '/src/assets/whatamole.png', tags: "Reaction, Fun", best: false },
  { name: 'Minesweeper', title: 'Minesweeper', img: '/src/assets/minesweeper.webp', tags: "Logic", best: true },
  { name: 'PatternRepeat', title: 'Repeat The Pattern', img: '/src/assets/da.webp', tags: "Memory", best: false },
  { name: 'CandyCrush', title: 'Candy Crush', img: '/src/assets/candycrush.png', tags: "Fun", best: true }
])

const filteredGames = computed(() => {
  return games.value.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.value.toLowerCase())
    const matchesTag = selectedTag.value ? game.tags.includes(selectedTag.value) : true
    return matchesSearch && matchesTag
  })
})

const filteredBestGames = computed(() =>
    filteredGames.value.filter(game => game.best)
)
const filteredOtherGames = computed(() =>
    filteredGames.value.filter(game => !game.best)
)

function startGame(game) {
  userStore.addGameToHistory(game.title)
  if (game.name === 'CandyCrush') {
    router.push({ name: 'candycrush' })
  } else if (game.name === 'Minesweeper') {
    router.push({ name: 'minesweeper' })
  } else if (game.name === 'WhackAMole') {
    router.push({ name: 'whackamole' })
  } else if (game.name === 'PatternRepeat') {
    router.push({ name: 'patternrepeat' })
  } else {
    router.push({ name: 'game', params: { name: game.name } })
  }
}
</script>

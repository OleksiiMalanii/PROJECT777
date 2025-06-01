<template>
  <section class="pt-28 pb-20 pl-20 pr-6 md:pl-32 md:pr-12 text-white font-sci-fi">
    <h1 class="text-4xl font-bold text-center mb-4">GAMES</h1>
    <div class="h-1 w-33 bg-white mx-auto mb-10 rounded-full"></div>
    <!-- Search & Filter -->
    <div class="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
      <input
          v-model="searchQuery"
          type="text"
          placeholder="Search games..."
          class="w-full md:w-1/2 p-3 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 unselectable"
      />
      <select
          v-model="selectedCategory"
          class="w-full md:w-1/4 p-3 bg-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-orange-500 unselectable"
      >
        <option value="All">All Categories</option>
        <option value="Logic">Logic</option>
        <option value="Reaction">Reaction</option>
        <option value="Fun">Fun</option>
      </select>
    </div>

    <!-- Best Games -->
    <div v-if="bestGames.length" class="mb-12">
      <h2 class="text-2xl md:text-3xl font-bold mb-6 text-orange-500">Best Games</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <GameCard
            v-for="game in bestGames"
            :key="game.title"
            :game="game"
        />
      </div>
    </div>

    <!-- Full Catalog -->
    <div v-if="regularGames.length">
      <h2 class="text-2xl md:text-3xl font-bold mb-6 text-orange-500">Full Catalog</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        <GameCard
            v-for="game in regularGames"
            :key="game.title"
            :game="game"
        />
      </div>
    </div>

    <!-- No Results -->
    <div v-if="filteredGames.length === 0" class="text-center text-gray-400 mt-20 text-lg">
      No games found.
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import GameCard from '/src/components/GameCard.vue'

const searchQuery = ref('')
const selectedCategory = ref('All')

const games = [
  {
    title: 'Minesweeper',
    img: '/src/assets/Games/Minesweeper.png',
    tags: ['Logic'],
    route: '/games/minesweeper',
    best: true,
  },
  {
    title: 'Tetris',
    img: '/src/assets/Games/Tetris.png',
    tags: ['Reaction', 'Logic'],
    route: '/games/tetris',
  },
  {
    title: 'Snake',
    img: '/src/assets/Games/SnakeGame.png',
    tags: ['Reaction', 'Fun'],
    route: '/games/snake',
    best: true,
  },
  {
    title: 'Candy Crush',
    img: '/src/assets/Games/candycr/CandyCrush.png',
    tags: ['Fun'],
    route: '/games/candycrush',
  },
  {
    title: 'Space Shooter',
    img: '/src/assets/Games/SpaceShooter.png',
    tags: ['Reaction', 'Fun'],
    route: '/games/spaceshooter',
    best: true,
  },
]

const filteredGames = computed(() => {
  return games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesCategory = selectedCategory.value === 'All' || game.tags.includes(selectedCategory.value)
    return matchesSearch && matchesCategory
  })
})

const bestGames = computed(() => filteredGames.value.filter(game => game.best))
const regularGames = computed(() => filteredGames.value.filter(game => !game.best))
</script>

<style scoped>
.unselectable {
  user-select: none;
}
</style>

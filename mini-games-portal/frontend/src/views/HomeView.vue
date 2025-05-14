<template>
  <div>
    <h2 class="text-2xl font-semibold mb-6">Оберіть гру</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <GameCard
          v-for="game in games"
          :key="game.name"
          :game="game"
          @play="startGame"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import GameCard from '@/components/GameCard.vue'

const router = useRouter()
const userStore = useUserStore()

const games = ref([
  { name: 'TicTacToe', title: 'Хрестики/Нулики', img: '/src/assets/img/xo.png' },
  { name: 'Minesweeper', title: 'Minesweeper', img: '/src/assets/minesweeper.webp' },
  { name: 'CandyCrush', title: 'Candy Crush', img: '/src/assets/candycrush.png' },
  { name: 'SnakeGame', title: 'Snake Game', img: '/src/assets/snakegame2.png' },
])

function startGame(game) {
  userStore.addGameToHistory(game.title)
  if (game.name === 'CandyCrush') {
    router.push({ name: 'candycrush' })
  }
  else if (game.name === 'Minesweeper') {
    router.push({ name: 'minesweeper' })
  }
  else if (game.name === 'SnakeGame') {
    router.push({ name: 'snakegame' })
  }
  else {
    router.push({ name: 'game', params: { name: game.name } })
  }
}
</script>
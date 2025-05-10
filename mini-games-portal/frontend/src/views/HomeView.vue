<template>
  <div>
    <h2 class="text-2xl font-semibold mb-6">Оберіть гру</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <GameCard v-for="game in games" :key="game.name" :game="game" @play="startGame" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import GameCard from '../components/GameCard.vue'

const router = useRouter()
const userStore = useUserStore()
const games = ref([
  { name: 'TicTacToe', title: 'Хрестики/Нулики', img: '/src/assets/img/xo.png' },
  { name: 'Memory',    title: 'Пам’ять',        img: '/src/assets/img/memory.png' }
])

function startGame(game) {
  userStore.addGameToHistory(game.title)
  router.push({ name: 'game', params: { name: game.name } })
}
</script>
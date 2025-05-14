<template>
  <div class="container mx-auto px-6 py-8">
    <div class="bg-primary-light dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 class="text-2xl font-semibold mb-4 text-primary-dark dark:text-gray-200">
        Ваша історія ігор
      </h2>
      <GameHistory :records="userStore.gameHistory" :showScore="true" />
    </div>
  </div>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore'
import GameHistory from '@/components/GameHistory.vue'

const userStore = useUserStore()
</script>

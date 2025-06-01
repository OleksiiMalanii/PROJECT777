<template>
  <section class="pt-28 pb-20 pl-20 pr-6 md:pl-32 md:pr-12 text-white font-sci-fi">
    <h1 class="text-4xl font-bold text-center mb-4">RECORDS</h1>
    <div class="h-1 w-43 bg-white mx-auto mb-10 rounded-full"></div>

    <div v-if="loading" class="text-gray-300 text-2xl">Loading...</div>
    <div v-else class="space-y-8">
      <div v-if="records.minesweeper">
        <h2 class="text-2xl text-orange-500 mb-2">Minesweeper</h2>
        <ul class="list-disc list-inside space-y-1">
          <li v-if="records.minesweeper.easy">Easy: {{ records.minesweeper.easy }}s</li>
          <li v-if="records.minesweeper.medium">Medium: {{ records.minesweeper.medium }}s</li>
          <li v-if="records.minesweeper.hard">Hard: {{ records.minesweeper.hard }}s</li>
        </ul>
      </div>

      <div v-if="records.candycrush">
        <h2 class="text-2xl text-orange-500 mb-2">Candy Crush</h2>
        <p>Best Score: {{ records.candycrush }}</p>
      </div>

      <div v-if="records.tetris">
        <h2 class="text-2xl text-orange-500 mb-2">Tetris</h2>
        <ul class="list-disc list-inside space-y-1">
          <li v-if="records.tetris.easy">Easy: {{ records.tetris.easy }}</li>
          <li v-if="records.tetris.hard">Hard: {{ records.tetris.hard }}</li>
        </ul>
      </div>

      <div v-if="records.snake">
        <h2 class="text-2xl text-orange-500 mb-2">Snake</h2>
        <ul class="list-disc list-inside space-y-1">
          <li v-if="records.snake.easy">Easy: {{ records.snake.easy }}</li>
          <li v-if="records.snake.medium">Medium: {{ records.snake.medium }}</li>
          <li v-if="records.snake.hard">Hard: {{ records.snake.hard }}</li>
        </ul>
      </div>

      <div v-if="records.spaceshooter">
        <h2 class="text-2xl text-orange-500 mb-2">Space Shooter</h2>
        <ul class="list-disc list-inside space-y-1">
          <li v-if="records.spaceshooter.easy">Easy: {{ records.spaceshooter.easy }}</li>
          <li v-if="records.spaceshooter.medium">Medium: {{ records.spaceshooter.medium }}</li>
          <li v-if="records.spaceshooter.hard">Hard: {{ records.spaceshooter.hard }}</li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref as vueRef, onMounted } from 'vue'
import { getDatabase, ref, get } from 'firebase/database'
import { getAuth } from 'firebase/auth'

const records = vueRef({})
const loading = vueRef(true)

onMounted(async () => {
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return

  const db = getDatabase()
  const recordRef = ref(db, `records/${user.uid}`)
  const snapshot = await get(recordRef)
  if (snapshot.exists()) {
    records.value = snapshot.val()
  }
  loading.value = false;
})
</script>

<style scoped>
</style>

<template>
  <div class="text-center">
    <h1 class="text-3xl font-bold mb-1 mt-2">Repeat the Pattern</h1>
    <p class="text-lg mb-4">Score: {{ round }}</p>

    <div class="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-6">
      <div></div>
      <div
          class="w-20 h-20 rounded-full transition-all duration-200 cursor-pointer"
          :class="getCircleClasses(0)"
          @click="handleUserInput(0)"
      ></div>
      <div></div>

      <div
          class="w-20 h-20 rounded-full transition-all duration-200 cursor-pointer"
          :class="getCircleClasses(1)"
          @click="handleUserInput(1)"
      ></div>
      <div></div>
      <div
          class="w-20 h-20 rounded-full transition-all duration-200 cursor-pointer"
          :class="getCircleClasses(2)"
          @click="handleUserInput(2)"
      ></div>

      <div></div>
      <div
          class="w-20 h-20 rounded-full transition-all duration-200 cursor-pointer"
          :class="getCircleClasses(3)"
          @click="handleUserInput(3)"
      ></div>
      <div></div>
    </div>

    <p v-if="gameOver" class="text-red-600 font-semibold mb-4">Неправильно! Гру завершено.</p>
  </div>

  <div class="text-center mt-4 flex justify-center gap-4">
    <button
        @click="startGame"
        class="px-6 py-2 bg-green-600 dark:bg-primary text-green-200 rounded-2xl dark:text-white hover:bg-green-800 transition hover:dark:bg-primary-dark"
    >
      {{ gameStarted ? 'Перезапустити' : (gameOver ? 'Заново' : 'Почати') }}
    </button>
    <button
        @click="exitGame"
        class="px-6 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition"
    >
      Вийти
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const userStore = useUserStore()
const router = useRouter()

const colors = [
  'bg-red-500 dark:bg-red-600',
  'bg-blue-600 dark:bg-blue-500',
  'bg-orange-400 dark:bg-orange-400',
  'bg-purple-800 dark:bg-purple-700'
]

const glowEffects = [
  'shadow-[0_0_20px_#f87171]',
  'shadow-[0_0_20px_#60a5fa]',
  'shadow-[0_0_20px_#fde047]',
  'shadow-[0_0_20px_#a78bfa]'
]

const pattern = ref([])
const userInput = ref([])
const round = ref(0)
const isFlashing = ref(false)
const currentFlashIndex = ref(-1)
const gameStarted = ref(false)
const gameOver = ref(false)

function getCircleClasses(index) {
  const baseColor = colors[index]
  const isCurrent = currentFlashIndex.value === index

  return [
    baseColor,
    isCurrent ? glowEffects[index] : '',
    isFlashing.value && !isCurrent ? 'opacity-60' : '',
    !isFlashing.value && gameStarted.value ? 'hover:opacity-70' : '',
    !isFlashing.value && gameStarted.value ? 'cursor-pointer' : 'cursor-default'
  ]
}

function startGame() {
  gameStarted.value = true
  gameOver.value = false
  round.value = 0
  pattern.value = []
  nextRound()
}

function nextRound() {
  userInput.value = []
  pattern.value.push(Math.floor(Math.random() * 4))
  round.value++
  flashPattern()
}

function flashPattern() {
  isFlashing.value = true
  let i = 0

  const interval = setInterval(() => {
    currentFlashIndex.value = pattern.value[i]
    const isLast = i === pattern.value.length - 1
    const flashDuration = isLast ? 700 : 400

    setTimeout(() => {
      currentFlashIndex.value = -1
    }, flashDuration)

    i++
    if (i >= pattern.value.length) {
      clearInterval(interval)
      setTimeout(() => {
        isFlashing.value = false
      }, 800)
    }
  }, 800)
}

function handleUserInput(index) {
  if (isFlashing.value || !gameStarted.value) return

  userInput.value.push(index)
  const current = userInput.value.length - 1

  if (userInput.value[current] !== pattern.value[current]) {
    gameOver.value = true
    gameStarted.value = false
    userStore.addGameToHistory('Repeat the Pattern', round.value)
    return
  }

  if (userInput.value.length === pattern.value.length) {
    setTimeout(() => {
      nextRound()
    }, 500)
  }
}

function exitGame() {
  router.push('/')
}
</script>

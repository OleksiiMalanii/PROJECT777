<template>
  <div class="flex h-screen font-sci-fi text-white">
    <!-- Left: Game Area -->
    <div class="flex flex-col items-center justify-center flex-1">
      <div class="text-lg mb-1">Score: {{ score }}</div>
      <canvas
          ref="canvas"
          width="400"
          height="400"
          :class="['bg-black border-4 rounded-lg transition-shadow duration-200',
          crashed ? 'border-red-500 shadow-[0_0_20px_#ff0000]' : glow ? 'border-blue-600 shadow-[0_0_20px_#0000FF]' : 'border-blue-800 ']"
      ></canvas>
    </div>

    <!-- Right: Game Info -->
    <div class="w-full md:w-1/3 p-6 flex flex-col justify-center space-y-6 border-l border-white/10">
      <h2 class="text-3xl font-bold">Snake Game</h2>
      <p class="text-sm">By: <span class="text-orange-400">Yaroslav Labunskiy</span></p>

      <!-- Difficulty -->
      <div class="flex gap-2">
        <button
            @click="setDifficulty('easy')"
            :disabled="isGameRunning"
            :class="[
            'px-4 py-2 rounded-full transition',
            isGameRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer',
            currentDifficulty === 'easy' ? 'ring-2 ring-white' : ''
        ]"
        >
          Easy
        </button>
        <button
            @click="setDifficulty('medium')"
            :disabled="isGameRunning"
            :class="[
            'px-4 py-2 rounded-full transition',
            isGameRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-700 cursor-pointer',
            currentDifficulty === 'medium' ? 'ring-2 ring-white' : ''
        ]"
        >
          Medium
        </button>
        <button
            @click="setDifficulty('hard')"
            :disabled="isGameRunning"
            :class="[
            'px-4 py-2 rounded-full transition',
            isGameRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-800 cursor-pointer',
            currentDifficulty === 'hard' ? 'ring-2 ring-white' : ''
        ]"
        >
          Hard
        </button>
      </div>

      <div class="flex gap-4">
        <button
            @click="toggleGame"
            :class="[
            'flex-1 px-4 py-2 rounded-full transition',
            isGameRunning ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600 cursor-pointer'
          ]"
        >
          {{ isGameRunning ? 'Stop' : 'Start' }}
        </button>
        <button
            @click="goHome"
            class="flex-1 px-4 py-2 rounded-full bg-red-500 hover:bg-red-700 transition cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const canvas = ref(null)
const ctx = ref(null)

const gridSize = 20
const canvasSize = 400
const numCells = canvasSize / gridSize
let gameInterval = null

const difficultyPresets = {
  easy: 150,
  medium: 120,  // Виправлено: було 'mid', тепер 'medium'
  hard: 90,
}

const difficulty = ref(difficultyPresets.medium)  // Виправлено: було 'mid', тепер 'medium'
const currentDifficulty = ref('medium')  // Виправлено: було 'mid', тепер 'medium'

const snake = ref([
  { x: 5, y: 5 },
  { x: 4, y: 5 },
  { x: 3, y: 5 }
])
const direction = ref({ x: 1, y: 0 })
const food = ref({ x: -1, y: -1, emoji: '🍎' })
const score = ref(0)
const isGameRunning = ref(false)
const isFood = ref(false)
const glow = ref(false)
const crashed = ref(false)

const nextDirection = ref({ x: 1, y: 0 })
const foodEmojis = ['🍇', '🍈', '🍉', '🍊', '🍋', '🍋‍', '🍌',
  '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🥝', '🍅', '🥥']

const drawBackground = () => {
  for (let y = 0; y < numCells; y++) {
    for (let x = 0; x < numCells; x++) {
      ctx.value.fillStyle = (x + y) % 2 === 0 ? '#2e2e2e' : '#1f1f1f'
      ctx.value.fillRect(x * gridSize, y * gridSize, gridSize, gridSize)
    }
  }
}

const draw = () => {
  drawBackground()

  if (isFood.value) {
    ctx.value.font = `${gridSize}px Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji`
    ctx.value.textAlign = 'center'
    ctx.value.textBaseline = 'middle'
    ctx.value.fillText(
        food.value.emoji,
        food.value.x * gridSize + gridSize / 2,
        food.value.y * gridSize + gridSize / 2
    )
  }

  snake.value.forEach((segment, index) => {
    ctx.value.beginPath()
    const radius = 6
    const isHead = index === 0
    const isTail = index === snake.value.length - 1

    ctx.value.fillStyle = crashed.value
        ? isHead ? '#700000' : '#c30000'
        : isHead ? '#009700' : 'lime'

    ctx.value.roundRect(
        segment.x * gridSize,
        segment.y * gridSize,
        gridSize,
        gridSize,
        isHead ? radius : isTail ? radius : 2
    )
    ctx.value.fill()

    if (isHead) {
      const eyeSize = gridSize / 2
      const eyeX = segment.x * gridSize + gridSize / 2
      const eyeY = segment.y * gridSize + gridSize / 2

      ctx.value.font = `bold ${eyeSize}px Arial`
      ctx.value.textAlign = 'center'
      ctx.value.textBaseline = 'middle'
      ctx.value.fillStyle = crashed.value ? 'black' : ''

      const eyeEmoji = crashed.value ? 'XX' : '👀'

      if (direction.value.x === 1) {
        ctx.value.fillText(eyeEmoji, eyeX + 5, eyeY)
      } else if (direction.value.x === -1) {
        ctx.value.fillText(eyeEmoji, eyeX - 5, eyeY)
      } else if (direction.value.y === -1) {
        ctx.value.fillText(eyeEmoji, eyeX, eyeY - 5)
      } else {
        ctx.value.fillText(eyeEmoji, eyeX, eyeY + 5)
      }
    }
  })
}

const placeFood = () => {
  if (isFood.value) return

  let newX, newY
  do {
    newX = Math.floor(Math.random() * numCells)
    newY = Math.floor(Math.random() * numCells)
  } while (snake.value.some(segment => segment.x === newX && segment.y === newY))

  food.value = {
    x: newX,
    y: newY,
    emoji: foodEmojis[Math.floor(Math.random() * foodEmojis.length)]
  }
  isFood.value = true
}

const setDifficulty = (level) => {
  currentDifficulty.value = level
  difficulty.value = difficultyPresets[level]

  if (isGameRunning.value) {
    stopGame()
    startGame()
  }
}

const startGame = () => {
  resetGame()
  gameInterval = setInterval(move, difficulty.value)
  isGameRunning.value = true
}

const stopGame = () => {
  clearInterval(gameInterval)
  gameInterval = null
  isGameRunning.value = false
}

const toggleGame = () => {
  if (isGameRunning.value) {
    stopGame()
  } else {
    startGame()
  }
}

const resetGame = () => {
  snake.value = [
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ]
  nextDirection.value = { x: 1, y: 0 }
  direction.value = { x: 1, y: 0 }
  score.value = 0
  glow.value = false
  crashed.value = false
  isFood.value = false
  placeFood()
  draw()
}

const move = () => {
  direction.value = { ...nextDirection.value }

  const newHead = {
    x: snake.value[0].x + direction.value.x,
    y: snake.value[0].y + direction.value.y
  }

  if (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= numCells ||
      newHead.y >= numCells ||
      snake.value.some(segment => segment.x === newHead.x && segment.y === newHead.y)
  ) {
    crashed.value = true
    draw()
    stopGame()
    return
  }

  snake.value.unshift(newHead)

  if (newHead.x === food.value.x && newHead.y === food.value.y) {
    score.value += 1
    isFood.value = false
    placeFood()
    glow.value = true
    setTimeout(() => (glow.value = false), 150)
  } else {
    snake.value.pop()
  }

  draw()
}

const goHome = () => {
  stopGame()
  router.push('/games')
}

const handleKey = (e) => {
  switch (e.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
    case 'ц':
    case 'Ц':
      if (direction.value.y === 0) nextDirection.value = { x: 0, y: -1 }
      break
    case 'ArrowDown':
    case 's':
    case 'S':
    case 'і':
    case 'І':
      if (direction.value.y === 0) nextDirection.value = { x: 0, y: 1 }
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
    case 'ф':
    case 'Ф':
      if (direction.value.x === 0) nextDirection.value = { x: -1, y: 0 }
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
    case 'в':
    case 'В':
      if (direction.value.x === 0) nextDirection.value = { x: 1, y: 0 }
      break
  }
}

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')
  draw()
  window.addEventListener('keydown', handleKey)
})

onBeforeUnmount(() => {
  stopGame()
  window.removeEventListener('keydown', handleKey)
})
</script>
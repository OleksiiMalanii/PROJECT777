<template>
  <div class="flex h-screen sci-fi-font text-white">
    <!-- Left: Game Area -->
    <div class="flex flex-col items-center justify-center flex-1">
      <div class="text-lg mb-1">Score: {{ score }}</div>
      <canvas
          ref="canvas"
          width="400"
          height="400"
          :class="['bg-black border-4 rounded-lg transition-shadow duration-200',
          crashed ? 'border-red-500 shadow-[0_0_20px_#ff0000]' : glow ? 'border-orange-500 shadow-[0_0_20px_#f97316]' : 'border-orange-500']"
      ></canvas>
    </div>

    <!-- Right: Game Info -->
    <div class="w-full md:w-1/3 p-6 flex flex-col justify-center space-y-6 border-l border-white/10">
      <h2 class="text-3xl font-bold">Tetris</h2>
      <p class="text-sm">By: <span class="text-orange-400">Yaroslav Labunskiy</span></p>

      <div class="flex gap-4">
        <button
            @click="toggleGame"
            :class="[
            'flex-1 px-4 py-2 rounded-full transition',
            isRunning ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
          ]"
        >
          {{ isRunning ? 'Stop' : 'Start' }}
        </button>
        <button
            @click="goHome"
            class="flex-1 px-4 py-2 rounded-full bg-red-500 hover:bg-red-700 transition"
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

const snake = ref([{ x: 5, y: 5 }])
const direction = ref({ x: 1, y: 0 })
const food = ref({ x: 10, y: 10 })
const score = ref(0)
const isRunning = ref(false)
const glow = ref(false)
const crashed = ref(false)

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

  // Draw food
  ctx.value.fillStyle = 'red'
  ctx.value.fillRect(food.value.x * gridSize, food.value.y * gridSize, gridSize, gridSize)

  // Draw snake
  snake.value.forEach((segment, index) => {
    ctx.value.fillStyle = crashed.value
        ? index === 0
            ? '#970000' // darker head
            : '#c30000'
        : index === 0
            ? '#009700' // darker head
            : 'lime'
    ctx.value.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize)
  })
}

const move = () => {
  const newHead = {
    x: snake.value[0].x + direction.value.x,
    y: snake.value[0].y + direction.value.y,
  }

  if (
      newHead.x < 0 ||
      newHead.y < 0 ||
      newHead.x >= numCells ||
      newHead.y >= numCells ||
      snake.value.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
  ) {
    crashed.value = true
    draw()
    stopGame()
    return
  }

  snake.value.unshift(newHead)

  if (newHead.x === food.value.x && newHead.y === food.value.y) {
    score.value += 1
    placeFood()
    glow.value = true
    setTimeout(() => (glow.value = false), 150)
  } else {
    snake.value.pop()
  }

  draw()
}

const placeFood = () => {
  let newX, newY
  do {
    newX = Math.floor(Math.random() * numCells)
    newY = Math.floor(Math.random() * numCells)
  } while (snake.value.some((segment) => segment.x === newX && segment.y === newY))
  food.value = { x: newX, y: newY }
}

const startGame = () => {
  resetGame()
  gameInterval = setInterval(move, 150)
  isRunning.value = true
}

const stopGame = () => {
  clearInterval(gameInterval)
  gameInterval = null
  isRunning.value = false
}

const toggleGame = () => {
  if (isRunning.value) {
    stopGame()
  } else {
    startGame()
  }
}

const resetGame = () => {
  snake.value = [{ x: 5, y: 5 }]
  direction.value = { x: 1, y: 0 }
  score.value = 0
  glow.value = false
  crashed.value = false
  placeFood()
  draw()
}

function goHome() {
  stopGame()
  router.push('/games')
}

const handleKey = (e) => {
  switch (e.key) {
    case 'ArrowUp':
      if (direction.value.y === 0) direction.value = { x: 0, y: -1 }
      break
    case 'ArrowDown':
      if (direction.value.y === 0) direction.value = { x: 0, y: 1 }
      break
    case 'ArrowLeft':
      if (direction.value.x === 0) direction.value = { x: -1, y: 0 }
      break
    case 'ArrowRight':
      if (direction.value.x === 0) direction.value = { x: 1, y: 0 }
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

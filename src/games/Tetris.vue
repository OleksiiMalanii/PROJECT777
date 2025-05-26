<template>
  <section class="flex h-screen text-white sci-fi-font overflow-hidden bg-gradient-to-t from-gray-900 to-indigo-950">
    <!-- Game Field Left -->
    <div class="flex flex-col justify-center items-center flex-grow p-4">
      <p class="text-lg mb-1">Score: {{ score }}</p>
      <div class="rounded-2xl bg-gray-800 p-2" style="width: 310px; height: 495px;">
        <canvas
            ref="canvas"
            width="288"
            height="480"
            class="block mx-auto"
        ></canvas>
      </div>
    </div>

    <!-- Game Info Right -->
    <div class="w-full md:w-1/3 p-6 flex flex-col justify-center space-y-6 border-l border-white/10">
      <h2 class="text-3xl font-bold">Tetris</h2>
      <p class="text-sm">By: <span class="text-orange-400">Andrii Kohut</span></p>

      <!-- Controls -->
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
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const canvas = ref(null)
const ctx = ref(null)
const score = ref(0)
const isRunning = ref(false)

const COLS = 12
const ROWS = 20
const BLOCK_SIZE = 24

let grid = []
let currentPiece = null
let dropCounter = 0
let lastTime = 0
let animationFrameId = null

const colors = [
  null, 'cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange',
]

const SHAPES = {
  I: [[1, 1, 1, 1]],
  O: [[2, 2], [2, 2]],
  T: [[0, 3, 0], [3, 3, 3]],
  S: [[0, 4, 4], [4, 4, 0]],
  Z: [[5, 5, 0], [0, 5, 5]],
  J: [[6, 0, 0], [6, 6, 6]],
  L: [[0, 0, 7], [7, 7, 7]],
}

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')
  document.addEventListener('keydown', handleKey)
})

function createMatrix(w, h) {
  const matrix = []
  while (h--) matrix.push(new Array(w).fill(0))
  return matrix
}

function createPiece() {
  const types = 'IOTSZJL'
  const type = types[Math.floor(Math.random() * types.length)]
  const matrix = SHAPES[type]
  return {
    pos: { x: Math.floor(COLS / 2) - Math.ceil(matrix[0].length / 2), y: -matrix.length + 1 },
    matrix,
    type,
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      const drawY = y + offset.y
      if (value !== 0 && drawY >= 0) {
        ctx.value.fillStyle = colors[value]
        ctx.value.fillRect(
            (x + offset.x) * BLOCK_SIZE,
            drawY * BLOCK_SIZE,
            BLOCK_SIZE,
            BLOCK_SIZE
        )
      }
    })
  })
}

function draw() {
  ctx.value.fillStyle = '#1c1a49' // Tailwind bg-gray-800
  ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height)
  drawMatrix(grid, { x: 0, y: 0 })
  if (currentPiece) drawMatrix(currentPiece.matrix, currentPiece.pos)
}

function merge(grid, piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0 && y + piece.pos.y >= 0) {
        grid[y + piece.pos.y][x + piece.pos.x] = value
      }
    })
  })
}

function collide(grid, piece) {
  const { matrix, pos } = piece
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < matrix[y].length; ++x) {
      if (
          matrix[y][x] !== 0 &&
          (!grid[y + pos.y] || grid[y + pos.y][x + pos.x] !== 0)
      ) return true
    }
  }
  return false
}

function playerDrop() {
  currentPiece.pos.y++
  if (collide(grid, currentPiece)) {
    currentPiece.pos.y--
    merge(grid, currentPiece)
    if (checkTopOverflow()) {
      stopGame()
      return
    }
    playerReset()
    clearLines()
  }
  dropCounter = 0
}

function checkTopOverflow() {
  for (let x = 0; x < COLS; x++) {
    if (grid[0][x] !== 0) return true
  }
  return false
}

function playerReset() {
  currentPiece = createPiece()
  if (collide(grid, currentPiece) && currentPiece.pos.y >= 0) {
    stopGame()
    return
  }
}

function clearLines() {
  outer: for (let y = grid.length - 1; y >= 0; --y) {
    for (let x = 0; x < COLS; ++x) {
      if (grid[y][x] === 0) continue outer
    }
    const row = grid.splice(y, 1)[0].fill(0)
    grid.unshift(row)
    score.value += 10
    ++y
  }
}

function update(time = 0) {
  const deltaTime = time - lastTime
  lastTime = time
  dropCounter += deltaTime
  if (dropCounter > 250) {
    playerDrop()
  }
  draw()
  if (isRunning.value) {
    animationFrameId = requestAnimationFrame(update)
  }
}

function startGame() {
  score.value = 0
  grid = createMatrix(COLS, ROWS)
  playerReset()
  dropCounter = 0
  lastTime = 0
  isRunning.value = true
  animationFrameId = requestAnimationFrame(update)
}

function stopGame() {
  isRunning.value = false
  cancelAnimationFrame(animationFrameId)
  animationFrameId = null
}

function toggleGame() {
  if (isRunning.value) {
    stopGame()
  } else {
    startGame()
  }
}

function move(dir) {
  currentPiece.pos.x += dir
  if (collide(grid, currentPiece)) {
    currentPiece.pos.x -= dir
  }
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse()
}

function playerRotate() {
  const original = currentPiece.matrix
  const rotated = rotate(currentPiece.matrix)
  currentPiece.matrix = rotated
  if (collide(grid, currentPiece)) {
    currentPiece.matrix = original
  }
}

function handleKey(e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault()
  }
  if (!isRunning.value || !currentPiece) return
  if (e.key === 'ArrowLeft') move(-1)
  if (e.key === 'ArrowRight') move(1)
  if (e.key === 'ArrowDown') playerDrop()
  if (e.key === 'ArrowUp') playerRotate()
}

function goHome() {
  stopGame()
  router.push('/games')
}
</script>

<style scoped>
</style>

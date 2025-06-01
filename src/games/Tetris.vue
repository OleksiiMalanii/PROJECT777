<template>
  <div class="flex h-screen font-sci-fi text-white">
    <!-- Left: Game Area -->
    <div class="flex flex-col items-center justify-center flex-1">
      <div class="text-lg mb-1">Score: {{ score }}</div>
      <div
          :class="['rounded-2xl p-2 transition-all duration-200',
          gameOver ? 'bg-red-600 shadow-[0_0_30px_#ff0000]' :
          glow ? 'bg-blue-600 shadow-[0_0_30px_#0000FF]' : 'bg-blue-800']"
          style="width: 310px; height: 495px;">
        <canvas
            ref="canvas"
            width="288"
            height="480"
            class="block mx-auto rounded-lg"
        ></canvas>
      </div>
    </div>

    <!-- Right: Game Info -->
    <div class="w-full md:w-1/3 p-6 flex flex-col justify-center space-y-6 border-l border-white/10">
      <h2 class="text-3xl font-bold">Tetris</h2>
      <p class="text-sm">By: <span class="text-orange-400">Andrii Kohut</span></p>

      <!-- Difficulty Selection -->
      <div class="flex gap-2">
        <button
            @click="setDifficulty('easy')"
            :disabled="isRunning"
            :class="[
            'px-4 py-2 rounded-full transition',
            isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 cursor-pointer',
            currentDifficulty === 'easy' ? 'ring-2 ring-white' : ''
        ]"
        >
          Easy
        </button>
        <button
            @click="setDifficulty('hard')"
            :disabled="isRunning"
            :class="[
            'px-4 py-2 rounded-full transition',
            isRunning ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600 cursor-pointer',
            currentDifficulty === 'hard' ? 'ring-2 ring-white' : ''
        ]"
        >
          Hard
        </button>
      </div>

      <!-- Next Piece Preview (only on easy) -->
      <div v-if="currentDifficulty === 'easy'" class="bg-gray-700 rounded-lg p-4">
        <h3 class="text-sm mb-2">Next Piece:</h3>
        <canvas
            ref="previewCanvas"
            width="96"
            height="96"
            class="bg-gray-800 rounded border-2 border-gray-600"
        ></canvas>
      </div>

      <!-- Controls -->
      <div class="flex gap-4">
        <button
            @click="toggleGame"
            :class="[
            'flex-1 px-4 py-2 rounded-full transition cursor-pointer',
            isRunning ? 'bg-blue-500 hover:bg-blue-600' : 'bg-green-500 hover:bg-green-600'
          ]"
        >
          {{ isRunning ? 'Stop' : 'Start' }}
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
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import {getAuth} from "firebase/auth";

import { giveBadge } from '/src/utils/badgeUtils';
import { saveRecord } from '/src/utils/records.js'

const router = useRouter()

const canvas = ref(null)
const previewCanvas = ref(null)
const ctx = ref(null)
const previewCtx = ref(null)
const score = ref(0)
const isRunning = ref(false)
const gameOver = ref(false)
const glow = ref(false)

const COLS = 12
const ROWS = 20
const BLOCK_SIZE = 24

// Difficulty system
const currentDifficulty = ref('easy')
const difficultySettings = {
  easy: { dropSpeed: 300, showNext: true },
  hard: { dropSpeed: 150, showNext: false }
}

let grid = []
let currentPiece = null
let nextPiece = null
let dropCounter = 0
let lastTime = 0
let animationFrameId = null

// Simplified color system like Snake
const colors = {
  1: '#00CED1', // Cyan - I piece
  2: '#FFD700', // Gold - O piece
  3: '#9370DB', // Purple - T piece
  4: '#32CD32', // Lime - S piece
  5: '#FF6347', // Tomato - Z piece
  6: '#4169E1', // Royal Blue - J piece
  7: '#FF8C00', // Orange - L piece
};

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
  initPreviewCanvas()
  document.addEventListener('keydown', handleKey)
})

function initPreviewCanvas() {
  if (previewCanvas.value) {
    previewCtx.value = previewCanvas.value.getContext('2d')
  }
}

function createMatrix(w, h) {
  const matrix = []
  while (h--) matrix.push(new Array(w).fill(0))
  return matrix
}

function createPiece() {
  const types = 'IOTSZJL'
  const type = types[Math.floor(Math.random() * types.length)]
  const shape = SHAPES[type]

  return {
    pos: { x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2), y: -shape.length + 1 },
    matrix: JSON.parse(JSON.stringify(shape)),
    type,
  }
}

function drawMatrix(matrix, offset, context = ctx.value, blockSize = BLOCK_SIZE) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      const drawY = y + offset.y
      if (value !== 0 && drawY >= 0) {
        context.fillStyle = colors[value]

        const blockX = (x + offset.x) * blockSize
        const blockY = drawY * blockSize

        // Draw rounded rectangle like Snake
        context.beginPath()
        const radius = 4
        context.roundRect(blockX + 1, blockY + 1, blockSize - 2, blockSize - 2, radius)
        context.fill()

        // Add subtle border
        context.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        context.lineWidth = 1
        context.stroke()
      }
    })
  })
}

function drawBackground() {
  // Checkered background like Snake
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      ctx.value.fillStyle = (x + y) % 2 === 0 ? '#2e2e2e' : '#1f1f1f'
      ctx.value.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE)
    }
  }
}

function draw() {
  drawBackground()

  // Draw grid pieces
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== 0) {
        ctx.value.fillStyle = gameOver.value ? '#666666' : colors[cell]

        const blockX = x * BLOCK_SIZE
        const blockY = y * BLOCK_SIZE

        ctx.value.beginPath()
        const radius = 4
        ctx.value.roundRect(blockX + 1, blockY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2, radius)
        ctx.value.fill()

        ctx.value.strokeStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.value.lineWidth = 1
        ctx.value.stroke()
      }
    })
  })

  // Draw current piece
  if (currentPiece) {
    drawMatrix(currentPiece.matrix, currentPiece.pos)
  }
}

function drawNextPiece() {
  if (!nextPiece || currentDifficulty.value !== 'easy') return

  // Ensure preview context is available
  if (!previewCtx.value && previewCanvas.value) {
    previewCtx.value = previewCanvas.value.getContext('2d')
  }

  if (!previewCtx.value) return

  // Clear preview canvas
  previewCtx.value.fillStyle = '#1f1f1f'
  previewCtx.value.fillRect(0, 0, 96, 96)

  // Center the piece in preview
  const pieceWidth = nextPiece.matrix[0].length
  const pieceHeight = nextPiece.matrix.length
  const offsetX = Math.floor((4 - pieceWidth) / 2)
  const offsetY = Math.floor((4 - pieceHeight) / 2)

  drawMatrix(nextPiece.matrix, { x: offsetX, y: offsetY }, previewCtx.value, 24)
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
      if (matrix[y][x] !== 0) {
        const gridY = y + pos.y
        const gridX = x + pos.x

        if (
            gridY < 0 ||
            gridY >= ROWS ||
            gridX < 0 ||
            gridX >= COLS ||
            (gridY >= 0 && grid[gridY][gridX] !== 0)
        ) {
          return true
        }
      }
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
    if (grid[0][x] !== 0) {
      gameOver.value = true
      return true
    }
  }
  return false
}

function playerReset() {
  currentPiece = nextPiece || createPiece()
  nextPiece = createPiece()

  // Update preview only in easy mode
  if (currentDifficulty.value === 'easy') {
    nextTick(() => {
      drawNextPiece()
    })
  }

  if (collide(grid, currentPiece) && currentPiece.pos.y >= 0) {
    stopGame()
    return
  }
}

function clearLines() {
  let linesCleared = 0
  outer: for (let y = grid.length - 1; y >= 0; --y) {
    for (let x = 0; x < COLS; ++x) {
      if (grid[y][x] === 0) continue outer
    }
    const row = grid.splice(y, 1)[0]
    grid.unshift(new Array(COLS).fill(0))
    score.value += 10
    linesCleared++
    ++y
  }

  if (linesCleared > 0) {
    glow.value = true
    setTimeout(() => (glow.value = false), 200)
  }
}

function update(time = 0) {
  const deltaTime = time - lastTime
  lastTime = time
  dropCounter += deltaTime

  const dropSpeed = difficultySettings[currentDifficulty.value].dropSpeed
  if (dropCounter > dropSpeed) {
    playerDrop()
  }
  draw()
  if (isRunning.value) {
    animationFrameId = requestAnimationFrame(update)
  }
}

function setDifficulty(level) {
  currentDifficulty.value = level

  // When switching to easy mode, ensure preview canvas is initialized
  if (level === 'easy') {
    nextTick(() => {
      initPreviewCanvas()
      if (nextPiece) {
        drawNextPiece()
      }
    })
  }

  if (isRunning.value) {
    stopGame()
    startGame()
  }
}

function startGame() {
  score.value = 0
  gameOver.value = false
  glow.value = false
  grid = createMatrix(COLS, ROWS)
  nextPiece = createPiece()
  playerReset()
  dropCounter = 0
  lastTime = 0
  isRunning.value = true
  animationFrameId = requestAnimationFrame(update)
}

function stopGame() {
  checkRecord()
  isRunning.value = false
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

function toggleGame() {
  if (isRunning.value) {
    stopGame()
  } else {
    startGame()
  }
}

const checkRecord = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (user) {
    saveRecord("tetris", score.value, currentDifficulty.value, true)
  }
}

function move(dir) {
  currentPiece.pos.x += dir
  if (collide(grid, currentPiece)) {
    currentPiece.pos.x -= dir
  }
}

function rotate(matrix) {
  const N = matrix.length
  const result = new Array(matrix[0].length).fill(0).map(() => new Array(N).fill(0))
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      result[j][N - 1 - i] = matrix[i][j]
    }
  }
  return result
}

function rotateCounterClockwise(matrix) {
  const N = matrix.length
  const result = new Array(matrix[0].length).fill(0).map(() => new Array(N).fill(0))
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      result[matrix[i].length - 1 - j][i] = matrix[i][j]
    }
  }
  return result
}

function playerRotate(clockwise = true) {
  const originalMatrix = currentPiece.matrix
  currentPiece.matrix = clockwise ? rotate(currentPiece.matrix) : rotateCounterClockwise(currentPiece.matrix)

  if (collide(grid, currentPiece)) {
    currentPiece.matrix = originalMatrix
  }
}

function handleKey(e) {
  if (!isRunning.value || !currentPiece) return

  if (!router.currentRoute.value.path.includes('/games/tetris')) return

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "W", "s", "S",
    "a", "A", "d", "D", "ц", "Ц", "і", "І", "ф", "Ф", "в", "В", "q", "Q", "e", "E", "й", "Й", "у", "У"].includes(e.key)) {
    e.preventDefault()
  }

  if (["ArrowLeft", "a", "A", "ф", "Ф"].includes(e.key)) {
    move(-1)
  }

  if (["ArrowRight", "d", "D", "в", "В"].includes(e.key)) {
    move(1)
  }

  if (["ArrowDown", "s", "S", "і", "І"].includes(e.key)) {
    playerDrop()
  }

  // Clockwise rotation
  if (["ArrowUp", "w", "W", "ц", "Ц"].includes(e.key)) {
    playerRotate(true)
  }

  // Counter-clockwise rotation
  if (["q", "Q", "й", "Й"].includes(e.key)) {
    playerRotate(false)
  }

  // Alternative clockwise rotation
  if (["e", "E", "у", "У"].includes(e.key)) {
    playerRotate(true)
  }
}

onUnmounted(() => {
  document.removeEventListener('keydown', handleKey)
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

function goHome() {
  stopGame()
  router.push('/games')
}
</script>

<style scoped>
.font-sci-fi {
  font-family: 'Orbitron', sans-serif;
}
</style>
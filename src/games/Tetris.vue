<template>
  <section class="flex h-screen text-white font-sci-fi overflow-hidden bg-gradient-to-t from-gray-900 to-indigo-950">
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

// Updated color system with multiple shades per color
const colorShades = {
  1: ['#00AFFF', '#00CED1', '#00BBBB'], // Cyan
  2: ['#FFFF00', '#ECEC00', '#CCCC00'], // Yellow
  3: ['#AA00FF', '#9900E5', '#8800CC'], // Purple
  4: ['#00FF00', '#00CC00', '#00AF00'], // Green
  5: ['#AA0000', '#CA0000', '#8A0000'], // Red
  6: ['#1d1dff', '#1313ff', '#0000CC'], // Blue
  7: ['#FF9500', '#E59400', '#CC8400'], // Orange !!!!
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
  const shape = SHAPES[type]

  // Create shaded matrix with random shades for each block
  const shadedMatrix = shape.map(row =>
      row.map(value => value === 0 ? 0 : Math.floor(Math.random() * 3) + 1)
  )

  return {
    pos: { x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2), y: -shape.length + 1 },
    matrix: JSON.parse(JSON.stringify(shape)), // Deep copy of the shape
    shadedMatrix,
    type,
  }
}

function drawMatrix(matrix, offset, shadedMatrix = null) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      const drawY = y + offset.y
      if (value !== 0 && drawY >= 0) {
        // Get the shade index (0, 1, or 2)
        const shadeIndex = shadedMatrix ? shadedMatrix[y][x] - 1 : 0
        ctx.value.fillStyle = colorShades[value][shadeIndex]

        // Draw the block with a small border
        const blockX = (x + offset.x) * BLOCK_SIZE
        const blockY = drawY * BLOCK_SIZE

        // Main block
        ctx.value.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE)

        // Add some highlights for better visual effect
        ctx.value.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.value.lineWidth = 1
        ctx.value.strokeRect(blockX + 1, blockY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2)

        // Inner highlight
        ctx.value.strokeStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.value.strokeRect(blockX + 2, blockY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4)
      }
    })
  })
}

function draw() {
  ctx.value.fillStyle = '#1c1a49' // Tailwind bg-gray-800
  ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height)

  // Draw grid
  grid.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell !== 0) {
        ctx.value.fillStyle = colorShades[cell.type][cell.shade - 1]
        const blockX = x * BLOCK_SIZE
        const blockY = y * BLOCK_SIZE
        ctx.value.fillRect(blockX, blockY, BLOCK_SIZE, BLOCK_SIZE)

        // Add borders for grid blocks too
        ctx.value.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.value.lineWidth = 1
        ctx.value.strokeRect(blockX + 1, blockY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2)
        ctx.value.strokeStyle = 'rgba(0, 0, 0, 0.2)'
        ctx.value.strokeRect(blockX + 2, blockY + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4)
      }
    })
  })

  // Draw current piece
  if (currentPiece) {
    drawMatrix(currentPiece.matrix, currentPiece.pos, currentPiece.shadedMatrix)
  }
}

function merge(grid, piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0 && y + piece.pos.y >= 0) {
        grid[y + piece.pos.y][x + piece.pos.x] = {
          type: value,
          shade: piece.shadedMatrix[y][x]
        }
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
            gridY < 0 || // Above the grid is allowed
            gridY >= ROWS || // Below the grid
            gridX < 0 || // Left of the grid
            gridX >= COLS || // Right of the grid
            (gridY >= 0 && grid[gridY][gridX] !== 0) // Occupied cell
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
    const row = grid.splice(y, 1)[0]
    grid.unshift(new Array(COLS).fill(0))
    score.value += 10
    ++y // Check the same row again as we moved everything down
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

function playerRotate() {
  const originalMatrix = currentPiece.matrix
  const originalShaded = currentPiece.shadedMatrix

  // Rotate both matrices
  currentPiece.matrix = rotate(currentPiece.matrix)
  currentPiece.shadedMatrix = rotate(currentPiece.shadedMatrix)

  if (collide(grid, currentPiece)) {
    // Revert if collision
    currentPiece.matrix = originalMatrix
    currentPiece.shadedMatrix = originalShaded
  }
}

function handleKey(e) {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "W", "s", "S",
    "a", "A", "d", "D", "ц", "Ц", "і", "І", "ф", "Ф", "в", "В"].includes(e.key)) {
    e.preventDefault()
  }

  if (!isRunning.value || !currentPiece) return

  if (["ArrowLeft", "a", "A", "ф", "Ф"].includes(e.key)) {
    move(-1)
  }

  if (["ArrowRight", "d", "D", "в", "В"].includes(e.key)) {
    move(1)
  }

  if (["ArrowDown", "s", "S", "і", "І"].includes(e.key)) {
    playerDrop()
  }

  if (["ArrowUp", "w", "W", "ц", "Ц"].includes(e.key)) {
    playerRotate()
  }
}

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
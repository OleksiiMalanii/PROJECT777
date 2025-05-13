<template>
  <div class="text-green-700 dark:text-white text-center font-bold text-xl mb-2">
    Таймер: {{ formattedTime }}
  </div>
  <div
      class="mx-auto my-4 p-2 rounded-2xl transition-colors duration-500 bg-green-800 dark:bg-gray-700"
      :style="{
      width: `${difficulty.cols * tileSize + (difficulty.cols - 1) + (gapSize * difficulty.cols)}px`,
      height: `${difficulty.rows * tileSize + (difficulty.rows - 1) + (gapSize * difficulty.rows)}px`,
    }"
  >
    <div
        id="board"
        class="grid gap-[3px]"
        :style="{
        gridTemplateColumns: `repeat(${difficulty.cols}, ${tileSize}px)`,
        gridTemplateRows: `repeat(${difficulty.rows}, ${tileSize}px)`
      }"
    >
      <div
          v-for="(tile, index) in boardFlat"
          :key="index"
          :class="[
          'tile',
          tile.isClicked ? 'revealed' : '',
          tile.isFlagged ? 'flagged' : '',
          getTileColor(tile)
        ]"
          @click="handleTileClick(tile.x, tile.y)"
          @contextmenu.prevent="toggleFlag(tile.x, tile.y)"
      >
        <span v-if="tile.isClicked && !tile.isMine && tile.numNeighborMines > 0">
          {{ tile.numNeighborMines }}
        </span>
        <span v-if="tile.isClicked && tile.isMine">💣</span>
      </div>
    </div>
  </div>

  <div class="text-center mt-4 flex justify-center gap-4">
    <button
        @click="resetGame"
        class="px-6 py-2 bg-green-600 dark:bg-primary text-green-200 rounded-2xl dark:text-white hover:bg-green-800 transition hover:dark:bg-primary-dark"
    >
      {{ firstButton }}
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
import { useUserStore } from '@/stores/userStore'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const timer = ref(0)
const tileSize = 40
const gapSize = 3
const userStore = useUserStore()
const router = useRouter()
const firstButton = ref("Нова Гра")

const formattedTime = computed(() => {
  const minutes = Math.floor(timer.value / 60)
  const seconds = timer.value % 60
  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(seconds).padStart(2, '0')
  return `${paddedMinutes}:${paddedSeconds}`
})


let timerInterval = null
const difficulty_presets = {
  easy: { rows: 9, cols: 9, mines: 9 },
  mid: { rows: 9, cols: 18, mines: 20 },
  hard: { rows: 12, cols: 24, mines: 60 }
}

const difficulty = ref(difficulty_presets.mid)
const grid = ref([])
const playing = ref(true)
const firstClick = ref(true)
const wifemode = ref(false)

class Square {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.isClicked = false
    this.isFlagged = false
    this.isMine = false
    this.isExplodedMine = false
    this.numNeighborMines = 0
  }
}

function createGrid() {
  const g = []
  for (let i = 0; i < difficulty.value.rows; i++) {
    g[i] = []
    for (let j = 0; j < difficulty.value.cols; j++) {
      g[i][j] = new Square(i, j)
    }
  }
  grid.value = g
}

function placeMines(firstX, firstY) {
  const forbidden = new Set()
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const ni = firstX + i
      const nj = firstY + j
      if (ni >= 0 && ni < difficulty.value.rows && nj >= 0 && nj < difficulty.value.cols) {
        forbidden.add(`${ni},${nj}`)
      }
    }
  }

  let placedMines = 0
  while (placedMines < difficulty.value.mines) {
    let x = Math.floor(Math.random() * difficulty.value.rows)
    let y = Math.floor(Math.random() * difficulty.value.cols)
    if (!grid.value[x][y].isMine && !forbidden.has(`${x},${y}`)) {
      grid.value[x][y].isMine = true
      placedMines++
    }
  }
}

function countNeighborMines() {
  for (let i = 0; i < difficulty.value.rows; i++) {
    for (let j = 0; j < difficulty.value.cols; j++) {
      if (!grid.value[i][j].isMine) {
        let count = 0
        for (let di = -1; di <= 1; di++) {
          for (let dj = -1; dj <= 1; dj++) {
            const ni = i + di
            const nj = j + dj
            if (
                ni >= 0 && ni < difficulty.value.rows &&
                nj >= 0 && nj < difficulty.value.cols &&
                grid.value[ni][nj].isMine
            ) {
              count++
            }
          }
        }
        grid.value[i][j].numNeighborMines = count
      }
    }
  }
}

function revealTile(x, y) {
  const tile = grid.value[x][y]
  if (tile.isClicked || tile.isFlagged) return

  tile.isClicked = true
  tile.isFlagged = false

  if (tile.numNeighborMines === 0 && !tile.isMine) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const ni = x + dx
        const nj = y + dy
        if (ni >= 0 && ni < difficulty.value.rows && nj >= 0 && nj < difficulty.value.cols) {
          revealTile(ni, nj)
        }
      }
    }
  }
}

function handleTileClick(x, y) {
  if (!playing.value) return
  const tile = grid.value[x][y]
  if (tile.isFlagged) return  // Prevent activating flagged tile

  firstButton.value = "Заново"
  if (firstClick.value) {
    createGrid()
    do {
      placeMines(x, y)
    } while (grid.value[x][y].isMine && !wifemode.value)

    countNeighborMines()
    firstClick.value = false
    startTimer() // 🕒 Start timer
  }

  revealTile(x, y)

  if (grid.value[x][y].isMine) {
    grid.value[x][y].isExplodedMine = true
    revealAllMines()
    playing.value = false
    stopTimer() // 💥 Stop timer
  } else if (checkWin()) {
    playing.value = false
    stopTimer() // 🎉 Stop timer
  }
}

function startTimer() {
  timer.value = 0
  timerInterval = setInterval(() => {
    timer.value++
  }, 1000)
}

function stopTimer() {
  if (timerInterval) clearInterval(timerInterval)
  firstButton.value = "Нова Гра"
}

function toggleFlag(x, y) {
  if (!playing.value) return
  const tile = grid.value[x][y]
  if (!tile.isClicked) {
    tile.isFlagged = !tile.isFlagged
  }
}

function revealAllMines() {
  for (let row of grid.value) {
    for (let tile of row) {
      if (tile.isMine) {
        tile.isClicked = true
      }
    }
  }
}

function checkWin() {
  for (let row of grid.value) {
    for (let tile of row) {
      if (!tile.isMine && !tile.isClicked) return false
    }
  }
  return true
}

function resetGame() {
  stopTimer()
  timer.value = 0
  playing.value = true
  firstClick.value = true
  createGrid()
}

const boardFlat = computed(() => grid.value.flat())

function getTileColor(tile) {
  if (tile.isExplodedMine) return 'bg-red-600'
  if (tile.isMine && tile.isClicked) return 'bg-black'
  if (tile.isClicked) return 'bg-yellow-300'
  if (tile.isFlagged) return 'bg-red-500'
  return 'bg-green-500'
}

function exitGame(){userStore.addGameToHistory('Candy Crush',0);router.push('/')}

createGrid()
</script>

<style>
.tile {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: black;
  user-select: none;
  cursor: pointer;
  border-radius: 6px;
}

.tile.revealed {
  background-color: #e4cfa1;
  cursor: default;
}

.tile.bg-green-500:hover,
.tile.bg-red-500:hover {
  filter: brightness(0.75);
}

.tile.flagged {
  background-color: red !important;
}
</style>
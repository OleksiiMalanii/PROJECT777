<template>
  <section class="flex h-screen bg-gradient-to-t from-gray-900 to-indigo-950 text-white sci-fi-font overflow-hidden">
    <!-- Game Field Left -->
    <div class="flex flex-col justify-center items-center flex-grow p-4">
      <p class="text-lg mb-1">Timer: {{ formattedTime }}</p>
      <p class="text-lg mb-4">Flags: {{ flagCount }}/{{ difficulty.mines }}</p>
      <div
          class="rounded-2xl  p-2"
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
              :class="['tile', tile.isClicked ? 'revealed' : '', tile.isFlagged ? 'flagged' : '', getTileColor(tile)]"
              @click="handleTileClick(tile.x, tile.y)"
              @contextmenu.prevent="toggleFlag(tile.x, tile.y)"
          >
            <span v-if="tile.isClicked && !tile.isMine && tile.numNeighborMines > 0">
              {{ tile.numNeighborMines }}
            </span>
            <span v-if="tile.isClicked && tile.isMine">
              {{ tile.isExplodedMine ? '💥' : '💣' }}
            </span>
          </div>
        </div>
      </div>
      <p class="text-red-500 font-bold mt-4">{{ gameOver }}</p>
    </div>

    <!-- Game Info Right -->
    <div class="w-full md:w-1/3 p-6 flex flex-col justify-center space-y-6 border-l border-white/10">
      <h2 class="text-3xl font-bold">Minesweeper</h2>
      <p class="text-sm">By: <span class="text-orange-400">Denys Novosad</span></p>

      <!-- Difficulty -->
      <div class="flex gap-2">
        <button
            @click="setDifficulty('easy')"
            class="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 transition"
        >
          Easy
        </button>
        <button
            @click="setDifficulty('mid')"
            class="px-4 py-2 rounded-full bg-yellow-600 hover:bg-yellow-700 transition"
        >
          Medium
        </button>
        <button
            @click="setDifficulty('hard')"
            class="px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 transition"
        >
          Hard
        </button>
      </div>

      <!-- Controls -->
      <div class="flex gap-4">
        <button
            @click="resetGame"
            class="flex-1 px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 transition"
        >
          {{ firstButton }}
        </button>
        <button
            @click="exitGame"
            class="flex-1 px-4 py-2 rounded-full bg-red-500 hover:bg-red-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
//import { useUserStore } from '/stores/userStore'
import { giveBadge } from '/src/utils/badgeUtils';
import { saveRecord } from '/src/utils/records.js' // adjust path if needed

import { getAuth } from "firebase/auth"

const router = useRouter()
//const userStore = useUserStore()

const tileSize = 40
const gapSize = 3
const timer = ref(0)
const timerInterval = ref(null)

const difficulty_presets = {
  easy: { rows: 9, cols: 9, mines: 9 },
  mid: { rows: 9, cols: 18, mines: 20 },
  hard: { rows: 11, cols: 19, mines: 40 }
}

const difficulty = ref(difficulty_presets.mid)
const grid = ref([])
const playing = ref(true)
const firstClick = ref(true)
const wifemode = ref(false)
const gameOver = ref("")
const firstButton = ref("New Game")

const formattedTime = computed(() => {
  const minutes = Math.floor(timer.value / 60)
  const seconds = timer.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

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
            const ni = i + di, nj = j + dj
            if (ni >= 0 && ni < difficulty.value.rows && nj >= 0 && nj < difficulty.value.cols) {
              if (grid.value[ni][nj].isMine) count++
            }
          }
        }
        grid.value[i][j].numNeighborMines = count
      }
    }
  }
}

function getDifficultyLabel() {
  switch (difficulty.value.mines) {
    case 9:
      return 'easy'
    case 20:
      return 'medium'
    case 40:
      return 'hard'
    default:
      return 'custom'
  }
}

function handleTileClick(x, y) {
  if (!playing.value || grid.value[x][y].isFlagged) return

  firstButton.value = "Restart"
  if (firstClick.value) {
    createGrid()
    do {
      placeMines(x, y)
    } while (grid.value[x][y].isMine && !wifemode.value)

    countNeighborMines()
    startTimer()
    firstClick.value = false
  }

  revealTile(x, y)

  if (grid.value[x][y].isMine) {
    grid.value[x][y].isExplodedMine = true
    revealAllMines()
    gameOver.value = "You've lost!"
    stopTimer()
    playing.value = false
  } else if (checkWin()) {
    gameOver.value = "Congrats! You've won!"
    stopTimer()
    playing.value = false

    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      checkAndAwardBadges(user.uid, getDifficultyLabel(), timer.value);

      saveRecord("minesweeper", timer.value, getDifficultyLabel(), false)
    }
  }
}

async function checkAndAwardBadges(userId, difficulty, timeElapsed) {
  try {
    if (difficulty === "medium" && timeElapsed < 40) {
      await giveBadge(userId, 'minesweeper', 'fasthead');
    }

    if (difficulty === "hard") {
      await giveBadge(userId, 'minesweeper', 'survivor');
    }
  } catch (error) {
    console.error('Badge check failed:', error);
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

function toggleFlag(x, y) {
  if (!playing.value) return
  const tile = grid.value[x][y]
  if (!tile.isClicked) {
    tile.isFlagged = !tile.isFlagged
  }
}

function revealAllMines() {
  grid.value.flat().forEach(tile => {
    if (tile.isMine) tile.isClicked = true
  })
}

function checkWin() {
  return grid.value.flat().every(tile => tile.isMine || tile.isClicked)
}

function resetGame() {
  stopTimer()
  gameOver.value = ""
  playing.value = true
  firstClick.value = true
  createGrid()
}

function setDifficulty(level) {
  difficulty.value = difficulty_presets[level]
  resetGame()
}

function startTimer() {
  timer.value = 0
  timerInterval.value = setInterval(() => timer.value++, 1000)
}

function stopTimer() {
  clearInterval(timerInterval.value)
  timerInterval.value = null
  firstButton.value = "New Game"
}

function exitGame() {
  //userStore.addGameToHistory('Minesweeper', 0)
  router.push('/games')
}

const boardFlat = computed(() => grid.value.flat())

function getTileColor(tile) {
  if (tile.isExplodedMine) return 'bg-red-600'
  if (tile.isMine && tile.isClicked) return 'bg-black'
  if (tile.isClicked) return 'bg-yellow-300'
  if (tile.isFlagged) return 'bg-red-500'
  return 'bg-green-500'
}

const flagCount = computed(() => {
  return grid.value.flat().filter(tile => tile.isFlagged).length
})

createGrid()
</script>

<style scoped>
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
}
.tile.bg-green-500:hover,
.tile.bg-red-500:hover {
  filter: brightness(0.75);
}
</style>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-background dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
        <div class="text-center mt-2 mb-4 text-lg text-primary-dark dark:text-gray-200">
            <h1 class="text-4xl font-bold mb-2 text-primary dark:text-white">Tetris</h1>
            <p class="text-center max-w-xl text-gray-600 dark:text-gray-300 mb-6">
                Enjoy the classic block-stacking game! Use the arrow keys to control the pieces. Stack them up and clear
                lines to score points.
            </p>
        </div>
        
        <div class="flex flex-col items-center gap-4 p-6 rounded-2xl shadow-card bg-primary dark:bg-gray-800">
            <p class="text-xl font-semibold text-white dark:text-white">Score: {{ score }}</p>
            <canvas ref="canvas" width="288" height="480" class="border-4 border-primary dark:border-gray-300"></canvas>
            <button @click="startGame" :disabled="!isGameOver && animationFrameId" 
                class="mt-4 px-6 py-2 text-white rounded-2xl transition transform bg-primary-dark hover:brightness-110 hover:scale-105 dark:bg-gray-700 dark:hover:brightness-125 disabled:opacity-50 disabled:cursor-not-allowed">
                Start Game
            </button>
        </div>

        <!-- Game Over Popup -->
        <div v-if="showGameOver" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-background dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-80 text-center space-y-4">
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white">Game Over</h2>
                <p class="text-gray-600 dark:text-gray-300">The board is full.</p>
                <button @click="startGame" class="mt-2 mr-2 px-6 py-2 bg-primary-dark text-white rounded-xl hover:brightness-110 transition transform hover:scale-105 dark:bg-gray-700 dark:hover:brightness-125">
                    Restart
                </button>
                <button @click="goHome" class="mt-2 px-6 py-2 bg-gray-500 text-white rounded-xl hover:brightness-110 transition transform hover:scale-105 dark:bg-gray-600 dark:hover:brightness-125">
                    Home
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const canvas = ref(null)
const ctx = ref(null)
const score = ref(0)

const isDark = ref(false)

const COLS = 12
const ROWS = 20
const BLOCK_SIZE = 24

let grid = []
let currentPiece = null
let dropCounter = 0
let lastTime = 0
let animationFrameId = null
const isGameOver = ref(false)
const showGameOver = ref(false)
const gameSaved = ref(false)

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

function updateTheme() {
    isDark.value = document.documentElement.classList.contains('dark')
}

onMounted(() => {
    updateTheme()
    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
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
    ctx.value.fillStyle = isDark.value ? '#1F2937' : '#E1EEBC'
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
                (
                    !grid[y + pos.y] ||
                    grid[y + pos.y][x + pos.x] !== 0
                )
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
            isGameOver.value = true // FIXED
            cancelAnimationFrame(animationFrameId)
            animationFrameId = null
            showGameOver.value = true

                if (!gameSaved.value) {
        userStore.addGameToHistory('Tetris', score.value)
        gameSaved.value = true
    }   
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
        isGameOver.value = true // FIXED
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
        showGameOver.value = true

        if (!gameSaved.value) {
        userStore.addGameToHistory('Tetris', score.value)
        gameSaved.value = true
    }
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
    if (isGameOver.value) return
    const deltaTime = time - lastTime
    lastTime = time
    dropCounter += deltaTime
    if (dropCounter > 250) {
        playerDrop()
    }
    draw()
    animationFrameId = requestAnimationFrame(update)
}

function startGame() {
    if (isGameOver.value && !gameSaved.value && score.value != null) {
        userStore.addGameToHistory('Tetris', score.value)
        gameSaved.value = true
    }
    showGameOver.value = false
    isGameOver.value = false
    gameSaved.value = false
    grid = createMatrix(COLS, ROWS)
    score.value = 0


    playerReset()
    lastTime = 0
    dropCounter = 0
    if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(update)
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
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)) {
        e.preventDefault()
    }
    if (isGameOver.value || !currentPiece) return
    if (e.key === 'ArrowLeft') move(-1)
    if (e.key === 'ArrowRight') move(1)
    if (e.key === 'ArrowDown') playerDrop()
    if (e.key === 'ArrowUp') playerRotate()
}

onMounted(() => {
    ctx.value = canvas.value.getContext('2d')
    document.addEventListener('keydown', handleKey)
})

function goHome() {
    if (!gameSaved.value) {
        userStore.addGameToHistory('Tetris', score.value)
        gameSaved.value = true
    }
    router.push('/')
}

</script>

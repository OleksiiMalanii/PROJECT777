<template>
  <div
      class="mx-auto my-4 p-2 bg-green-600 dark:bg-gray-800
           border-4 border-green-800 dark:border-primary-light
           rounded-2xl w-[340px] overflow-hidden"
      style="width: 505px; height: 505px; "
  >
    <div
        id="game-board"
        class="grid"
        style="width: 480px; height: 480px; margin: 0 auto; position: relative; background: none"
    ></div>
  </div>

  <div class="text-center mt-4">
    <button
        @click="endGame"
        class="px-6 py-2 bg-green-600 dark:bg-primary text-green-400 dark:text-white rounded-2xl hover:bg-green-800 hover:dark:bg-primary-dark transition"
    >
      Завершити гру та зберегти
    </button>
  </div>

  <div class="text-center mt-2 mb-8 text-lg text-green-800 dark:text-gray-200">
    Score: {{ score }}
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const score = ref(0)

// Розміри гри
const CELL_SIZE = 30
const GRID_WIDTH = 16
const GRID_HEIGHT = 16

// Змінні для гри
let gameBoard
let gameInterval
let snake = []
let direction = 'right'
let nextDirection = 'right'
let food = {}
let gameActive = false
let foodElement = null

// Кольори для змійки (градієнт)
const snakeColors = [
  '#00BFFF',  // Deep Sky Blue (голова)
  '#1CB0FF',  // Близький до першого, але трохи світліший
  '#00A5FF',  // Трохи темніший за перший
  '#0095FF',  // Ще трохи темніший
  '#0085FF'   // Найтемніший у цій послідовності
]

// Кольори для клітинок поля
const boardColors = {
  light: '#009000',
  dark: '#008000'
}

// ініціалізація гри
function startGame() {
  // Очистка попередньої гри, якщо є
  if (gameInterval) {
    clearInterval(gameInterval)
  }

  // Створення ігрової дошки
  gameBoard = document.getElementById('game-board')
  gameBoard.innerHTML = ''
  gameBoard.style.display = 'grid'
  gameBoard.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, ${CELL_SIZE}px)`
  gameBoard.style.gridTemplateRows = `repeat(${GRID_HEIGHT}, ${CELL_SIZE}px)`

  // Створення клітинок
  for (let i = 0; i < GRID_WIDTH * GRID_HEIGHT; i++) {
    const cell = document.createElement('div')
    cell.style.width = `${CELL_SIZE}px`
    cell.style.height = `${CELL_SIZE}px`
    cell.id = `cell-${i}`

    // Встановлюємо шаховий фон для клітинок
    const x = i % GRID_WIDTH
    const y = Math.floor(i / GRID_WIDTH)
    cell.style.backgroundColor = (x + y) % 2 === 0 ? boardColors.light : boardColors.dark

    gameBoard.appendChild(cell)
  }

  // Ініціалізація змійки
  snake = [
    { x: 5, y: 10 },
    { x: 4, y: 10 },
    { x: 3, y: 10 }
  ]

  direction = 'right'
  nextDirection = 'right'
  score.value = 0
  gameActive = true

  // Створення першої їжі
  createFood()

  // Оновлення стану гри з інтервалом
  gameInterval = setInterval(updateGame, 100)

  // Додавання обробників клавіш
  document.addEventListener('keydown', handleKeyPress)

  // Додавання обробників для мобільних пристроїв
  addMobileControls()

  // Одразу відмалювати змійку
  renderGame()
}

// Обробка натискання клавіш
function handleKeyPress(event) {
  switch(event.key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
    case 'ц':
    case 'Ц':
      if (direction !== 'down') nextDirection = 'up'
      break
    case 'ArrowDown':
    case 's':
    case 'S':
    case 'і':
    case 'І':
      if (direction !== 'up') nextDirection = 'down'
      break
    case 'ArrowLeft':
    case 'a':
    case 'A':
    case 'ф':
    case 'Ф':
      if (direction !== 'right') nextDirection = 'left'
      break
    case 'ArrowRight':
    case 'd':
    case 'D':
    case 'в':
    case 'В':
      if (direction !== 'left') nextDirection = 'right'
      break
    case ' ':  // Пауза по пробілу
      togglePause()
      break
  }
}

// Додавання функції паузи
let isPaused = false
function togglePause() {
  if (!gameActive) return

  isPaused = !isPaused

  if (isPaused) {
    clearInterval(gameInterval)
    showPauseMessage()
  } else {
    gameInterval = setInterval(updateGame, 100)
    removePauseMessage()
  }
}

function showPauseMessage() {
  const pauseMsg = document.createElement('div')
  pauseMsg.textContent = 'ПАУЗА'
  pauseMsg.id = 'pause-message'
  pauseMsg.style.position = 'absolute'
  pauseMsg.style.top = '50%'
  pauseMsg.style.left = '50%'
  pauseMsg.style.transform = 'translate(-50%, -50%)'
  pauseMsg.style.color = 'white'
  pauseMsg.style.fontSize = '32px'
  pauseMsg.style.fontWeight = 'bold'
  pauseMsg.style.textShadow = '0 0 10px black'
  pauseMsg.style.zIndex = '10'

  gameBoard.appendChild(pauseMsg)
}

function removePauseMessage() {
  const pauseMsg = document.getElementById('pause-message')
  if (pauseMsg) {
    pauseMsg.remove()
  }
}

// Додавання мобільних контролів
function addMobileControls() {
  // Створення контейнера для контролів
  const controlsContainer = document.createElement('div')
  controlsContainer.id = 'mobile-controls'
  controlsContainer.style.position = 'absolute'
  controlsContainer.style.bottom = '20px'
  controlsContainer.style.left = '50%'
  controlsContainer.style.transform = 'translateX(-50%)'
  controlsContainer.style.display = 'grid'
  controlsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)'
  controlsContainer.style.gridTemplateRows = 'repeat(3, 1fr)'
  controlsContainer.style.gap = '10px'
  controlsContainer.style.width = '150px'
  controlsContainer.style.height = '150px'
  controlsContainer.style.opacity = '0.7'
  controlsContainer.style.zIndex = '100'

  // Створення кнопок
  const directions = [
    { x: 1, y: 0, dir: 'up', arrow: '↑' },
    { x: 0, y: 1, dir: 'left', arrow: '←' },
    { x: 2, y: 1, dir: 'right', arrow: '→' },
    { x: 1, y: 2, dir: 'down', arrow: '↓' }
  ]

  directions.forEach(d => {
    const btn = document.createElement('button')
    btn.style.backgroundColor = 'rgba(0, 100, 0, 0.8)'
    btn.style.border = '2px solid white'
    btn.style.borderRadius = '50%'
    btn.style.color = 'white'
    btn.style.fontSize = '24px'
    btn.style.fontWeight = 'bold'
    btn.style.width = '40px'
    btn.style.height = '40px'
    btn.style.cursor = 'pointer'
    btn.style.gridColumnStart = d.x + 1
    btn.style.gridRowStart = d.y + 1
    btn.style.display = 'flex'
    btn.style.justifyContent = 'center'
    btn.style.alignItems = 'center'
    btn.textContent = d.arrow

    btn.addEventListener('click', () => {
      switch(d.dir) {
        case 'up':
          if (direction !== 'down') nextDirection = 'up'
          break
        case 'down':
          if (direction !== 'up') nextDirection = 'down'
          break
        case 'left':
          if (direction !== 'right') nextDirection = 'left'
          break
        case 'right':
          if (direction !== 'left') nextDirection = 'right'
          break
      }
    })

    controlsContainer.appendChild(btn)
  })

  // Додаємо кнопку паузи в центр
  const pauseBtn = document.createElement('button')
  pauseBtn.style.backgroundColor = 'rgba(50, 50, 50, 0.8)'
  pauseBtn.style.border = '2px solid white'
  pauseBtn.style.borderRadius = '50%'
  pauseBtn.style.color = 'white'
  pauseBtn.style.fontSize = '16px'
  pauseBtn.style.width = '40px'
  pauseBtn.style.height = '40px'
  pauseBtn.style.gridColumnStart = 2
  pauseBtn.style.gridRowStart = 2
  pauseBtn.style.display = 'flex'
  pauseBtn.style.justifyContent = 'center'
  pauseBtn.style.alignItems = 'center'
  pauseBtn.textContent = '⏸'
  pauseBtn.style.cursor = 'pointer'

  pauseBtn.addEventListener('click', togglePause)

  controlsContainer.appendChild(pauseBtn)

  gameBoard.appendChild(controlsContainer)
}

// Оновлення стану гри
function updateGame() {
  if (!gameActive || isPaused) return

  // Оновлення напрямку
  direction = nextDirection

  // Обчислення нової позиції голови змійки
  const head = { ...snake[0] }

  switch(direction) {
    case 'up':
      head.y--
      break
    case 'down':
      head.y++
      break
    case 'left':
      head.x--
      break
    case 'right':
      head.x++
      break
  }

  // Перевірка на зіткнення з краями
  if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
    gameOver()
    return
  }

  // Перевірка на зіткнення з самою собою
  for (let i = 0; i < snake.length; i++) {
    if (snake[i].x === head.x && snake[i].y === head.y) {
      gameOver()
      return
    }
  }

  // Додавання нової голови
  snake.unshift(head)

  // Перевірка, чи з'їла змійка їжу
  if (head.x === food.x && head.y === food.y) {
    // Збільшення рахунку
    score.value += 10

    // Створення нової їжі
    createFood()

    // Додаємо ефект спалаху на екрані
    flashScreen()
  } else {
    // Якщо їжа не з'їдена, видаляємо останній сегмент змійки
    snake.pop()
  }

  // Оновлення відображення
  renderGame()
}

// Ефект спалаху при поїданні яблука
function flashScreen() {
  const flash = document.createElement('div')
  flash.style.position = 'absolute'
  flash.style.top = '0'
  flash.style.left = '0'
  flash.style.width = '100%'
  flash.style.height = '100%'
  flash.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'
  flash.style.pointerEvents = 'none'
  flash.style.zIndex = '5'
  flash.style.animation = 'flash 0.3s forwards'

  gameBoard.appendChild(flash)

  setTimeout(() => {
    flash.remove()
  }, 300)
}

// Створення їжі на дошці
function createFood() {
  let foodLocation
  let onSnake = true

  // Генерація їжі у випадковому місці, але не на змійці
  while (onSnake) {
    foodLocation = {
      x: Math.floor(Math.random() * GRID_WIDTH),
      y: Math.floor(Math.random() * GRID_HEIGHT)
    }

    onSnake = snake.some(segment =>
        segment.x === foodLocation.x && segment.y === foodLocation.y
    )
  }

  food = foodLocation

  // Видаляємо попереднє яблуко, якщо воно існує
  if (foodElement) {
    foodElement.remove()
  }

  // Створюємо нове яблуко
  const foodIndex = food.y * GRID_WIDTH + food.x
  const foodCell = document.getElementById(`cell-${foodIndex}`)

  // Зберігаємо початковий колір клітинки
  const originalBgColor = foodCell.style.backgroundColor

  foodElement = document.createElement('img')
  foodElement.src = '/src/assets/img/snakegame/apple.svg'
  foodElement.style.width = '100%'
  foodElement.style.height = '100%'
  foodElement.className = 'apple-animation'
  foodElement.style.position = 'relative'
  foodElement.style.zIndex = '2'

  // Очищаємо клітинку перед додаванням нового яблука
  foodCell.innerHTML = ''
  foodCell.appendChild(foodElement)
}

// Відображення гри
function renderGame() {
  // Відновлення шахового фону для всіх клітинок
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      const cellIndex = y * GRID_WIDTH + x
      const cell = document.getElementById(`cell-${cellIndex}`)

      // Перевіряємо, чи це не клітинка з їжею
      if (!(x === food.x && y === food.y && foodElement && foodElement.parentElement === cell)) {
        cell.innerHTML = ''
      }

      // Відновлюємо шаховий візерунок фону
      cell.style.backgroundColor = (x + y) % 2 === 0 ? boardColors.light : boardColors.dark
      cell.style.borderRadius = '0'
    }
  }

  // Відображення змійки
  snake.forEach((segment, index) => {
    const cellIndex = segment.y * GRID_WIDTH + segment.x
    const cell = document.getElementById(`cell-${cellIndex}`)
    const colorIndex = Math.min(Math.floor(index / 2), snakeColors.length - 1)

    // Створюємо окремий елемент для сегмента змійки
    const snakeSegment = document.createElement('div')
    snakeSegment.style.width = '100%'
    snakeSegment.style.height = '100%'
    snakeSegment.style.position = 'relative'
    snakeSegment.style.zIndex = '3'  // Вище фону, але нижче ефектів
    snakeSegment.className = 'snake-segment'

    // Голова змійки
    if (index === 0) {
      snakeSegment.style.backgroundColor = snakeColors[0]
      snakeSegment.innerHTML = '<div style="font-size: 12px; text-align: center; position: relative; z-index: 4;">👀</div>'

      // Напрямок для голови
      let borderRadius = ''

      if (direction === 'right') {
        borderRadius = '10px 50% 50% 10px'
      } else if (direction === 'left') {
        borderRadius = '50% 10px 10px 50%'
      } else if (direction === 'up') {
        borderRadius = '50% 50% 10px 10px'
      } else if (direction === 'down') {
        borderRadius = '10px 10px 50% 50%'
      }

      snakeSegment.style.borderRadius = borderRadius
    }
    // Хвіст (закруглений кінець)
    else if (index === snake.length - 1) {
      snakeSegment.style.backgroundColor = snakeColors[colorIndex]

      // Визначаємо напрямок для хвоста
      const prevSegment = snake[index - 1]
      let borderRadius = ''

      if (prevSegment.x > segment.x) {  // Хвіст ліворуч від попереднього сегмента
        borderRadius = '50% 10px 10px 50%'
      } else if (prevSegment.x < segment.x) {  // Хвіст праворуч
        borderRadius = '10px 50% 50% 10px'
      } else if (prevSegment.y > segment.y) {  // Хвіст вгорі
        borderRadius = '50% 50% 10px 10px'
      } else if (prevSegment.y < segment.y) {  // Хвіст внизу
        borderRadius = '10px 10px 50% 50%'
      }

      snakeSegment.style.borderRadius = borderRadius
    }
    // Тіло змійки
    else {
      snakeSegment.style.backgroundColor = snakeColors[colorIndex]
      snakeSegment.style.borderRadius = '4px'

      // Визначаємо форму для тіла (на поворотах)
      const prevSegment = snake[index - 1]
      const nextSegment = snake[index + 1]

      // Перевірка на поворот
      if ((prevSegment.x !== nextSegment.x) && (prevSegment.y !== nextSegment.y)) {
        // Визначаємо тип повороту і встановлюємо відповідний радіус
        if ((prevSegment.x > segment.x && nextSegment.y > segment.y) ||
            (prevSegment.y > segment.y && nextSegment.x > segment.x)) {
          // Поворот вниз-праворуч
          snakeSegment.style.borderRadius = '0 0 50% 0'
        } else if ((prevSegment.x < segment.x && nextSegment.y > segment.y) ||
            (prevSegment.y > segment.y && nextSegment.x < segment.x)) {
          // Поворот вниз-ліворуч
          snakeSegment.style.borderRadius = '0 0 0 50%'
        } else if ((prevSegment.x > segment.x && nextSegment.y < segment.y) ||
            (prevSegment.y < segment.y && nextSegment.x > segment.x)) {
          // Поворот вгору-праворуч
          snakeSegment.style.borderRadius = '0 50% 0 0'
        } else if ((prevSegment.x < segment.x && nextSegment.y < segment.y) ||
            (prevSegment.y < segment.y && nextSegment.x < segment.x)) {
          // Поворот вгору-ліворуч
          snakeSegment.style.borderRadius = '50% 0 0 0'
        }
      }
    }

    // Видаляємо старий вміст і додаємо новий сегмент
    if (cell.childElementCount === 0 || !cell.querySelector('.snake-segment')) {
      cell.appendChild(snakeSegment)
    } else {
      // Якщо вже є елемент змійки, оновлюємо його стилі
      const existingSegment = cell.querySelector('.snake-segment')
      existingSegment.style.backgroundColor = snakeSegment.style.backgroundColor
      existingSegment.style.borderRadius = snakeSegment.style.borderRadius
      existingSegment.innerHTML = snakeSegment.innerHTML
    }
  })

  // Переконуємося, що яблуко залишається видимим
  if (foodElement && foodElement.parentElement) {
    foodElement.style.zIndex = '4'  // Вище змійки
  }
}

function gameOver() {
  gameActive = false
  clearInterval(gameInterval)
  document.removeEventListener('keydown', handleKeyPress)

  // 1. Прибираємо очі з голови
  const head = snake[0]
  const headCell = document.getElementById(`cell-${head.y * GRID_WIDTH + head.x}`)
  const headSegment = headCell.querySelector('.snake-segment')
  if (headSegment) {
    headSegment.innerHTML = ''
  }

  // 2. Миготіння всієї змійки червоним кольором
  const blinkInterval = setInterval(() => {
    snake.forEach(segment => {
      const cell = document.getElementById(`cell-${segment.y * GRID_WIDTH + segment.x}`)
      const snakeSegment = cell.querySelector('.snake-segment')
      if (snakeSegment) {
        if (snakeSegment.style.backgroundColor === 'red') {
          // Повертаємо початковий колір
          const index = snake.findIndex(s => s.x === segment.x && s.y === segment.y)
          const colorIndex = Math.min(Math.floor(index / 2), snakeColors.length - 1)
          snakeSegment.style.backgroundColor = index === 0 ? snakeColors[0] : snakeColors[colorIndex]
        } else {
          snakeSegment.style.backgroundColor = 'red'
        }
      }
    })
  }, 200)

  // 3. Поступове зникнення сегментів (з хвоста до голови)
  let vanishDelay = 0
  for (let i = snake.length - 1; i >= 0; i--) {
    setTimeout(() => {
      const segment = snake[i]
      const cell = document.getElementById(`cell-${segment.y * GRID_WIDTH + segment.x}`)
      const snakeSegment = cell.querySelector('.snake-segment')
      if (snakeSegment) {
        snakeSegment.style.animation = 'vanish 0.3s forwards'
      }
    }, vanishDelay)
    vanishDelay += 100 // Кожен наступний сегмент зникає через 100мс
  }

  // Зупиняємо миготіння після завершення анімації
  setTimeout(() => {
    clearInterval(blinkInterval)
    showGameOverScreen()
  }, vanishDelay)
}

function showGameOverScreen() {
  // Показуємо "GAME OVER" і кнопки рестарту та збереження
  const gameOverScreen = document.createElement('div')
  gameOverScreen.style.position = 'absolute'
  gameOverScreen.style.top = '0'
  gameOverScreen.style.left = '0'
  gameOverScreen.style.width = '100%'
  gameOverScreen.style.height = '100%'
  gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'
  gameOverScreen.style.display = 'flex'
  gameOverScreen.style.flexDirection = 'column'
  gameOverScreen.style.justifyContent = 'center'
  gameOverScreen.style.alignItems = 'center'
  gameOverScreen.style.zIndex = '10'

  const gameOverMsg = document.createElement('div')
  gameOverMsg.textContent = 'GAME OVER'
  gameOverMsg.style.color = 'white'
  gameOverMsg.style.fontSize = '32px'
  gameOverMsg.style.fontWeight = 'bold'
  gameOverMsg.style.textShadow = '0 0 10px red'
  gameOverMsg.style.marginBottom = '20px'

  const scoreMsg = document.createElement('div')
  scoreMsg.textContent = `Ваш рахунок: ${score.value}`
  scoreMsg.style.color = 'white'
  scoreMsg.style.fontSize = '24px'
  scoreMsg.style.marginBottom = '30px'

  const buttonsContainer = document.createElement('div')
  buttonsContainer.style.display = 'flex'
  buttonsContainer.style.gap = '20px'

  const restartBtn = document.createElement('button')
  restartBtn.textContent = 'Грати знову'
  restartBtn.style.padding = '12px 24px'
  restartBtn.style.backgroundColor = '#4CAF50'
  restartBtn.style.border = 'none'
  restartBtn.style.borderRadius = '8px'
  restartBtn.style.color = 'white'
  restartBtn.style.fontSize = '18px'
  restartBtn.style.cursor = 'pointer'
  restartBtn.style.transition = 'background-color 0.3s'
  restartBtn.addEventListener('mouseenter', () => {
    restartBtn.style.backgroundColor = '#45a049'
  })
  restartBtn.addEventListener('mouseleave', () => {
    restartBtn.style.backgroundColor = '#4CAF50'
  })
  restartBtn.addEventListener('click', () => {
    gameBoard.innerHTML = '' // Очищаємо дошку
    startGame()
  })

  buttonsContainer.appendChild(restartBtn)

  gameOverScreen.appendChild(gameOverMsg)
  gameOverScreen.appendChild(scoreMsg)
  gameOverScreen.appendChild(buttonsContainer)
  gameBoard.appendChild(gameOverScreen)
}

// Завершення гри та збереження результату
function endGame() {
  gameActive = false
  if (gameInterval) {
    clearInterval(gameInterval)
  }
  document.removeEventListener('keydown', handleKeyPress)
  userStore.addGameToHistory('Snake', score.value)
  router.push('/history')
}

// Запуск гри при монтуванні компонента
onMounted(() => {
  startGame()
})

// Очищення при розмонтуванні компонента
onUnmounted(() => {
  if (gameInterval) {
    clearInterval(gameInterval)
  }
  document.removeEventListener('keydown', handleKeyPress)
})
</script>

<style>
#game-board {
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

@keyframes apple-appear {
  from {
    transform: scale(0.2);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.apple-animation {
  animation: apple-appear 0.5s ease-out forwards;
}

@keyframes vanish {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.5);
  }
}

@keyframes flash {
  0% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.3;
  }
  100% {
    opacity: 0;
  }
}

/* Анімація змійки */
.snake-segment {
  transition: background-color 0.1s;
}

/* Додаткові стилі для мобільного керування */
@media (max-width: 768px) {
  #mobile-controls {
    display: grid !important;
  }
}

@media (min-width: 769px) {
  #mobile-controls {
    display: none !important;
  }
}
</style>
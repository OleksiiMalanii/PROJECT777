<template>
  <div class="flex h-screen font-sci-fi text-white bg-gray-900">
    <!-- Left: Game Area -->
    <div class="flex flex-col items-center justify-center flex-1">
      <div class="text-lg mb-1">Score: {{ score }}</div>
      <canvas
          ref="canvas"
          width="600"
          height="600"
          :class="['bg-black border-4 rounded-lg transition-shadow duration-200',
          crashed
            ? 'border-red-500 shadow-[0_0_20px_#ff0000]'
            : glow
              ? 'border-blue-600 shadow-[0_0_20px_#0000FF]'
              : 'border-blue-800'
        ]"
      ></canvas>
    </div>

    <!-- Right: Game Info -->
    <div class="w-full md:w-1/3 p-6 flex flex-col justify-center space-y-6 border-l border-white/10">
      <h2 class="text-3xl font-bold">Space Shooter</h2>
      <p class="text-sm">By: <span class="text-orange-400">Yaroslav Labunskiy</span></p>

      <!-- Difficulty -->
      <div class="flex gap-2">
        <button
            @click="setDifficulty('easy')"
            :disabled="isGameRunning"
            :class="[
            'px-4 py-2 rounded-full transition',
            isGameRunning
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 cursor-pointer',
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
            isGameRunning
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-yellow-600 hover:bg-yellow-700 cursor-pointer',
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
            isGameRunning
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-800 cursor-pointer',
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
            isGameRunning
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-green-500 hover:bg-green-600 cursor-pointer'
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

      <!-- Game Rules -->
      <div class="text-sm  text-gray-300 space-y-2">
        <h3 class="font-bold text-white">Game Rules:</h3>
        <ul class="space-y-1">
          <li>🚀 Move left-right with arrow keys or A/D</li>
          <li>🔫 Shoot with SPACE (hold for auto-fire)</li>
          <li>👾 Destroy enemies to earn points</li>
          <li>💥 Avoid collisions with enemies</li>
          <li>⚡ Fast enemies (purple) = +20 points (2 hits required)</li>
          <li>🎯 Normal enemies = +10 points (1 hit required)</li>
        </ul>
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

const canvasSize = 600
const gameSpeed = ref(16) // 60fps

const difficultyPresets = {
  // 400px canvas
  // easy: { enemySpeed: 1, spawnRate: 0.02, bulletSpeed: 8 },
  // medium: { enemySpeed: 2, spawnRate: 0.03, bulletSpeed: 7 },
  // hard: { enemySpeed: 3, spawnRate: 0.04, bulletSpeed: 6 }


  // 600px canvas
  easy: { enemySpeed: 2, spawnRate: 0.04, bulletSpeed: 8 },
  medium: { enemySpeed: 3, spawnRate: 0.06, bulletSpeed: 7 },
  hard: { enemySpeed: 4, spawnRate: 0.08, bulletSpeed: 6 }
}

const gameState = ref({
  player: { x: canvasSize / 2 - 15, y: canvasSize - 60, width: 30, height: 40 },
  bullets: [],
  enemies: [],
  keys: {},
  animationId: null,
  difficulty: difficultyPresets.medium,
  lastShotTime: 0,
  shootInterval: 150,
  isShooting: false,
  stars: [],
  gameOverAnimation: {
    active: false,
    startTime: 0,
    duration: 3000, // 3 seconds
    particles: []
  }
})

const score = ref(0)
const isGameRunning = ref(false)
const currentDifficulty = ref('medium')
const crashed = ref(false)
const glow = ref(false)

// Initialize stars for animated background
const initStars = () => {
  const stars = []
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * canvasSize,
      y: Math.random() * canvasSize,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.8 + 0.3,
      brightness: Math.random() * 0.8 + 0.2
    })
  }
  gameState.value.stars = stars
}

// Initialize explosion particles for game over
const initGameOverParticles = () => {
  const particles = []
  const playerCenter = {
    x: gameState.value.player.x + gameState.value.player.width / 2,
    y: gameState.value.player.y + gameState.value.player.height / 2
  }

  for (let i = 0; i < 20; i++) {
    particles.push({
      x: playerCenter.x,
      y: playerCenter.y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      size: Math.random() * 4 + 2,
      color: Math.random() > 0.5 ? '#ff4444' : '#ffaa00',
      life: 1.0
    })
  }
  gameState.value.gameOverAnimation.particles = particles
}

const drawBackground = () => {
  // Gradient space background
  const gradient = ctx.value.createLinearGradient(0, 0, 0, canvasSize)
  gradient.addColorStop(0, '#0a0a2e')
  gradient.addColorStop(0.5, '#16213e')
  gradient.addColorStop(1, '#0f0f23')
  ctx.value.fillStyle = gradient
  ctx.value.fillRect(0, 0, canvasSize, canvasSize)

  // Animated stars
  ctx.value.save()
  gameState.value.stars.forEach(star => {
    ctx.value.fillStyle = `rgba(255, 255, 255, ${star.brightness})`
    ctx.value.beginPath()
    ctx.value.arc(star.x, star.y, star.size, 0, Math.PI * 2)
    ctx.value.fill()

    // Star movement
    star.y += star.speed
    if (star.y > canvasSize) {
      star.y = -5
      star.x = Math.random() * canvasSize
    }
  })
  ctx.value.restore()
}

const drawPlayer = () => {
  // Don't draw player if game over animation is active
  if (gameState.value.gameOverAnimation.active) return

  const player = gameState.value.player

  ctx.value.save()
  ctx.value.translate(player.x + player.width / 2, player.y + player.height / 2)

  // Main body with gradient
  const gradient = ctx.value.createLinearGradient(0, -20, 0, 20)
  gradient.addColorStop(0, crashed.value ? '#ff4444' : '#FFFFFF')
  gradient.addColorStop(1, crashed.value ? '#aa0000' : '#888888')
  ctx.value.fillStyle = gradient

  ctx.value.beginPath()
  ctx.value.moveTo(0, -20)
  ctx.value.lineTo(-15, 20)
  ctx.value.lineTo(-8, 15)
  ctx.value.lineTo(8, 15)
  ctx.value.lineTo(15, 20)
  ctx.value.closePath()
  ctx.value.fill()

  // Outline
  ctx.value.strokeStyle = crashed.value ? '#444444' : '#110000'
  ctx.value.lineWidth = 1
  ctx.value.stroke()

  // Cockpit
  ctx.value.fillStyle = '#151515'
  ctx.value.beginPath()
  ctx.value.arc(0, -4, 5, 0, Math.PI * 2)
  ctx.value.fill()

  // Engines with flame effect
  ctx.value.fillStyle = '#AAAAAA'
  ctx.value.strokeStyle = '#000000'

  ctx.value.fillRect(-12, 10, 4, 12)
  ctx.value.fillRect(8, 10, 4, 12)

  // Engine flames (animated)
  if (isGameRunning.value && !crashed.value) {
    ctx.value.fillStyle = '#ffaa00'
    ctx.value.fillRect(-11, 22, 2, Math.random() * 8 + 5)
    ctx.value.fillStyle = '#ff6600'
    ctx.value.fillRect(9, 22, 2, Math.random() * 8 + 5)
  }

  // Wings with guns
  ctx.value.fillStyle = '#AAAAAA'
  // Left wing
  ctx.value.beginPath()
  ctx.value.moveTo(-35, 5)
  ctx.value.lineTo(-15, 0)
  ctx.value.lineTo(-5, 15)
  ctx.value.closePath()
  ctx.value.fill()

  // Right wing
  ctx.value.beginPath()
  ctx.value.moveTo(35, 5)
  ctx.value.lineTo(15, 0)
  ctx.value.lineTo(5, 15)
  ctx.value.closePath()
  ctx.value.fill()

  // Guns
  ctx.value.fillStyle = '#666666'
  ctx.value.fillRect(-25, -3, 5, 10)
  ctx.value.fillRect(20, -3, 5, 10)

  ctx.value.restore()
}

const drawBullets = () => {
  gameState.value.bullets.forEach(bullet => {
    ctx.value.save()

    // Bullet glow effect
    const gradient = ctx.value.createRadialGradient(
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 0,
        bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 8
    )
    gradient.addColorStop(0, '#ffff44')
    gradient.addColorStop(0.7, '#ffaa00')
    gradient.addColorStop(1, 'transparent')

    ctx.value.fillStyle = gradient
    ctx.value.fillRect(bullet.x - 2, bullet.y - 2, bullet.width + 4, bullet.height + 4)

    // Main bullet
    ctx.value.fillStyle = '#ffff00'
    ctx.value.fillRect(bullet.x, bullet.y, bullet.width, bullet.height)

    // Bullet trail
    ctx.value.fillStyle = '#ffaa00'
    ctx.value.fillRect(bullet.x + 0.5, bullet.y + bullet.height, bullet.width - 1, 3)

    ctx.value.restore()
  })
}

const drawEnemies = () => {
  gameState.value.enemies.forEach(enemy => {
    ctx.value.save()
    ctx.value.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2)

    // Gradient based on enemy type and health
    const gradient = ctx.value.createLinearGradient(0, -15, 0, 15)
    if (enemy.type === 'fast') {
      gradient.addColorStop(0, '#ff0088')
      gradient.addColorStop(1, '#aa0044')
    } else {
      gradient.addColorStop(0, '#ff4444')
      gradient.addColorStop(1, '#aa0000')
    }

    ctx.value.fillStyle = gradient
    ctx.value.beginPath()
    ctx.value.moveTo(0, 15)
    ctx.value.lineTo(-12, -15)
    ctx.value.lineTo(-6, -10)
    ctx.value.lineTo(6, -10)
    ctx.value.lineTo(12, -15)
    ctx.value.closePath()
    ctx.value.fill()

    // Outline
    ctx.value.strokeStyle = enemy.type === 'fast' ? '#ffaaff' : '#ffaaaa'
    ctx.value.lineWidth = 1
    ctx.value.stroke()

    // Enemy engines with flames
    ctx.value.fillStyle = '#ff6600'
    ctx.value.fillRect(-8, -18, 3, 8)
    ctx.value.fillRect(5, -18, 3, 8)

    // Engine flames
    ctx.value.fillStyle = '#ffaa00'
    ctx.value.fillRect(-7.5, -10, 2, Math.random() * 4 + 2)
    ctx.value.fillRect(5.5, -10, 2, Math.random() * 4 + 2)

    // Shield effect for fast enemies (only if they have health)
    if (enemy.type === 'fast' && enemy.health > 1) {
      ctx.value.strokeStyle = '#ff00ff'
      ctx.value.lineWidth = 2
      ctx.value.beginPath()
      ctx.value.arc(0, 0, 18, 0, Math.PI * 2)
      ctx.value.stroke()
    }

    ctx.value.restore()
  })
}

const drawGameOverAnimation = () => {
  if (!gameState.value.gameOverAnimation.active) return

  const currentTime = Date.now()
  const elapsed = currentTime - gameState.value.gameOverAnimation.startTime
  const progress = Math.min(elapsed / gameState.value.gameOverAnimation.duration, 1)

  // Draw explosion particles
  gameState.value.gameOverAnimation.particles.forEach(particle => {
    if (particle.life <= 0) return

    ctx.value.save()

    // Update particle position
    particle.x += particle.vx
    particle.y += particle.vy
    particle.vy += 0.2 // gravity
    particle.life -= 0.02

    // Draw particle with fade out
    ctx.value.globalAlpha = particle.life
    ctx.value.fillStyle = particle.color
    ctx.value.beginPath()
    ctx.value.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    ctx.value.fill()

    ctx.value.restore()
  })

  // Draw "GAME OVER" text with animation
  if (elapsed > 500) { // Start text after 0.5 seconds
    ctx.value.save()

    const textProgress = Math.min((elapsed - 500) / 1500, 1) // 1.5 seconds for text animation
    const scale = 0.5 + (textProgress * 0.5) // Scale from 0.5 to 1.0
    const alpha = textProgress

    // Pulsing effect
    // const pulse = Math.sin(elapsed * 0.01) * 0.1 + 0.9
    //
    // ctx.value.globalAlpha = alpha
    // ctx.value.textAlign = 'center'
    // ctx.value.textBaseline = 'middle'
    //
    // // Shadow/glow effect
    // ctx.value.shadowColor = '#ff0000'
    // ctx.value.shadowBlur = 20 * pulse
    //
    // // Main text
    // ctx.value.fillStyle = '#ffffff'
    // ctx.value.font = `bold ${48 * scale * pulse}px Arial`
    // ctx.value.fillText('GAME OVER', canvasSize / 2, canvasSize / 2 - 30)
    //
    // // Score text
    // ctx.value.shadowBlur = 10
    // ctx.value.fillStyle = '#ffaa00'
    // ctx.value.font = `${24 * scale}px Arial`
    // ctx.value.fillText(`Final Score: ${score.value}`, canvasSize / 2, canvasSize / 2 + 20)

    // "Press Start to play again" text
    // if (elapsed > 2000) {
    //   const blinkAlpha = Math.sin(elapsed * 0.008) * 0.5 + 0.5
    //   ctx.value.globalAlpha = alpha * blinkAlpha
    //   ctx.value.shadowBlur = 5
    //   ctx.value.fillStyle = '#aaaaaa'
    //   ctx.value.font = `${16 * scale}px Arial`
    //   ctx.value.fillText('Press Start to play again', canvasSize / 2, canvasSize / 2 + 60)
    // }

    ctx.value.restore()
  }

  // End animation after duration
  if (progress >= 1) {
    // Keep particles and text visible, but stop updating particles
    gameState.value.gameOverAnimation.particles.forEach(particle => {
      particle.vx *= 0.95
      particle.vy *= 0.95
    })
  }
}

const updatePlayer = () => {
  if (crashed.value) return;

  const player = gameState.value.player
  const keys = gameState.value.keys

  if (keys['ArrowLeft'] || keys['a'] || keys['A'] || keys['ф'] || keys['Ф']) {
    player.x = Math.max(0, player.x - 5)
  }
  if (keys['ArrowRight'] || keys['d'] || keys['D'] || keys['в'] || keys['В']) {
    player.x = Math.min(canvasSize - player.width, player.x + 5)
  }

  // Auto-fire when space is held
  if (gameState.value.isShooting) {
    const now = Date.now()
    if (now - gameState.value.lastShotTime > gameState.value.shootInterval) {
      shoot()
      gameState.value.lastShotTime = now
    }
  }
}

const updateBullets = () => {
  gameState.value.bullets = gameState.value.bullets.filter(bullet => {
    bullet.y -= gameState.value.difficulty.bulletSpeed
    return bullet.y > -bullet.height
  })
}

const updateEnemies = () => {
  // Spawn enemies
  if (Math.random() < gameState.value.difficulty.spawnRate) {
    const enemyType = Math.random() < 0.3 ? 'fast' : 'normal'
    gameState.value.enemies.push({
      x: Math.random() * (canvasSize - 25),
      y: -30,
      width: 25,
      height: 30,
      type: enemyType,
      speed: enemyType === 'fast' ? gameState.value.difficulty.enemySpeed * 1.5 : gameState.value.difficulty.enemySpeed,
      health: enemyType === 'fast' ? 2 : 1
    })
  }

  // Move enemies
  gameState.value.enemies = gameState.value.enemies.filter(enemy => {
    enemy.y += enemy.speed
    return enemy.y < canvasSize + enemy.height
  })
}

const checkCollisions = () => {
  // Check bullet-enemy collisions
  for (let i = gameState.value.bullets.length - 1; i >= 0; i--) {
    const bullet = gameState.value.bullets[i]
    for (let j = gameState.value.enemies.length - 1; j >= 0; j--) {
      const enemy = gameState.value.enemies[j]

      if (bullet.x < enemy.x + enemy.width &&
          bullet.x + bullet.width > enemy.x &&
          bullet.y < enemy.y + enemy.height &&
          bullet.y + bullet.height > enemy.y) {

        // Remove the bullet
        gameState.value.bullets.splice(i, 1)

        // Reduce enemy health
        enemy.health--

        // If enemy is destroyed
        if (enemy.health <= 0) {
          gameState.value.enemies.splice(j, 1)
          // Increase score
          score.value += (enemy.type === 'fast' ? 20 : 10)
        }

        // Glow effect
        glow.value = true
        setTimeout(() => glow.value = false, 150)

        break
      }
    }
  }

  // Check player-enemy collisions
  const player = gameState.value.player
  for (const enemy of gameState.value.enemies) {
    if (player.x < enemy.x + enemy.width &&
        player.x + player.width > enemy.x &&
        player.y < enemy.y + enemy.height &&
        player.y + player.height > enemy.y) {

      crashed.value = true
      triggerGameOver()
      return
    }
  }
}

const triggerGameOver = () => {
  // Initialize game over animation
  gameState.value.gameOverAnimation.active = true
  gameState.value.gameOverAnimation.startTime = Date.now()
  initGameOverParticles()

  // Stop the game after a short delay to show explosion
  setTimeout(() => {
    stopGame()
  }, 700)

}

const gameLoop = () => {
  if (!isGameRunning.value && !gameState.value.gameOverAnimation.active) return

  // Update game state only if game is running
  if (isGameRunning.value) {
    updatePlayer()
    updateBullets()
    updateEnemies()
    checkCollisions()
  }

  // Draw everything
  drawBackground()
  drawPlayer()
  drawBullets()
  drawEnemies()
  drawGameOverAnimation()

  gameState.value.animationId = requestAnimationFrame(gameLoop)
}

const shoot = () => {
  if (crashed.value) return;

  const player = gameState.value.player
  // Add bullets from both guns
  gameState.value.bullets.push(
      // Left gun bullet
      {
        x: player.x - 8,
        y: player.y + 5,
        width: 3,
        height: 12
      },
      // Right gun bullet
      {
        x: player.x + player.width + 5,
        y: player.y + 5,
        width: 3,
        height: 12
      }
  )
}

const handleKeyDown = (e) => {
  gameState.value.keys[e.key] = true

  // If space is pressed - set shooting flag
  if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W'
      || e.key === 'ц' || e.key === 'Ц') {
    e.preventDefault()
    if (!gameState.value.isShooting) {
      gameState.value.isShooting = true
      shoot() // First shot without delay
      gameState.value.lastShotTime = Date.now()
    }
  }
}

const handleKeyUp = (e) => {
  gameState.value.keys[e.key] = false

  // If space is released - reset shooting flag
  if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W'
      || e.key === 'ц' || e.key === 'Ц') {
    e.preventDefault()
    gameState.value.isShooting = false
    gameState.value.lastShotTime = 0
  }
}

const setDifficulty = (level) => {
  if (isGameRunning.value) return

  currentDifficulty.value = level
  gameState.value.difficulty = difficultyPresets[level]
}

const startGame = () => {
  resetGame()
  isGameRunning.value = true
  gameLoop()
}

const stopGame = () => {
  isGameRunning.value = false
  if (gameState.value.animationId) {
    cancelAnimationFrame(gameState.value.animationId)
  }
}

const toggleGame = () => {
  if (isGameRunning.value) {
    stopGame()
  } else {
    startGame()
  }
}

const resetGame = () => {
  gameState.value.player = { x: canvasSize / 2 - 15, y: canvasSize - 60, width: 30, height: 40 }
  gameState.value.bullets = []
  gameState.value.enemies = []
  gameState.value.keys = {}
  gameState.value.isShooting = false
  gameState.value.lastShotTime = 0
  gameState.value.gameOverAnimation.active = false
  gameState.value.gameOverAnimation.particles = []

  score.value = 0
  crashed.value = false
  glow.value = false

  // Draw initial state
  drawBackground()
  drawPlayer()
}

const goHome = () => {
  stopGame()
  router.push('/games')
}

onMounted(() => {
  ctx.value = canvas.value.getContext('2d')
  initStars()
  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  // Initial drawing
  resetGame()
})

onBeforeUnmount(() => {
  stopGame()
  window.removeEventListener('keydown', handleKeyDown)
  window.removeEventListener('keyup', handleKeyUp)
  if (gameState.value.animationId) {
    cancelAnimationFrame(gameState.value.animationId)
  }
})
</script>

<style scoped>
.font-sci-fi {
  font-family: 'Orbitron', sans-serif;
}
</style>
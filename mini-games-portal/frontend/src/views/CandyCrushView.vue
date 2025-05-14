<template>
  <div class="text-center mt-2 mb-4 text-lg text-primary-dark dark:text-gray-200">
    <h1 class="text-3xl font-bold mb-1">Candy Crush</h1>
    Score: {{ score }}
  </div>
  <div
      class="mx-auto my-4 p-2 bg-primary dark:bg-gray-800 border-4 border-primary-dark rounded-2xl w-[380px] overflow-hidden"
      style="width: 380px; height: 363px;"
  >
    <div
        id="board"
        class="grid grid-cols-9 gap-1"
        style="width: 360px; height: 360px; margin: 0 auto;"
    ></div>
  </div>

  <div class="text-center mt-4">
    <button
        @click="endGame"
        class="px-6 py-2 bg-primary dark:bg-primary text-primary-light dark:text-white rounded-2xl hover:bg-primary-dark hover:dark:bg-primary transition"
    >
      Завершити гру та зберегти
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const score = ref(0)

const candies = ['Blue','Orange','Green','Yellow','Red','Purple']
const rows = 9, columns = 9
let board = [], currTile = null, otherTile = null

function randomCandy() {
  return candies[Math.floor(Math.random()*candies.length)]
}

function startGame() {
  const boardEl = document.getElementById('board')
  boardEl.innerHTML = ''
  board = []
  score.value = 0

  for (let r=0; r<rows; r++) {
    const row = []
    for (let c=0; c<columns; c++) {
      const tile = document.createElement('img')
      tile.id = `${r}-${c}`
      tile.draggable = true
      tile.classList.add('tile')

      let candy;
      do {
        candy = randomCandy()
      } while (
          (c>1 && row[c-1].src.endsWith(`${candy}.png`) && row[c-2].src.endsWith(`${candy}.png`)) ||
          (r>1 && board[r-1][c].src.endsWith(`${candy}.png`) && board[r-2][c].src.endsWith(`${candy}.png`))
          )
      tile.src = `/src/assets/img/${candy}.png`

      tile.addEventListener('dragstart', ()=> currTile=tile)
      tile.addEventListener('dragover', e=> e.preventDefault())
      tile.addEventListener('drop', ()=> otherTile=tile)
      tile.addEventListener('dragend', animateSwap)

      boardEl.append(tile)
      row.push(tile)
    }
    board.push(row)
  }
}

function animateSwap() {
  if (!currTile||!otherTile) return
  const [r1,c1]=currTile.id.split('-').map(Number)
  const [r2,c2]=otherTile.id.split('-').map(Number)
  if (Math.abs(r1-r2)+Math.abs(c1-c2)!==1) return

  const dx=(c2-c1)*41, dy=(r2-r1)*41
  currTile.style.transition='transform 0.3s ease'
  otherTile.style.transition='transform 0.3s ease'
  currTile.style.transform=`translate(${dx}px,${dy}px)`
  otherTile.style.transform=`translate(${-dx}px,${-dy}px)`

  const cleanup=()=>{
    currTile.style.transition=''; otherTile.style.transition=''
    currTile.style.transform=''; otherTile.style.transform=''
    const tmp=currTile.src; currTile.src=otherTile.src; otherTile.src=tmp
    currTile.removeEventListener('transitionend',cleanup)
    currTile=otherTile=null
  }
  currTile.addEventListener('transitionend',cleanup)
}

function crushThree() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns - 2; c++) {
      const [t1, t2, t3] = [board[r][c], board[r][c+1], board[r][c+2]]
      if (t1.src === t2.src && t2.src === t3.src && !t1.src.includes('blank')) {
        [t1, t2, t3].forEach(tile => {
          tile.classList.add('vanish')
          setTimeout(() => {
            tile.src = '/src/assets/img/blank.png'
            tile.classList.remove('vanish')
          }, 300)
        })
        score.value += 30
      }
    }
  }
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows - 2; r++) {
      const [t1, t2, t3] = [board[r][c], board[r+1][c], board[r+2][c]]
      if (t1.src === t2.src && t2.src === t3.src && !t1.src.includes('blank')) {
        [t1, t2, t3].forEach(tile => {
          tile.classList.add('vanish')
          setTimeout(() => {
            tile.src = '/src/assets/img/blank.png'
            tile.classList.remove('vanish')
          }, 300)
        })
        score.value += 30
      }
    }
  }
}

function slideCandy(){for(let c=0;c<columns;c++){let idx=rows-1;for(let r=rows-1;r>=0;r--)if(!board[r][c].src.includes('blank')){board[idx][c].src=board[r][c].src;idx--}for(let r=idx;r>=0;r--)board[r][c].src='/src/assets/img/blank.png'}}

function generateCandy(){for(let c=0;c<columns;c++)if(board[0][c].src.includes('blank'))board[0][c].src=`/src/assets/img/${randomCandy()}.png`}

function crushCandy(){crushThree()}

function endGame(){userStore.addGameToHistory('Candy Crush',score.value);router.push('/')}

onMounted(()=>{startGame();setInterval(()=>{crushCandy();slideCandy();generateCandy()},100)})
</script>

<style>
.tile { width: 40px; height: 40px; cursor: grab; }
.vanish {
  animation: vanish 0.3s ease-out forwards;
}
@keyframes vanish {
  to {
    opacity: 0;
    transform: scale(0.5);
  }
}
</style>
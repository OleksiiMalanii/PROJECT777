<template>
  <div class="game-card">
    <h3 class="card-title">{{ gameName }}</h3>
    <button class="play-button" @click="playGame">
      Грати
    </button>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'GameCard',
  props: {
    gameName: {
      type: String,
      required: true
    }
  },
  setup(props, { emit }) {
    const userStore = useUserStore()

    const playGame = () => {
      userStore.addGameToHistory(props.gameName)
      emit('playGame', props.gameName)
    }

    return { playGame }
  }
}
</script>

<style scoped>
.game-card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  padding: 1.5rem;
  text-align: center;
}

.card-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
}

.play-button {
  background-color: #28a745;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.play-button:hover {
  background-color: #218838;
}

</style>
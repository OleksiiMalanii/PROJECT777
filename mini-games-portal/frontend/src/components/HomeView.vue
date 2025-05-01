<template>
  <div class="home-view">
    <h2 class="main-title">Список мініігор</h2>
    <div class="games-grid">
      <GameCard
          v-for="(game, index) in games"
          :key="index"
          :gameName="game.name"
          @playGame="onPlayGame"
      />
    </div>
  </div>
</template>

<script>
import GameCard from '@/components/GameCard.vue'

export default {
  name: 'HomeView',
  components: { GameCard },
  data() {
    return {
      games: [
        { name: 'Гра 1' },
        { name: 'Гра 2' },
        { name: 'Гра 3' }
      ]
    }
  },
  methods: {
    onPlayGame(gameName) {
      console.log('Граємо в:', gameName)
    }
  }
}
</script>

<style scoped>
.home-view {
  text-align: center;
}

.main-title {
  font-size: 2rem;
  margin-bottom: 2rem;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 1rem;
}

</style>
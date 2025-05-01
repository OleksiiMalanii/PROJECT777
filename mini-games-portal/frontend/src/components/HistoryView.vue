<template>
  <div class="history-view">
    <h2 class="history-title">Історія ігор</h2>
    <GameHistory />
  </div>
</template>

<script>
import GameHistory from '@/components/GameHistory.vue'

export default {
  name: 'HistoryView',
  components: { GameHistory }
}
</script>

<style scoped>
.history-view {
  padding: 2rem;
}

</style>
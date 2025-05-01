<template>
  <div class="history-card">
    <h2 class="history-card__title">Історія ігор</h2>
    <p class="history-card__user">
      Авторизований користувач:
      <strong class="history-card__username">{{ userStore.username }}</strong>
    </p>
    <ul class="history-list">
      <li
          v-for="(item, index) in userStore.gameHistory"
          :key="index"
          class="history-list__item"
      >
        <strong>{{ item.game }}</strong> — зіграно: {{ item.date }}
      </li>
    </ul>
    <p v-if="userStore.gameHistory.length === 0" class="history-empty">
      Поки що немає записів.
    </p>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore.js'

export default {
  name: 'GameHistory',
  setup() {
    const userStore = useUserStore()
    return { userStore }
  }
}
</script>

<style scoped>
.history-card {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.history-card__title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: center;
}

.history-card__user {
  margin-bottom: 1rem;
  font-weight: 500;
}

.history-card__username {
  color: #007bff;
}

.history-list {
  list-style: none;
  padding: 0;
  margin-bottom: 1rem;
}

.history-list__item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.history-empty {
  color: #888;
  text-align: center;
}
</style>
<template>
  <div class="app-container">
    <!-- Навігація -->
    <nav class="navigation">
      <div class="navigation__inner">
        <h1 class="navigation__logo">Mini-Games</h1>
        <div class="navigation__links">
          <router-link to="/" class="nav-link">Головна</router-link>
          <router-link to="/login" class="nav-link">Увійти</router-link>
          <router-link to="/history" class="nav-link">Історія ігор</router-link>
        </div>
      </div>
    </nav>

    <!-- Герой-секція -->
    <section class="hero-section">
      <div class="hero-section__inner">
        <h2 class="hero-title">Ласкаво просимо до 777!</h2>
        <p class="hero-subtitle">
          Обирайте гру на свій смак та розважайтесь у будь-який час!
        </p>
        <router-link
            to="/login"
            class="hero-button"
        >
          Почати гру
        </router-link>
      </div>
    </section>

    <!-- Основний контент -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Футер -->
    <footer class="footer-section">
      © Ваша Компанія, {{ new Date().getFullYear() }}. Всі права захищені.
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app-container {
  font-family: 'Segoe UI', sans-serif;
  color: #333;
  background: #f9f9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navigation {
  background-color: #0d6efd;
  padding: 1rem 2rem;
  color: white;
}

.navigation__inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.navigation__logo {
  font-size: 1.5rem;
  font-weight: bold;
}

.navigation__links .nav-link {
  margin-left: 1rem;
  color: white;
  text-decoration: none;
  font-weight: 500;
}

.nav-link:hover {
  text-decoration: underline;
}

.hero-section {
  background: linear-gradient(135deg, #007bff, #6610f2);
  color: white;
  padding: 3rem 1rem;
  text-align: center;
}

.hero-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
}

.hero-button {
  background-color: white;
  color: #007bff;
  padding: 0.75rem 1.5rem;
  font-weight: bold;
  border-radius: 8px;
  text-decoration: none;
}

.hero-button:hover {
  background-color: #e6e6e6;
}

.main-content {
  flex: 1;
  padding: 2rem;
}

.footer-section {
  background-color: #f1f1f1;
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  color: #555;
}

</style>
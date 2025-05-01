<template>
  <div class="login-form">
    <h2 class="login-form__title">Увійти</h2>
    <div class="field-group">
      <label for="username" class="field-label">Ім'я користувача</label>
      <input
          id="username"
          type="text"
          v-model="localName"
          class="field-input"
      />
    </div>
    <button
        class="submit-button"
        @click="login"
    >
      Увійти
    </button>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'

export default {
  name: 'LoginForm',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()
    const localName = ref('')

    const login = () => {
      if (localName.value) {
        userStore.loginUser(localName.value)
        router.push('/')
      }
    }

    return { localName, login }
  }
}
</script>

<style scoped>
.login-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.login-form__title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.field-group {
  margin-bottom: 1.2rem;
}

.field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.field-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.submit-button {
  width: 100%;
  padding: 0.8rem;
  background-color: #0d6efd;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #0b5ed7;
}

</style>
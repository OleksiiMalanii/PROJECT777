<template>
  <div class="login-view">
    <h2 class="login-title">Увійти</h2>
    <LoginForm />
  </div>
</template>

<script>
import LoginForm from '@/components/LoginForm.vue'

export default {
  name: 'LoginView',
  components: { LoginForm }
}
</script>




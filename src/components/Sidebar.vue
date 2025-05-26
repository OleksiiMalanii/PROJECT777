<template>
  <nav class="fixed top-1/2 left-1 transform -translate-y-1/2 flex flex-col items-center gap-5 z-50">
    <div class="h-28 flex items-center">
      <router-link
          to="/about"
          class="transform rotate-[270deg] text-white hover:text-orange-500 tracking-widest text-xl transition sci-fi-font unselectable"
      >
        ABOUT
      </router-link>
    </div>
    <div class="h-28 flex items-center">
      <router-link
          to="/forum"
          class="transform rotate-[270deg] text-white hover:text-orange-500 tracking-widest text-xl transition sci-fi-font unselectable"
      >
        FORUM
      </router-link>
    </div>
    <div class="h-28 flex items-center">
      <router-link
          to="/games"
          class="transform rotate-[270deg] text-white hover:text-orange-500 tracking-widest text-xl transition sci-fi-font unselectable"
      >
        GAMES
      </router-link>
    </div>
    <div class="h-28 flex items-center">
      <router-link
          to="/"
          class="transform rotate-[270deg] text-white hover:text-orange-500 tracking-widest text-xl transition sci-fi-font unselectable"
      >
        HOME
      </router-link>
    </div>
  </nav>
</template>

<style scoped>
.unselectable {
  user-select: none;
}
</style>
<script setup lang="ts">
</script>
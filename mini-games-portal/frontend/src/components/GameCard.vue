<template>
  <div @click="$emit('play', game)" class="bg-green-600 dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-xl transform hover:scale-105 transition p-4 cursor-pointer">
    <img :src="game.img" :alt="game.title" class="w-full h-40 object-cover rounded-lg mb-4" />
    <h3 class="text-lg font-medium text-green-950 dark:text-gray-100">{{ game.title }}</h3>
  </div>
</template>

<script setup>
const props = defineProps({ game: { type: Object, required: true } })
</script>
<template>
  <div
      @click="$emit('play', game)"
      class="bg-green-600 dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-xl transform hover:scale-105 transition p-4 cursor-pointer"
  >
    <img
        :src="game.img"
        :alt="game.title"
        class="w-full h-40 object-cover rounded-lg mb-4"
    />

    <!-- Tags -->
    <div class="flex flex-wrap gap-1 mb-2">
      <span
          v-for="(tag, index) in tagList"
          :key="index"
          class="text-xs bg-green-700 dark:bg-gray-700 text-green-300 dark:text-gray-300 px-2 py-0.5 rounded-full"
      >
        {{ tag }}
      </span>
    </div>

    <h3 class="text-lg font-medium text-green-950 dark:text-gray-100">{{ game.title }}</h3>
  </div>
</template>

<script setup>
const props = defineProps({ game: { type: Object, required: true } })

// Convert tags string to array (adjust delimiter if needed)
const tagList = Array.isArray(props.game.tags)
    ? props.game.tags
    : props.game.tags.split(',').map(tag => tag.trim())
</script>

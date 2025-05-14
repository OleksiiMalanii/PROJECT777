<template>
  <div
      @click="$emit('play', game)"
      class="bg-primary-light dark:bg-gray-800 rounded-2xl shadow-card hover:shadow-xl transform hover:scale-105 transition p-4 cursor-pointer"
  >
    <div class="w-full h-40 mb-4 rounded-lg overflow-hidden">
      <img :src="game.img" :alt="game.title" class="w-full h-full object-contain" />
    </div>

    <div class="flex flex-wrap gap-1 mb-2">
      <span
          v-for="(tag, idx) in tagList"
          :key="idx"
          class="text-xs bg-primary-dark dark:bg-gray-700 text-white px-2 py-0.5 rounded-full"
      >
        {{ tag }}
      </span>
    </div>
    <h3 class="text-lg font-medium text-white dark:text-gray-100">{{ game.title }}</h3>
  </div>
</template>

<script setup>
const props = defineProps({ game: Object })
const tagList = Array.isArray(props.game.tags)
    ? props.game.tags
    : props.game.tags.split(',').map(t => t.trim())
</script>
<template>
  <div class="bg-green-600 dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
    <h1 class="text-2xl font-semibold mb-4">Гра: {{ gameName }}</h1>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
const gameName = useRoute().params.name
</script>

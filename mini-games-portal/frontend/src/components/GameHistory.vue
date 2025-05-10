<template>
  <ul class="space-y-2">
    <li v-for="(rec, idx) in records" :key="idx" class="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <span>{{ rec.game }}</span>
      <span class="text-gray-500 dark:text-gray-400 text-sm">{{ rec.date }}</span>
    </li>
  </ul>
</template>

<script setup>
const { records } = defineProps({ records: { type: Array, default: () => [] } })
</script>
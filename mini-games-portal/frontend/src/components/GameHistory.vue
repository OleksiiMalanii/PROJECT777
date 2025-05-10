<template>
  <ul class="space-y-2">
    <li
        v-for="(rec, idx) in records"
        :key="idx"
        class="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
    >
      <div class="flex space-x-2">
        <span class="font-medium">{{ rec.game }}</span>
        <span v-if="showScore" class="text-primary">({{ rec.score }} pts)</span>
      </div>
      <span class="text-gray-500 dark:text-gray-400 text-sm">{{ rec.date }}</span>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  records: { type: Array, default: () => [] },
  showScore: { type: Boolean, default: false }
})
</script>

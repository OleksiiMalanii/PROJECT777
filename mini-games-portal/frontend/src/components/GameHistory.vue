<template>
  <ul
      class="bg-background dark:bg-gray-700 rounded-lg overflow-hidden
           divide-y divide-primary-dark dark:divide-gray-600"
  >
    <li
        v-for="(rec, idx) in records"
        :key="idx"
        class="flex justify-between px-4 py-3"
    >
      <div class="flex space-x-2">
        <span class="font-medium text-primary-dark dark:text-white">
          {{ rec.game }}
        </span>
        <span
            v-if="showScore"
            class="text-primary-dark dark:text-primary"
        >
          ({{ rec.score }} pts)
        </span>
      </div>
      <span class="text-sm text-primary-dark dark:text-gray-400">
        {{ rec.date }}
      </span>
    </li>
  </ul>
</template>

<script setup>
const props = defineProps({
  records:   { type: Array,   default: () => [] },
  showScore: { type: Boolean, default: false }
})
</script>

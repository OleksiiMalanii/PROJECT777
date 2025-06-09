<template>
  <div
      class="relative group bg-gray-900 p-4 rounded-xl shadow-lg hover:shadow-orange-500/30 transition duration-300 aspect-[4/3] flex flex-col justify-between"
  >
    <!-- Game Image -->
    <img
        :src="game.img"
        :alt="game.title"
        class="w-full h-full object-cover rounded-lg unselectable cursor-pointer"
        draggable="false"
        @click="goToGame"
    />

    <!-- Title -->
    <h3 class="text-lg font-semibold mt-2 mb-1">{{ game.title }}</h3>

    <!-- Tags -->
    <div class="flex flex-wrap gap-2 text-sm text-orange-400 mb-10">
      <span
          v-for="(tag, index) in game.tags"
          :key="index"
          class="bg-gray-800 px-2 py-1 rounded"
      >
        {{ tag }}
      </span>
    </div>

    <!-- Play Button -->
    <button
        class="absolute bottom-4 right-4 w-13 h-13 bg-orange-500 hover:bg-orange-600 text-white rounded-md flex items-center justify-center shadow-md transition z-10"
        @click="goToGame"
    >
      <span class="material-symbols-outlined text-xl unselectable" style="font-size: 40px !important">play_arrow</span>
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({
  game: {
    type: Object,
    required: true,
  },
})

const router = useRouter()

const goToGame = () => {
  router.push(props.game.route);
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,1,200');

.material-symbols-outlined {
  font-variation-settings:
      'FILL' 1,
      'wght' 700,
      'GRAD' 200,
      'opsz' 48;
}
.unselectable {
  user-select: none;
}
</style>

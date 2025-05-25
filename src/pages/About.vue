<template>
  <section class="pt-28 pb-20 pl-20 pr-6 md:pl-32 md:pr-12 text-white font-sci-fi">
    <!-- Title -->
    <h1 class="text-4xl font-bold text-center mb-4">ABOUT US</h1>
    <div class="h-1 w-48 bg-white mx-auto mb-10 rounded-full"></div>

    <!-- Developers Section -->
    <h2 class="text-2xl md:text-3xl font-bold text-orange-500 mb-6">Developers:</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-16">
      <div class="flex flex-col items-center text-center">
        <div class="w-24 h-24 rounded-full border-4 border-orange-500 flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-orange-500 text-4xl unselectable" style="font-size: 70px !important">person</span>
        </div>
        <p class="text-orange-500 font-bold text-lg">Oleksii Malanii</p>
        <p class="text-white text-sm">Leader</p>
        <p class="text-white text-sm">Front-end Developer</p>
      </div>
      <div class="flex flex-col items-center text-center">
        <div class="w-24 h-24 rounded-full border-4 border-orange-500 flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-orange-500 text-4xl unselectable" style="font-size: 70px !important">person</span>
        </div>
        <p class="text-orange-500 font-bold text-lg">Denys Novosad</p>
        <p class="text-white text-sm">Designer</p>
        <p class="text-white text-sm">Front-end Developer</p>
      </div>
      <div class="flex flex-col items-center text-center">
        <div class="w-24 h-24 rounded-full border-4 border-orange-500 flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-orange-500 text-4xl unselectable" style="font-size: 70px !important">person</span>
        </div>
        <p class="text-orange-500 font-bold text-lg">Andrii Kohut</p>
        <p class="text-white text-sm">Place Holder</p>
        <p class="text-white text-sm">Place Holder</p>
      </div>
      <div class="flex flex-col items-center text-center">
        <div class="w-24 h-24 rounded-full border-4 border-orange-500 flex items-center justify-center mb-4">
          <span class="material-symbols-outlined text-orange-500 text-4xl unselectable" style="font-size: 70px !important">person</span>
        </div>
        <p class="text-orange-500 font-bold text-lg">Labunskyi Yaroslav</p>
        <p class="text-white text-sm">Place Holder</p>
        <p class="text-white text-sm">Place Holder</p>
      </div>
    </div>

    <!-- Project Information Section -->
    <h2 class="text-2xl md:text-3xl font-bold text-orange-500 mb-4">Project Information:</h2>
    <p class="text-white text-2xl mb-16 max-w-8xl">
      Tap&Play is a collection of minigames designed for web, where users can enjoy simple, fast, and visually styled experiences. Built with modern web technologies, this platform aims to be engaging and easily extensible.
    </p>

    <!-- Tools Section -->
    <h2 class="text-2xl md:text-3xl font-bold text-orange-500 mb-6">Tools:</h2>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-10 mt-15">
      <div class="flex flex-col items-center">
        <img src="/src/assets/Tools/vue.png" alt="Vue Logo" class="h-25 mb-2 unselectable" draggable="false"/>
        <p class="text-white text-3xl unselectable">Vue</p>
      </div>
      <div class="flex flex-col items-center">
        <img src="/src/assets/Tools/tailwindcss.png" alt="Tailwind Logo" class="h-25 mb-2 unselectable" draggable="false"/>
        <p class="text-white text-3xl unselectable">TailwindCSS</p>
      </div>
      <div class="flex flex-col items-center">
        <img src="/src/assets/Tools/javascript.png" alt="JavaScript Logo" class="h-25 mb-2 unselectable" draggable="false"/>
        <p class="text-white text-3xl unselectable">JavaScript</p>
      </div>
      <div class="flex flex-col items-center">
        <img src="/src/assets/Tools/firebase.png" alt="Firebase Logo" class="h-25 mb-2 unselectable" draggable="false"/>
        <p class="text-white text-3xl unselectable">Firebase</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.font-sci-fi {
  font-family: 'Orbitron', sans-serif;
}
.material-symbols-outlined {
  font-variation-settings:
      'FILL' 1,
      'wght' 700,
      'GRAD' 200,
      'opsz' 48;
  line-height: 1;
}
.unselectable {
  user-select: none;
}
</style>
<script setup lang="ts">
</script>
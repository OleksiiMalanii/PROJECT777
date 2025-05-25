<template>
  <section class="w-full h-[calc(100vh-64px)] flex items-center justify-center bg-transparent relative overflow-hidden">
    <!-- Decorative Background Sci-fi Images -->
    <img
        src="/src/assets/General/Scifi1.png"
        alt="Scifi Decoration 1"
        draggable="false"
        class="absolute top-40 left-50 w-80 z-20 unselectable"
    />
    <img
        src="/src/assets/General/Scifi2.png"
        alt="Scifi Decoration 2"
        draggable="false"
        class="absolute scale-150 bottom-1 w-96 z-20 unselectable"
    />
    <img
        src="/src/assets/General/Scifi3.png"
        alt="Scifi Decoration 3"
        draggable="false"
        class="absolute bottom-40 right-40 w-80 z-20 unselectable scale-x-[-1]"
    />

    <!-- Circle + Text -->
    <div class="relative flex items-center justify-center z-10">
      <img
          src="/src/assets/Circle.png"
          alt="Background Circle"
          draggable="false"
          class="w-96 md:w-[36rem] lg:w-[48rem] absolute z-0 unselectable"
      />
      <h2 class="text-8xl md:text-9xl font-bold text-white tracking-wide z-10 sci-fi-font unselectable">
        Tap&Play
      </h2>
    </div>

    <!-- Soldier Image -->
    <img
        src="/src/assets/Soldier1.png"
        alt="Soldier"
        draggable="false"
        class="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-auto h-[80vh] z-10 unselectable"
    />
  </section>
</template>


<style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap');

.sci-fi-font {
  font-family: 'Orbitron', sans-serif;
}

.unselectable {
  user-select: none;
}
</style>

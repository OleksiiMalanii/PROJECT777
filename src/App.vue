<template>
  <div class="bg-linear-to-t from-gray-900 to-indigo-950 min-h-screen relative">
    <Header />
    <Sidebar />
    <router-view />
    <Footer />
  </div>
</template>

<script setup>
import Header from '/src/components/Header.vue'
import Sidebar from '/src/components/Sidebar.vue'
import Footer from '/src/components/Footer.vue'
</script>

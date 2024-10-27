<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import Toast from 'primevue/toast';
import RouterViewComp from './components/RouterViewComp.vue';
</script>

<template>
  <Toast />
  <AppHeader />
  <RouterViewComp />
</template>

<style>
#app {
  background-color: transparent;
  height: 100vh;
  width: 100vw;
  margin: 0 auto;
  padding: 0;
}
</style>

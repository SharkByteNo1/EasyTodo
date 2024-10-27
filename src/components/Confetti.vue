<script setup lang="ts">
import { ref } from 'vue';
import confetti from 'canvas-confetti';

const fire = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.8 },
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'],
  });
};

defineExpose({ fire });
</script>

<template>
  <div class="confetti-container"></div>
</template>

<style scoped>
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}
</style>

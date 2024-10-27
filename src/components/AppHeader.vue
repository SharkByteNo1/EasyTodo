<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Menubar from 'primevue/menubar';

const router = useRouter();

const items = ref([
  {
    label: '待办事项',
    icon: 'pi pi-check-square',
    command: () => router.push('/todos'),
  },
  {
    label: '路线图',
    icon: 'pi pi-map',
    command: () => router.push('/roadmap'),
  },
]);
</script>

<template>
  <div class="header">
    <Menubar :model="items" class="border-none surface-card"> </Menubar>
  </div>
</template>

<style scoped>
.header {
  padding: 0.5rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
}

:deep(.p-menubar) {
  background: transparent;
  border: none;
  padding: 0;
}
</style>

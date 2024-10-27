<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import InputSwitch from 'primevue/inputswitch';
import Button from 'primevue/button';
import { type Settings } from '../types/todo';

const visible = ref(false);
const settings = ref<Settings>({
  theme: 'default',
  autoDeleteCompleted: false
});

const themeOptions = [
  { label: '默认主题', value: 'default' },
  { label: '日落', value: 'sunset' },
  { label: '海洋', value: 'ocean' },
  { label: '森林', value: 'forest' }
];

const emit = defineEmits(['update']);

onMounted(() => {
  const savedSettings = localStorage.getItem('todo-settings');
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings);
    emit('update', settings.value);
  }
});

const show = () => {
  visible.value = true;
};

const save = () => {
  localStorage.setItem('todo-settings', JSON.stringify(settings.value));
  emit('update', settings.value);
  visible.value = false;
};

defineExpose({ show });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    header="设置"
    class="settings-dialog"
    :style="{ width: '400px' }"
  >
    <div class="settings-content">
      <div class="setting-item">
        <label>主题</label>
        <Dropdown
          v-model="settings.theme"
          :options="themeOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <div class="setting-item">
        <label>自动删除已完成事项</label>
        <InputSwitch v-model="settings.autoDeleteCompleted" />
      </div>
    </div>

    <template #footer>
      <Button label="取消" text @click="visible = false" />
      <Button label="保存" severity="success" @click="save" />
    </template>
  </Dialog>
</template>

<style scoped>
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-item label {
  font-weight: 500;
  color: #666;
}

:deep(.p-dropdown) {
  width: 200px;
}
</style>
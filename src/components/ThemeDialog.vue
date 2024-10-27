<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ColorPicker from 'primevue/colorpicker';
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { type Topic } from '../types/roadmap';

const visible = ref(false);
const topics = ref<Topic[]>([]);
const newTopic = ref<Partial<Topic>>({
  color: '#4CAF50'
});

const emit = defineEmits(['update']);

const show = (currentTopics: Topic[]) => {
  topics.value = [...currentTopics];
  visible.value = true;
};

const addTopic = () => {
  if (!newTopic.value.name?.trim()) return;
  
  topics.value.push({
    id: Date.now(),
    name: newTopic.value.name,
    description: newTopic.value.description || '',
    color: newTopic.value.color || '#4CAF50'
  });
  
  newTopic.value = { color: '#4CAF50' };
};

const removeTopic = (id: number) => {
  topics.value = topics.value.filter(t => t.id !== id);
};

const save = () => {
  emit('update', topics.value);
  visible.value = false;
};

defineExpose({ show });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    header="主题管理"
    class="theme-dialog"
    :style="{ width: '800px' }"
  >
    <div class="theme-content">
      <div class="add-theme-form">
        <div class="form-grid">
          <InputText v-model="newTopic.name" placeholder="主题名称" />
          <InputText v-model="newTopic.description" placeholder="描述" />
          <ColorPicker v-model="newTopic.color" class="color-picker" />
          <Button 
            icon="pi pi-plus" 
            severity="success"
            @click="addTopic"
          />
        </div>
      </div>

      <DataTable :value="topics" class="theme-table">
        <Column field="name" header="名称"></Column>
        <Column field="description" header="描述"></Column>
        <Column field="color" header="颜色">
          <template #body="{ data }">
            <div class="color-preview" :style="{ backgroundColor: data.color }"></div>
          </template>
        </Column>
        <Column header="操作" style="width: 100px">
          <template #body="{ data }">
            <Button 
              icon="pi pi-trash" 
              text 
              severity="danger" 
              @click="removeTopic(data.id)" 
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <template #footer>
      <Button label="取消" text @click="visible = false" />
      <Button label="保存" severity="success" @click="save" />
    </template>
  </Dialog>
</template>

<style scoped>
.theme-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.add-theme-form {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: 2fr 3fr 100px 60px;
  gap: 1rem;
  align-items: center;
}

.color-picker {
  justify-self: center;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

:deep(.p-colorpicker) {
  width: 2.5rem;
  height: 2.5rem;
}

.theme-table {
  max-height: 300px;
  overflow-y: auto;
}

:deep(.p-datatable .p-datatable-thead > tr > th) {
  background: #f8f9fa;
  padding: 1rem;
}

:deep(.p-datatable .p-datatable-tbody > tr > td) {
  padding: 1rem;
}
</style>
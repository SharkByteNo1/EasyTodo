<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Calendar from 'primevue/calendar';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { type Todo, type TodoStep } from '../types/todo';

const visible = ref(false);
const todo = ref<Partial<Todo>>({
  priority: 'low',
  steps: [],
});
const newStep = ref('');
const isEdit = ref(false);

const priorityOptions = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
];

const emit = defineEmits(['save']);

const show = (editTodo?: Todo) => {
  if (editTodo) {
    todo.value = { ...editTodo };
    isEdit.value = true;
  } else {
    todo.value = { priority: 'low', steps: [] };
    isEdit.value = false;
  }
  visible.value = true;
};

const addStep = () => {
  if (!newStep.value.trim()) return;
  if (!todo.value.steps) todo.value.steps = [];
  
  todo.value.steps.push({
    id: Date.now(),
    text: newStep.value,
    completed: false,
  });
  newStep.value = '';
};

const removeStep = (stepId: number) => {
  if (!todo.value.steps) return;
  todo.value.steps = todo.value.steps.filter(step => step.id !== stepId);
};

const save = () => {
  if (!todo.value.text?.trim()) return;

  emit('save', {
    id: todo.value.id || Date.now(),
    text: todo.value.text,
    completed: todo.value.completed || false,
    dueDate: todo.value.dueDate,
    startDate: todo.value.startDate,
    priority: todo.value.priority || 'low',
    description: todo.value.description,
    steps: todo.value.steps || [],
  });
  visible.value = false;
};

defineExpose({ show });
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :header="isEdit ? '编辑任务' : '新建任务'"
    class="todo-dialog"
    :style="{ width: '50vw' }"
  >
    <div class="dialog-content">
      <div class="field">
        <label>任务名称</label>
        <InputText v-model="todo.text" class="w-full" />
      </div>

      <div class="field">
        <label>描述</label>
        <Textarea v-model="todo.description" rows="3" class="w-full" />
      </div>

      <div class="field">
        <label>步骤</label>
        <div class="steps-input">
          <InputText v-model="newStep" class="flex-1" placeholder="添加新步骤" @keyup.enter="addStep" />
          <Button icon="pi pi-plus" @click="addStep" />
        </div>
        <div v-if="todo.steps?.length" class="steps-list">
          <div v-for="step in todo.steps" :key="step.id" class="step-item">
            <span>{{ step.text }}</span>
            <Button icon="pi pi-times" text severity="danger" @click="removeStep(step.id)" />
          </div>
        </div>
      </div>

      <div class="flex gap-3">
        <div class="field flex-1">
          <label>开始时间</label>
          <Calendar v-model="todo.startDate" showTime class="w-full" />
        </div>

        <div class="field flex-1">
          <label>截止时间</label>
          <Calendar v-model="todo.dueDate" showTime class="w-full" />
        </div>
      </div>

      <div class="field">
        <label>优先级</label>
        <Dropdown
          v-model="todo.priority"
          :options="priorityOptions"
          class="w-full"
          optionLabel="label"
          optionValue="value"
        />
      </div>
    </div>

    <template #footer>
      <Button label="取消" size="small" @click="visible = false" text />
      <Button label="保存" size="small" @click="save" severity="success" />
    </template>
  </Dialog>
</template>

<style scoped>
.todo-dialog {
  min-width: 50vw;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 500;
  color: #666;
}

.steps-input {
  display: flex;
  gap: 0.5rem;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.step-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

:deep(.p-dialog-footer) {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

:deep(.p-dropdown) {
  width: 100%;
}
</style>
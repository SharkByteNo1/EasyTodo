<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Checkbox from 'primevue/checkbox';
import { TransitionGroup } from 'vue';
import { useDraggable } from '@vueuse/core';
import Confetti from './Confetti.vue';
import TodoDialog from './TodoDialog.vue';
import SettingsDialog from './SettingsDialog.vue';
import { type Todo, type TodoDialogRef, type Settings } from '../types/todo';

const todos = ref<Todo[]>([]);
const dialogRef = ref<TodoDialogRef>();
const settingsRef = ref();
const draggedTodo = ref<Todo | null>(null);
const confettiRef = ref();
const settings = ref<Settings>({
  theme: 'default',
  autoDeleteCompleted: false
});

onMounted(() => {
  const savedTodos = localStorage.getItem('todos');
  if (savedTodos) {
    todos.value = JSON.parse(savedTodos);
  }
});

const updateSettings = (newSettings: Settings) => {
  settings.value = newSettings;
};

const saveTodos = () => {
  localStorage.setItem('todos', JSON.stringify(todos.value));
};

const addOrUpdateTodo = (todo: Todo) => {
  const index = todos.value.findIndex((t) => t.id === todo.id);
  if (index > -1) {
    todos.value[index] = todo;
  } else {
    todos.value.unshift(todo);
  }
  saveTodos();
};

const removeTodo = (id: number) => {
  const index = todos.value.findIndex((todo) => todo.id === id);
  if (index > -1) {
    todos.value.splice(index, 1);
    saveTodos();
  }
};

const toggleTodo = (todo: Todo) => {
  const wasCompleted = todo.completed;
  todo.completed = !todo.completed;

  if (!wasCompleted && todo.completed) {
    confettiRef.value?.fire();
    if (settings.value.autoDeleteCompleted) {
      setTimeout(() => removeTodo(todo.id), 1000);
    }
  }
  saveTodos();
};

const toggleStep = (todo: Todo, stepId: number) => {
  const step = todo.steps.find(s => s.id === stepId);
  if (step) {
    step.completed = !step.completed;
    const allStepsCompleted = todo.steps.every(s => s.completed);
    if (allStepsCompleted && !todo.completed) {
      todo.completed = true;
      confettiRef.value?.fire();
      if (settings.value.autoDeleteCompleted) {
        setTimeout(() => removeTodo(todo.id), 1000);
      }
    } else if (!allStepsCompleted) {
      todo.completed = false;
    }
    saveTodos();
  }
};

const onDragStart = (todo: Todo) => {
  draggedTodo.value = todo;
};

const onDragEnd = () => {
  draggedTodo.value = null;
};

const onDrop = (event: DragEvent, targetTodo: Todo) => {
  if (!draggedTodo.value || draggedTodo.value.id === targetTodo.id) return;

  const draggedIndex = todos.value.findIndex(
    (t) => t.id === draggedTodo.value!.id
  );
  const targetIndex = todos.value.findIndex((t) => t.id === targetTodo.id);

  todos.value.splice(draggedIndex, 1);
  todos.value.splice(targetIndex, 0, draggedTodo.value);
  saveTodos();
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'var(--red-500)';
    case 'medium':
      return 'var(--yellow-500)';
    case 'low':
      return 'var(--green-500)';
    default:
      return 'var(--gray-500)';
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStepProgress = (todo: Todo) => {
  if (!todo.steps?.length) return '';
  const completed = todo.steps.filter(s => s.completed).length;
  return `${completed}/${todo.steps.length}`;
};

const containerClass = computed(() => {
  return {
    'todo-container': true,
    [`theme-${settings.value.theme}`]: true
  };
});
</script>

<template>
  <div :class="containerClass">
    <Confetti ref="confettiRef" />
    <TodoDialog ref="dialogRef" @save="addOrUpdateTodo" />
    <SettingsDialog ref="settingsRef" @update="updateSettings" />

    <div class="header">
      <h1 class="text-white">待办事项</h1>
      <div class="header-actions">
        <Button
          icon="pi pi-cog"
          text
          rounded
          @click="settingsRef.show()"
          class="settings-btn"
        />
        <Button
          label="新建任务"
          icon="pi pi-plus"
          @click="dialogRef?.show()"
          severity="success"
        />
      </div>
    </div>

    <TransitionGroup name="todo-list" tag="div" class="todo-list">
      <div
        v-for="todo in todos"
        :key="todo.id"
        class="todo-item"
        :class="{ 'todo-completed': todo.completed }"
        draggable="true"
        @dragstart="onDragStart(todo)"
        @dragend="onDragEnd"
        @dragover.prevent
        @drop="onDrop($event, todo)"
      >
        <div class="todo-content">
          <div class="checkbox-wrapper">
            <Checkbox
              :modelValue="todo.completed"
              @update:modelValue="toggleTodo(todo)"
              :binary="true"
            />
          </div>
          <div class="todo-details">
            <div class="todo-main">
              <span class="todo-text" :class="{ completed: todo.completed }">
                {{ todo.text }}
              </span>
              <div
                class="priority-indicator"
                :style="{ backgroundColor: getPriorityColor(todo.priority) }"
              />
            </div>
            <div class="todo-meta">
              <div v-if="todo.steps?.length" class="steps-container">
                <div v-for="step in todo.steps" :key="step.id" class="step-item">
                  <Checkbox
                    :modelValue="step.completed"
                    @update:modelValue="() => toggleStep(todo, step.id)"
                    :binary="true"
                  />
                  <span :class="{ completed: step.completed }">{{ step.text }}</span>
                </div>
                <div class="step-progress">{{ getStepProgress(todo) }}</div>
              </div>
              <span v-if="todo.dueDate" class="due-date">
                <i class="pi pi-clock" /> {{ formatDate(todo.dueDate) }}
              </span>
              <span v-if="todo.description" class="description-preview">
                {{ todo.description }}
              </span>
            </div>
          </div>
        </div>
        <div class="todo-actions">
          <Button
            icon="pi pi-pencil"
            text
            @click="dialogRef?.show(todo)"
            class="edit-btn"
          />
          <Button
            icon="pi pi-trash"
            severity="danger"
            text
            @click="removeTodo(todo.id)"
            class="delete-btn"
          />
        </div>
      </div>
    </TransitionGroup>

    <div v-if="todos.length === 0" class="empty-state">
      <i class="pi pi-check-circle empty-icon"></i>
      <span>没有待办事项，添加一个吧！</span>
    </div>
  </div>
</template>

<style scoped>
.todo-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  position: relative;
  min-height: calc(100vh - 4rem);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.theme-default {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}

.theme-sunset {
  background: linear-gradient(135deg, #ff6b6b 0%, #556270 100%);
}

.theme-ocean {
  background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);
}

.theme-forest {
  background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.settings-btn {
  color: #fff;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  color: #213547;
  cursor: move;
  min-height: 3.5rem;
  backdrop-filter: blur(10px);
}

.todo-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.todo-content {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 1rem;
  flex: 1;
}

.todo-details {
  flex: 1;
}

.todo-main {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.todo-meta {
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.priority-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.checkbox-wrapper :deep(.p-checkbox) {
  width: 20px;
  height: 20px;
}

.todo-text {
  font-size: 1rem;
  transition: all 0.3s ease;
  color: #213547;
}

.text-white {
  color: #eee;
}

.completed {
  text-decoration: line-through;
  color: #6c757d !important;
}

.todo-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.todo-item:hover .todo-actions {
  opacity: 1;
}

.empty-state {
  text-align: center;
  color: #fff;
  margin-top: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-icon {
  font-size: 4rem;
  opacity: 0.5;
}

.due-date {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.description-preview {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0.5rem 0;
  padding-left: 1rem;
  border-left: 2px solid #eee;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.step-progress {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

/* 列表动画 */
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.5s ease;
}

.todo-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.todo-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.todo-list-move {
  transition: transform 0.5s ease;
}

/* 完成状态动画 */
.todo-completed {
  background-color: rgba(248, 249, 250, 0.9);
  transition: background-color 0.3s ease;
}

@media (prefers-color-scheme: dark) {
  .todo-item {
    background-color: rgba(255, 255, 255, 0.95);
    color: #213547;
  }

  .todo-text {
    color: #213547;
  }
}
</style>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import Button from 'primevue/button';
import Timeline from 'primevue/timeline';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import ProgressBar from 'primevue/progressbar';
import ThemeDialog from '../components/ThemeDialog.vue';
import { useToast } from 'primevue/usetoast';
import { type RoadmapItem, type Topic } from '../types/roadmap';

const toast = useToast();
const items = ref<RoadmapItem[]>([]);
const topics = ref<Topic[]>([]);
const selectedYear = ref(2024);
const dialogVisible = ref(false);
const themeDialogRef = ref();
const editingItem = ref<Partial<RoadmapItem>>({
  year: 2024,
  quarter: 1,
  priority: 'medium',
  status: 'planned',
  progress: 0,
});

const quarters = [
  { label: 'Q1', value: 1 },
  { label: 'Q2', value: 2 },
  { label: 'Q3', value: 3 },
  { label: 'Q4', value: 4 },
];

const statuses = [
  { label: '计划中', value: 'planned' },
  { label: '进行中', value: 'in-progress' },
  { label: '已完成', value: 'completed' },
];

const priorities = [
  { label: '低', value: 'low' },
  { label: '中', value: 'medium' },
  { label: '高', value: 'high' },
];

watch(
  () => editingItem.value.progress,
  (newValue) => {
    if (newValue === 100) {
      editingItem.value.status = 'completed';
    } else if (newValue > 0) {
      editingItem.value.status = 'in-progress';
    } else {
      editingItem.value.status = 'planned';
    }
  }
);

onMounted(() => {
  const savedItems = localStorage.getItem('roadmap-items');
  const savedTopics = localStorage.getItem('roadmap-topics');
  const savedYears = localStorage.getItem('roadmap-years');

  if (savedItems) {
    items.value = JSON.parse(savedItems);
  }

  if (savedTopics) {
    topics.value = JSON.parse(savedTopics);
  } else {
    topics.value = [
      {
        id: 1,
        name: '个人发展',
        description: '个人技能提升和职业发展',
        color: '#4CAF50',
      },
      {
        id: 2,
        name: '项目里程碑',
        description: '重要项目节点',
        color: '#2196F3',
      },
      {
        id: 3,
        name: '学习计划',
        description: '新技术和知识学习',
        color: '#9C27B0',
      },
    ];
    localStorage.setItem('roadmap-topics', JSON.stringify(topics.value));
  }

  if (savedYears) {
    years.value = JSON.parse(savedYears);
  } else {
    years.value = [2024];
    localStorage.setItem('roadmap-years', JSON.stringify(years.value));
  }
});

const saveItems = () => {
  localStorage.setItem('roadmap-items', JSON.stringify(items.value));
};

const showDialog = (item?: RoadmapItem) => {
  if (item) {
    editingItem.value = { ...item };
  } else {
    editingItem.value = {
      year: selectedYear.value,
      quarter: 1,
      priority: 'medium',
      status: 'planned',
      progress: 0,
    };
  }
  dialogVisible.value = true;
};

const validateForm = () => {
  if (!editingItem.value.title?.trim()) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '请输入标题',
      life: 3000,
    });
    return false;
  }
  if (!editingItem.value.year) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '请选择年份',
      life: 3000,
    });
    return false;
  }
  if (!editingItem.value.quarter) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '请选择季度',
      life: 3000,
    });
    return false;
  }
  if (!editingItem.value.topic) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '请选择主题',
      life: 3000,
    });
    return false;
  }
  return true;
};

const saveItem = () => {
  if (!validateForm()) return;

  const newItem: RoadmapItem = {
    id: editingItem.value.id || Date.now(),
    title: editingItem.value.title!,
    description: editingItem.value.description || '',
    quarter: editingItem.value.quarter as 1 | 2 | 3 | 4,
    year: editingItem.value.year!,
    topic: editingItem.value.topic!,
    status: editingItem.value.status as 'planned' | 'in-progress' | 'completed',
    priority: editingItem.value.priority as 'low' | 'medium' | 'high',
    progress: editingItem.value.progress || 0,
  };

  const index = items.value.findIndex((item) => item.id === newItem.id);
  if (index > -1) {
    items.value[index] = newItem;
  } else {
    items.value.push(newItem);
  }

  saveItems();
  dialogVisible.value = false;
  toast.add({
    severity: 'success',
    summary: '成功',
    detail: '保存成功',
    life: 3000,
  });
};

const removeItem = (id: number) => {
  items.value = items.value.filter((item) => item.id !== id);
  saveItems();
};

const updateTopics = (newTopics: Topic[]) => {
  topics.value = newTopics;
  localStorage.setItem('roadmap-topics', JSON.stringify(topics.value));
};

const years = ref<number[]>([2024]);

const addYear = () => {
  const newYear = Math.max(...years.value) + 1;
  years.value.push(newYear);
  selectedYear.value = newYear;
  localStorage.setItem('roadmap-years', JSON.stringify(years.value));
};

const removeYear = (year: number) => {
  if (items.value.some((item) => item.year === year)) {
    toast.add({
      severity: 'error',
      summary: '错误',
      detail: '该年份下还有计划项目，无法删除',
      life: 3000,
    });
    return;
  }

  years.value = years.value.filter((y) => y !== year);
  if (selectedYear.value === year) {
    selectedYear.value = years.value[0];
  }
  localStorage.setItem('roadmap-years', JSON.stringify(years.value));
};

const quarterItems = computed(() => {
  const quarterMap = new Map<number, RoadmapItem[]>();
  quarters.forEach((q) => quarterMap.set(q.value, []));

  filteredItems.value.forEach((item) => {
    const quarterList = quarterMap.get(item.quarter) || [];
    quarterList.push(item);
  });

  return Array.from(quarterMap.entries()).map(([quarter, items]) => ({
    quarter,
    items: items.sort((a, b) => (b.priority === 'high' ? 1 : -1)),
  }));
});

const filteredItems = computed(() => {
  return items.value.filter((item) => item.year === selectedYear.value);
});

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planned':
      return 'var(--blue-500)';
    case 'in-progress':
      return 'var(--yellow-500)';
    case 'completed':
      return 'var(--green-500)';
    default:
      return 'var(--gray-500)';
  }
};

const getTopicColor = (topicName: string) => {
  const topic = topics.value.find((t) => t.name === topicName);
  return topic?.color || '#666';
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'planned':
      return 'pi pi-clock';
    case 'in-progress':
      return 'pi pi-spin pi-sync';
    case 'completed':
      return 'pi pi-check';
    default:
      return 'pi pi-circle';
  }
};
</script>

<template>
  <div class="roadmap-container">
    <div class="header">
      <h1>路线图</h1>
      <div class="filters">
        <div class="year-selector">
          <div v-for="year in years" :key="year" class="year-item">
            <Button
              :label="year.toString()"
              :severity="selectedYear === year ? 'success' : 'secondary'"
              @click="selectedYear = year"
              class="year-btn"
            />
            <Button
              icon="pi pi-times"
              text
              severity="danger"
              class="remove-year-btn"
              v-if="years.length > 1"
              @click="removeYear(year)"
            />
          </div>
          <Button
            icon="pi pi-plus"
            @click="addYear"
            class="add-year-btn"
            severity="secondary"
          />
        </div>
        <Button
          icon="pi pi-cog"
          text
          @click="themeDialogRef.show(topics)"
          class="mr-2"
        />
        <Button
          label="添加计划"
          icon="pi pi-plus"
          @click="showDialog()"
          severity="success"
        />
      </div>
    </div>

    <div class="quarters-grid">
      <div
        v-for="{ quarter, items } in quarterItems"
        :key="quarter"
        class="quarter-section"
      >
        <h2 class="quarter-title">Q{{ quarter }}</h2>
        <div class="items-container">
          <div v-for="item in items" :key="item.id" class="roadmap-item">
            <div
              class="item-marker"
              :style="{ backgroundColor: getTopicColor(item.topic) }"
            ></div>
            <div class="item-content">
              <div class="item-header">
                <div class="item-title">
                  <span
                    class="topic-tag"
                    :style="{
                      backgroundColor: getTopicColor(item.topic),
                    }"
                  >
                    {{ item.topic }}
                  </span>
                  <h3>{{ item.title }}</h3>
                </div>
                <div class="item-actions">
                  <Button icon="pi pi-pencil" text @click="showDialog(item)" />
                  <Button
                    icon="pi pi-trash"
                    text
                    severity="danger"
                    @click="removeItem(item.id)"
                  />
                </div>
              </div>
              <p class="item-description">{{ item.description }}</p>
              <ProgressBar :value="item.progress" :style="{ height: '4px' }" />
              <div class="item-status">
                <i
                  :class="getStatusIcon(item.status)"
                  :style="{ color: getStatusColor(item.status) }"
                />
                <span>{{
                  item.status === 'planned'
                    ? '计划中'
                    : item.status === 'in-progress'
                    ? '进行中'
                    : '已完成'
                }}</span>
              </div>
            </div>
          </div>
          <div v-if="items.length === 0" class="empty-quarter">
            <i class="pi pi-calendar"></i>
            <span>暂无计划</span>
          </div>
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="dialogVisible"
      :modal="true"
      :header="editingItem.id ? '编辑计划' : '新建计划'"
      class="roadmap-dialog"
      style="width: 50vw"
    >
      <form @submit.prevent="saveItem" class="dialog-content">
        <div class="field">
          <label>标题 <span class="required">*</span></label>
          <InputText v-model="editingItem.title" class="w-full" />
        </div>

        <div class="field">
          <label>描述</label>
          <Textarea v-model="editingItem.description" rows="3" class="w-full" />
        </div>

        <div class="flex gap-3">
          <div class="field flex-1">
            <label>年份 <span class="required">*</span></label>
            <Dropdown
              v-model="editingItem.year"
              :options="years"
              class="w-full"
            />
          </div>

          <div class="field flex-1">
            <label>季度 <span class="required">*</span></label>
            <Dropdown
              v-model="editingItem.quarter"
              :options="quarters"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
        </div>

        <div class="field">
          <label>主题 <span class="required">*</span></label>
          <Dropdown
            v-model="editingItem.topic"
            :options="topics.map((t) => ({ label: t.name, value: t.name }))"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>

        <div class="flex gap-3">
          <div class="field flex-1">
            <label>状态</label>
            <Dropdown
              v-model="editingItem.status"
              :options="statuses"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>

          <div class="field flex-1">
            <label>优先级</label>
            <Dropdown
              v-model="editingItem.priority"
              :options="priorities"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
          </div>
        </div>

        <div class="field">
          <label>进度 ({{ editingItem.progress }}%)</label>
          <InputText
            type="range"
            v-model="editingItem.progress"
            min="0"
            max="100"
            class="w-full"
          />
        </div>

        <div class="dialog-footer">
          <Button label="取消" @click="dialogVisible = false" text />
          <Button label="保存" type="submit" severity="success" />
        </div>
      </form>
    </Dialog>

    <ThemeDialog ref="themeDialogRef" @update="updateTopics" />
  </div>
</template>

<style scoped>
.roadmap-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #fff;
  margin: 0;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.year-selector {
  display: flex;
  flex-wrap: nowrap;
  gap: 0.5rem;
  margin-right: 1rem;
}

.year-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.year-btn {
  min-width: 80px;
}

.remove-year-btn {
  padding: 0.25rem;
}

.add-year-btn {
  width: 40px;
}

.quarters-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.quarter-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
}

.quarter-title {
  color: #fff;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
  text-align: center;
}

.items-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 100px;
}

.roadmap-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.item-marker {
  width: 4px;
}

.item-content {
  flex: 1;
  padding: 0.75rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.item-title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-title h3 {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.2;
  color: #333;
}

.topic-tag {
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  display: inline-block;
}

.item-description {
  color: #666;
  margin: 0.5rem 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

.item-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.roadmap-item:hover .item-actions {
  opacity: 1;
}

.item-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
}

.empty-quarter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 100px;
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.9rem;
}

.empty-quarter i {
  font-size: 1.5rem;
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

.required {
  color: var(--red-500);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>

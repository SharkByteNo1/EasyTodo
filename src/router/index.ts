import { createRouter, createWebHistory } from 'vue-router'
import TodoList from '../views/TodoList.vue'
import Roadmap from '../views/Roadmap.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/todos'
    },
    {
      path: '/todos',
      name: 'todos',
      component: TodoList
    },
    {
      path: '/roadmap',
      name: 'roadmap',
      component: Roadmap
    }
  ]
})

export default router
export interface TodoStep {
  id: number
  text: string
  completed: boolean
}

export interface Todo {
  id: number
  text: string
  completed: boolean
  dueDate?: string
  startDate?: string
  priority: 'low' | 'medium' | 'high'
  description?: string
  steps: TodoStep[]
}

export interface Settings {
  theme: 'default' | 'sunset' | 'ocean' | 'forest'
  autoDeleteCompleted: boolean
}

export interface TodoDialogRef {
  show: (todo?: Todo) => void
}
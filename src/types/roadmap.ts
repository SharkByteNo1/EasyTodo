export interface RoadmapItem {
  id: number
  title: string
  description: string
  quarter: 1 | 2 | 3 | 4
  year: number
  topic: string
  status: 'planned' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  progress: number
}

export interface Topic {
  id: number
  name: string
  description: string
  color: string
}
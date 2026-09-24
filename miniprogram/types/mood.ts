import type { MoodType } from './design-system'

export interface Mood {
  id: string
  userId: string
  relationshipId: string
  type: MoodType
  customLabel?: string
  dateKey: string
  createdAt: number
  updatedAt: number
}

export interface MoodPresentation {
  type: MoodType
  label: string
  icon: string
}

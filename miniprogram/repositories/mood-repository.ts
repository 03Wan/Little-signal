import type { Mood, MoodType } from '../types'

export interface MoodRepository {
  setMood(relationshipId: string, userId: string, type: MoodType, customLabel?: string): Promise<Mood>
  getTodayMood(relationshipId: string, userId: string): Promise<Mood | null>
  clearTodayMood(userId: string): Promise<void>
  deleteRelationshipData(relationshipId: string): Promise<void>
}

import type { Mood, MoodType } from '../../types'
import type { MoodRepository } from '../mood-repository'

const moods: Mood[] = []
let nextMoodId = 1

export function getMoodDateKey(date = new Date()): string {
  const pad = (value: number) => `${value}`.padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function copyMood(mood: Mood): Mood {
  return { ...mood }
}

export const mockMoodRepository: MoodRepository = {
  async setMood(relationshipId: string, userId: string, type: MoodType, customLabel?: string): Promise<Mood> {
    const now = Date.now()
    const dateKey = getMoodDateKey(new Date(now))
    const existingMood = moods.find((mood) => mood.userId === userId && mood.dateKey === dateKey)
    if (existingMood) {
      existingMood.relationshipId = relationshipId
      existingMood.type = type
      existingMood.customLabel = type === 'custom' ? customLabel?.trim() : undefined
      existingMood.updatedAt = now
      return copyMood(existingMood)
    }

    const mood: Mood = {
      id: `mock-mood-${nextMoodId++}`,
      userId,
      relationshipId,
      type,
      customLabel: type === 'custom' ? customLabel?.trim() : undefined,
      dateKey,
      createdAt: now,
      updatedAt: now
    }
    moods.push(mood)
    return copyMood(mood)
  },
  async getTodayMood(relationshipId: string, userId: string): Promise<Mood | null> {
    const dateKey = getMoodDateKey()
    const mood = moods.find((item) => item.userId === userId && item.relationshipId === relationshipId && item.dateKey === dateKey)
    return mood ? copyMood(mood) : null
  },
  async clearTodayMood(userId: string): Promise<void> {
    const dateKey = getMoodDateKey()
    const currentIndex = moods.findIndex((mood) => mood.userId === userId && mood.dateKey === dateKey)
    if (currentIndex >= 0) moods.splice(currentIndex, 1)
  },
  async deleteRelationshipData(relationshipId): Promise<void> {
    for (let index = moods.length - 1; index >= 0; index -= 1) {
      if (moods[index].relationshipId === relationshipId) moods.splice(index, 1)
    }
  }
}

export function getMockMoods(): Mood[] {
  return moods.map(copyMood)
}

export function clearMockMoods(): void {
  moods.length = 0
  nextMoodId = 1
}

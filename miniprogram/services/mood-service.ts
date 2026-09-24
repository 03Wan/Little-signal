import { getActiveRelationship } from './relationship-service'
import { getCurrentMockUser } from './signal-service'
import { getMockPartner, mockMoodRepository } from '../repositories/mock/index'
import type { Mood, MoodPresentation, MoodType } from '../types'

export const DEFAULT_MOOD: MoodPresentation = {
  type: 'okay',
  label: '今天没有留下状态',
  icon: '·'
}

export const MOOD_OPTIONS: MoodPresentation[] = [
  { type: 'great', label: '今天很好', icon: '☀' },
  { type: 'okay', label: '还不错', icon: '⛅' },
  { type: 'tired', label: '有点累', icon: '☁' },
  { type: 'sad', label: '心情不好', icon: '🌧' },
  { type: 'quiet', label: '想安静一下', icon: '☾' },
  { type: 'available', label: '可以找我', icon: '○' },
  { type: 'later', label: '晚点找我', icon: '◷' }
]

function getOption(type: MoodType, customLabel?: string): MoodPresentation {
  if (type === 'custom') return { type, label: customLabel?.trim() || '自定义状态', icon: '✦' }
  return MOOD_OPTIONS.find((option) => option.type === type) ?? DEFAULT_MOOD
}

export async function getCurrentUserMood(): Promise<Mood | null> {
  const user = getCurrentMockUser()
  const relationship = await getActiveRelationship(user.id)
  return mockMoodRepository.getTodayMood(relationship?.id ?? 'mock-relationship', user.id)
}

export async function getPartnerTodayMood(userId: string): Promise<MoodPresentation> {
  const partner = getMockPartner(userId)
  const relationship = await getActiveRelationship(userId)
  const mood = await mockMoodRepository.getTodayMood(relationship?.id ?? 'mock-relationship', partner.id)
  return mood ? getOption(mood.type, mood.customLabel) : DEFAULT_MOOD
}

export async function setCurrentUserMood(type: MoodType, customLabel?: string): Promise<Mood> {
  const user = getCurrentMockUser()
  const relationship = await getActiveRelationship(user.id)
  if (type === 'custom' && !customLabel?.trim()) throw new Error('请输入状态内容')
  return mockMoodRepository.setMood(relationship?.id ?? 'mock-relationship', user.id, type, customLabel?.trim())
}

export async function clearCurrentUserMood(): Promise<void> {
  const user = getCurrentMockUser()
  await mockMoodRepository.clearTodayMood(user.id)
}

export function getMoodPresentation(type: MoodType, customLabel?: string): MoodPresentation {
  return getOption(type, customLabel)
}

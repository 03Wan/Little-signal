import type { NotificationSetting, NotificationSettingPatch } from '../../types'
import type { NotificationSettingRepository } from '../notification-setting-repository'

const settingsByUser = new Map<string, NotificationSetting>()
const DEFAULT_SETTINGS = {
  signalEnabled: true,
  responseEnabled: true,
  quietHoursEnabled: false,
  quietStart: '23:00',
  quietEnd: '08:00'
} as const

function isValidTime(value: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return false
  const hours = Number(match[1])
  const minutes = Number(match[2])
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
}

function validatePatch(patch: NotificationSettingPatch): void {
  for (const key of ['quietStart', 'quietEnd'] as const) {
    const value = patch[key]
    if (value !== undefined && !isValidTime(value)) throw new Error('请选择有效的时间')
  }
}

function getOrCreate(userId: string): NotificationSetting {
  const existing = settingsByUser.get(userId)
  if (existing) return existing
  const setting: NotificationSetting = { userId, ...DEFAULT_SETTINGS, updatedAt: Date.now() }
  settingsByUser.set(userId, setting)
  return setting
}

function copy(setting: NotificationSetting): NotificationSetting {
  return { ...setting }
}

export const mockNotificationSettingRepository: NotificationSettingRepository = {
  async get(userId) {
    if (!userId) throw new Error('User is required')
    return copy(getOrCreate(userId))
  },
  async update(userId, patch) {
    if (!userId) throw new Error('User is required')
    validatePatch(patch)
    const next: NotificationSetting = { ...getOrCreate(userId), ...patch, updatedAt: Date.now() }
    settingsByUser.set(userId, next)
    return copy(next)
  }
}

export function getMockNotificationSettings(): NotificationSetting[] {
  return [...settingsByUser.values()].map(copy)
}

export function clearMockNotificationSettings(): void {
  settingsByUser.clear()
}

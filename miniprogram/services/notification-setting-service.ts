import { mockNotificationSettingRepository } from '../repositories/mock/index'
import { getMockCurrentUser } from '../repositories/mock/session-repository'
import type { NotificationKind, NotificationSetting, NotificationSettingPatch } from '../types'

function minutesOfDay(value: string | undefined): number | null {
  if (!value) return null
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

export function isQuietTime(setting: NotificationSetting, at = Date.now()): boolean {
  if (!setting.quietHoursEnabled) return false
  const start = minutesOfDay(setting.quietStart)
  const end = minutesOfDay(setting.quietEnd)
  if (start === null || end === null || start === end) return false

  const now = new Date(at)
  const current = now.getHours() * 60 + now.getMinutes()
  return start < end
    ? current >= start && current < end
    : current >= start || current < end
}

/** Reminder policy only. Signal persistence and delivery do not depend on this result. */
export function shouldDeliverNotification(kind: NotificationKind, setting: NotificationSetting, at = Date.now()): boolean {
  if (kind === 'signal' && !setting.signalEnabled) return false
  if (kind === 'response' && !setting.responseEnabled) return false
  return !isQuietTime(setting, at)
}

export async function getCurrentNotificationSetting(): Promise<NotificationSetting> {
  const user = getMockCurrentUser()
  return mockNotificationSettingRepository.get(user.id)
}

export async function updateCurrentNotificationSetting(patch: NotificationSettingPatch): Promise<NotificationSetting> {
  const user = getMockCurrentUser()
  return mockNotificationSettingRepository.update(user.id, patch)
}

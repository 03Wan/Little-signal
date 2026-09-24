import type { NotificationSetting, NotificationSettingPatch } from '../types'

export interface NotificationSettingRepository {
  get(userId: string): Promise<NotificationSetting>
  update(userId: string, patch: NotificationSettingPatch): Promise<NotificationSetting>
}

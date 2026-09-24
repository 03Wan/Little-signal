export type NotificationKind = 'signal' | 'response'

export interface NotificationSetting {
  userId: string
  signalEnabled: boolean
  responseEnabled: boolean
  quietHoursEnabled: boolean
  quietStart?: string
  quietEnd?: string
  updatedAt: number
}

export type NotificationSettingPatch = Partial<Pick<NotificationSetting,
  'signalEnabled' | 'responseEnabled' | 'quietHoursEnabled' | 'quietStart' | 'quietEnd'
>>

export type NotificationSubscriptionResult = 'accepted' | 'rejected' | 'unavailable'

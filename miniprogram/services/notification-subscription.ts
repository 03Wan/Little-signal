import type { NotificationKind, NotificationSubscriptionResult } from '../types'

/**
 * Replaceable boundary for a future WeChat subscription-message adapter.
 * The current Mock stage deliberately has no platform API implementation.
 */
export interface NotificationSubscriptionService {
  requestSubscription(kind: NotificationKind): Promise<NotificationSubscriptionResult>
}

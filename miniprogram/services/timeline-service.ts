import type { CustomSignal, SignalResponseType, TimelineEntry, TimelinePage } from '../types'
import { getCurrentMockPartner, getCurrentMockUser, getSignalResponse, getTimelineSignals } from './signal-service'
import { listCustomSignals } from './custom-signal-service'
import { SIGNAL_OPTIONS } from '../utils/signals'

const responseLabels: Record<SignalResponseType, string> = {
  received: '接住了',
  me_too: '我也在',
  hug: '抱一下',
  later: '稍后回应',
  available_now: '现在有空',
  busy: '现在不方便'
}

function getDateKey(timestamp: number): string {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDateLabel(timestamp: number, now: Date): string {
  const date = new Date(timestamp)
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const monthDay = `${date.getMonth() + 1} 月 ${date.getDate()} 日`
  if (getDateKey(timestamp) === getDateKey(now.getTime())) return `今天 · ${monthDay}`
  if (getDateKey(timestamp) === getDateKey(yesterday.getTime())) return `昨天 · ${monthDay}`
  return `${date.getFullYear()} 年 ${monthDay}`
}

function getDescription(type: string, customSignalId: string | undefined, customSignals: CustomSignal[]): { icon: string; description: string } {
  if (type === 'custom') {
    const customSignal = customSignals.find((item) => item.id === customSignalId)
    return { icon: customSignal?.emoji ?? '✦', description: customSignal?.name ?? '自定义暗号' }
  }
  const option = SIGNAL_OPTIONS.find((item) => item.type === type)
  return { icon: option?.icon ?? '◌', description: option?.pickerLabel ?? '一个小信号' }
}

export async function getTimelinePage(cursor?: string): Promise<TimelinePage> {
  const pageSize = 8
  const loadedSignals = await getTimelineSignals(cursor, pageSize + 1)
  const hasMore = loadedSignals.length > pageSize
  const signals = loadedSignals.slice(0, pageSize)
  let customSignals: CustomSignal[] = []
  try { customSignals = await listCustomSignals() } catch { customSignals = [] }
  const now = new Date()
  const currentUser = getCurrentMockUser()
  const partner = getCurrentMockPartner()
  const entries = await Promise.all(signals.map(async (signal, index): Promise<TimelineEntry> => {
    const response = signal.status === 'responded' ? await getSignalResponse(signal.id) : null
    const visual = getDescription(signal.type, signal.customSignalId, customSignals)
    const date = new Date(signal.createdAt)
    const senderName = signal.senderId === currentUser.id ? currentUser.name : partner.name
    return {
      timelineId: signal.id,
      signal,
      response,
      dateKey: getDateKey(signal.createdAt),
      dateLabel: getDateLabel(signal.createdAt, now),
      startsDateGroup: index === 0 || getDateKey(signals[index - 1].createdAt) !== getDateKey(signal.createdAt),
      timeLabel: `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`,
      senderName,
      icon: visual.icon,
      description: visual.description,
      responseLabel: response ? responseLabels[response.type] : signal.noReply ? '无需回复' : ''
    }
  }))
  return { entries, nextCursor: hasMore && signals.length ? signals[signals.length - 1].id : null }
}

export async function getAllTimelineEntries(): Promise<TimelineEntry[]> {
  const entries: TimelineEntry[] = []
  let cursor: string | undefined
  do {
    const page = await getTimelinePage(cursor)
    entries.push(...page.entries)
    cursor = page.nextCursor ?? undefined
  } while (cursor)
  return entries
}

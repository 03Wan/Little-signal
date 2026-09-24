import type { Signal, SignalResponse } from './signal'

export interface TimelineEntry {
  timelineId: string
  signal: Signal
  response: SignalResponse | null
  dateKey: string
  dateLabel: string
  startsDateGroup: boolean
  timeLabel: string
  senderName: string
  icon: string
  description: string
  responseLabel: string
}

export interface TimelinePage {
  entries: TimelineEntry[]
  nextCursor: string | null
}

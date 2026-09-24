import type { CreateSignalInput, DeferredSignal, Signal, SignalResponse, SignalResponseType } from '../../types'
import type { SignalRepository } from '../signal-repository'

const MOCK_RELATIONSHIP_ID = 'mock-relationship'
const PAGE_SIZE = 8

function timestampDaysAgo(daysAgo: number, hour: number, minute: number): number {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, minute, 0, 0)
  return date.getTime()
}

function makeTimelineFixture(
  id: string,
  senderId: string,
  type: Signal['type'],
  daysAgo: number,
  hour: number,
  minute: number,
  options: { noReply?: boolean; status?: Signal['status']; customSignalId?: string } = {}
): Signal {
  return {
    id,
    relationshipId: MOCK_RELATIONSHIP_ID,
    senderId,
    receiverId: senderId === 'mock-user-a' ? 'mock-user-b' : 'mock-user-a',
    type,
    customSignalId: options.customSignalId,
    noReply: options.noReply ?? false,
    silent: false,
    createdAt: timestampDaysAgo(daysAgo, hour, minute),
    receivedAt: timestampDaysAgo(daysAgo, hour, minute),
    status: options.status ?? 'received'
  }
}

const signals: Signal[] = [
  makeTimelineFixture('mock-timeline-01', 'mock-user-b', 'goodnight', 0, 21, 48, { status: 'responded' }),
  makeTimelineFixture('mock-timeline-02', 'mock-user-a', 'hug', 0, 18, 21, { noReply: true }),
  makeTimelineFixture('mock-timeline-03', 'mock-user-b', 'tired', 1, 21, 16),
  makeTimelineFixture('mock-timeline-04', 'mock-user-a', 'home', 1, 18, 9, { status: 'responded' }),
  makeTimelineFixture('mock-timeline-05', 'mock-user-b', 'thinking_of_you', 3, 20, 32),
  makeTimelineFixture('mock-timeline-06', 'mock-user-a', 'happy', 5, 17, 42, { noReply: true }),
  makeTimelineFixture('mock-timeline-07', 'mock-user-b', 'knock', 8, 23, 4, { status: 'responded' }),
  makeTimelineFixture('mock-timeline-08', 'mock-user-a', 'hug', 12, 19, 27),
  makeTimelineFixture('mock-timeline-09', 'mock-user-b', 'home', 18, 18, 56),
  makeTimelineFixture('mock-timeline-10', 'mock-user-a', 'goodnight', 25, 22, 14, { status: 'responded' }),
  makeTimelineFixture('mock-timeline-11', 'mock-user-b', 'tired', 39, 16, 28, { noReply: true }),
  makeTimelineFixture('mock-timeline-12', 'mock-user-a', 'thinking_of_you', 64, 11, 5)
]
const responses: SignalResponse[] = [
  { id: 'mock-timeline-response-01', signalId: 'mock-timeline-01', relationshipId: MOCK_RELATIONSHIP_ID, senderId: 'mock-user-a', receiverId: 'mock-user-b', type: 'me_too', createdAt: timestampDaysAgo(0, 21, 50) },
  { id: 'mock-timeline-response-02', signalId: 'mock-timeline-04', relationshipId: MOCK_RELATIONSHIP_ID, senderId: 'mock-user-b', receiverId: 'mock-user-a', type: 'received', createdAt: timestampDaysAgo(1, 18, 10) },
  { id: 'mock-timeline-response-03', signalId: 'mock-timeline-07', relationshipId: MOCK_RELATIONSHIP_ID, senderId: 'mock-user-a', receiverId: 'mock-user-b', type: 'hug', createdAt: timestampDaysAgo(8, 23, 6) },
  { id: 'mock-timeline-response-04', signalId: 'mock-timeline-10', relationshipId: MOCK_RELATIONSHIP_ID, senderId: 'mock-user-b', receiverId: 'mock-user-a', type: 'received', createdAt: timestampDaysAgo(25, 22, 17) }
]
const deferredSignals: DeferredSignal[] = []
let nextSignalId = 1
let nextResponseId = 1
let nextDeferredId = 1
let failNextCreate = false

function copySignal(signal: Signal): Signal {
  return { ...signal }
}

function findSignal(id: string): Signal {
  const signal = signals.find((item) => item.id === id)
  if (!signal) throw new Error('Signal not found')
  return signal
}

export const mockSignalRepository: SignalRepository = {
  async createSignal(input: CreateSignalInput): Promise<Signal> {
    const signal: Signal = {
      id: `mock-signal-${nextSignalId++}`,
      relationshipId: input.relationshipId,
      senderId: input.senderId,
      receiverId: input.receiverId,
      type: input.type,
      customSignalId: input.customSignalId,
      imageId: input.imageId,
      message: input.message,
      noReply: input.noReply,
      silent: input.silent ?? false,
      createdAt: Date.now(),
      status: 'sending'
    }
    signals.push(signal)
    await Promise.resolve()
    if (failNextCreate) {
      failNextCreate = false
      signal.status = 'failed'
      throw new Error('Mock signal send failed')
    }
    signal.status = 'sent'
    return copySignal(signal)
  },
  async retrySignal(id: string): Promise<Signal> {
    const signal = findSignal(id)
    if (signal.status !== 'failed') throw new Error('Only failed signals can be retried')
    signal.status = 'sending'
    await Promise.resolve()
    signal.status = 'sent'
    return copySignal(signal)
  },
  async getSignal(id: string): Promise<Signal | null> {
    const signal = signals.find((item) => item.id === id)
    return signal ? copySignal(signal) : null
  },
  async getInbox(userId: string): Promise<Signal[]> {
    const inbox = signals.filter((signal) => signal.receiverId === userId && signal.status !== 'failed' && signal.status !== 'deleted')
    const now = Date.now()
    inbox.forEach((signal) => {
      if (signal.status === 'sent') {
        signal.status = 'received'
        signal.receivedAt = now
      }
    })
    return inbox.map(copySignal).reverse()
  },
  async getSent(userId: string): Promise<Signal[]> {
    return signals.filter((signal) => signal.senderId === userId && signal.status !== 'deleted').map(copySignal).reverse()
  },
  async getTimeline(relationshipId: string, cursor?: string, limit = PAGE_SIZE): Promise<Signal[]> {
    const sorted = signals
      .filter((signal) => signal.relationshipId === relationshipId && signal.status !== 'deleted' && signal.status !== 'failed')
      .sort((first, second) => second.createdAt - first.createdAt || second.id.localeCompare(first.id))
    const cursorIndex = cursor ? sorted.findIndex((item) => item.id === cursor) : -1
    const start = cursor && cursorIndex >= 0 ? cursorIndex + 1 : 0
    return sorted.slice(start, start + limit).map(copySignal)
  },
  async getResponse(signalId: string): Promise<SignalResponse | null> {
    const response = responses.find((item) => item.signalId === signalId)
    return response ? { ...response } : null
  },
  async respond(signalId: string, type: SignalResponseType): Promise<SignalResponse> {
    const signal = findSignal(signalId)
    if (signal.noReply) throw new Error('This signal does not accept a response')
    if (signal.status !== 'received') throw new Error('Signal is not awaiting a response')
    if (responses.some((item) => item.signalId === signalId)) throw new Error('Signal already has a response')
    const response: SignalResponse = {
      id: `mock-response-${nextResponseId++}`,
      signalId,
      relationshipId: signal.relationshipId,
      senderId: signal.receiverId,
      receiverId: signal.senderId,
      type,
      createdAt: Date.now()
    }
    responses.push(response)
    signal.status = 'responded'
    return { ...response }
  },
  async deferSignal(input: CreateSignalInput): Promise<DeferredSignal> {
    const deferred: DeferredSignal = {
      id: `mock-deferred-${nextDeferredId++}`,
      input: { ...input },
      createdAt: Date.now()
    }
    deferredSignals.push(deferred)
    return { ...deferred, input: { ...deferred.input } }
  },
  async deleteRelationshipData(relationshipId): Promise<void> {
    const deletedSignalIds = new Set(signals.filter((signal) => signal.relationshipId === relationshipId).map((signal) => signal.id))
    for (let index = signals.length - 1; index >= 0; index -= 1) {
      if (signals[index].relationshipId === relationshipId) signals.splice(index, 1)
    }
    for (let index = responses.length - 1; index >= 0; index -= 1) {
      if (responses[index].relationshipId === relationshipId || deletedSignalIds.has(responses[index].signalId)) responses.splice(index, 1)
    }
    for (let index = deferredSignals.length - 1; index >= 0; index -= 1) {
      if (deferredSignals[index].input.relationshipId === relationshipId) deferredSignals.splice(index, 1)
    }
  }
}

export function getMockSignals(): Signal[] {
  return signals.map(copySignal)
}

export function getMockResponses(): SignalResponse[] {
  return responses.map((response) => ({ ...response }))
}

export function getMockDeferredSignals(): DeferredSignal[] {
  return deferredSignals.map((item) => ({ ...item, input: { ...item.input } }))
}

export function setMockNextSendFailure(shouldFail = true): void {
  failNextCreate = shouldFail
}

export function clearMockSignals(): void {
  signals.length = 0
  responses.length = 0
  deferredSignals.length = 0
  nextSignalId = 1
  nextResponseId = 1
  nextDeferredId = 1
  failNextCreate = false
}

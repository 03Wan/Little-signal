import type { CreateSignalInput, DeferredSignal, Signal, SignalResponse, SignalResponseType } from '../types'
import { getMockCurrentUser, getMockPartner, mockSignalRepository, switchMockUser } from '../repositories/mock/index'

export const MOCK_RELATIONSHIP_ID = 'mock-relationship'
const sendingUsers = new Set<string>()

export function getCurrentMockUser() {
  return getMockCurrentUser()
}

export function getCurrentMockPartner() {
  return getMockPartner(getMockCurrentUser().id)
}

export function switchCurrentMockUser() {
  return switchMockUser()
}

export function isDevelopmentEnvironment(): boolean {
  try {
    return wx.getAccountInfoSync().miniProgram.envVersion === 'develop'
  } catch {
    return false
  }
}

export function createInputForCurrentUser(type: CreateSignalInput['type'], noReply: boolean, customSignalId?: string): CreateSignalInput {
  const user = getMockCurrentUser()
  const partner = getMockPartner(user.id)
  return {
    relationshipId: MOCK_RELATIONSHIP_ID,
    senderId: user.id,
    receiverId: partner.id,
    type,
    customSignalId,
    noReply
  }
}

export function sendSignal(input: CreateSignalInput): Promise<Signal> {
  if (sendingUsers.has(input.senderId)) return Promise.reject(new Error('A signal is already being sent'))
  sendingUsers.add(input.senderId)
  return mockSignalRepository.createSignal(input).finally(() => sendingUsers.delete(input.senderId))
}

export function retrySignal(signalId: string): Promise<Signal> {
  return mockSignalRepository.retrySignal(signalId)
}

export function deferSignal(input: CreateSignalInput): Promise<DeferredSignal> {
  return mockSignalRepository.deferSignal(input)
}

export function getInbox(userId: string): Promise<Signal[]> {
  return mockSignalRepository.getInbox(userId)
}

export function getSentSignals(userId: string): Promise<Signal[]> {
  return mockSignalRepository.getSent(userId)
}

export function getTimelineSignals(cursor?: string, limit?: number): Promise<Signal[]> {
  return mockSignalRepository.getTimeline(MOCK_RELATIONSHIP_ID, cursor, limit)
}

export function getSignal(signalId: string): Promise<Signal | null> {
  return mockSignalRepository.getSignal(signalId)
}

export function getSignalResponse(signalId: string): Promise<SignalResponse | null> {
  return mockSignalRepository.getResponse(signalId)
}

export function respondToSignal(signalId: string, type: SignalResponseType): Promise<SignalResponse> {
  return mockSignalRepository.respond(signalId, type)
}

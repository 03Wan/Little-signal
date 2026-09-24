import { mockCapsuleRepository } from '../repositories/mock/index'
import type { Capsule, CreateCapsuleInput } from '../types'
import { getCurrentMockPartner, getCurrentMockUser } from './signal-service'

export function getCapsuleServerTime(): Promise<number> {
  return mockCapsuleRepository.getServerTime()
}

export async function listCapsules(): Promise<Capsule[]> {
  const user = getCurrentMockUser()
  return mockCapsuleRepository.listCapsules('mock-relationship', user.id)
}

export async function createCapsule(input: Pick<CreateCapsuleInput, 'content' | 'imageId' | 'unlockAt'>): Promise<Capsule> {
  const user = getCurrentMockUser()
  const partner = getCurrentMockPartner()
  return mockCapsuleRepository.createCapsule({
    relationshipId: 'mock-relationship',
    senderId: user.id,
    receiverId: partner.id,
    ...input
  })
}

export async function getCapsule(id: string): Promise<Capsule | null> {
  const user = getCurrentMockUser()
  return mockCapsuleRepository.getCapsule(id, 'mock-relationship', user.id)
}

export async function openCapsule(id: string): Promise<Capsule> {
  const user = getCurrentMockUser()
  return mockCapsuleRepository.openCapsule(id, 'mock-relationship', user.id)
}

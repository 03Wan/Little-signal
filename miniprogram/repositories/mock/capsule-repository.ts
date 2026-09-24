import type { Capsule, CreateCapsuleInput } from '../../types'
import { getMockUser } from './session-repository'
import type { CapsuleRepository } from '../capsule-repository'

const MOCK_RELATIONSHIP_ID = 'mock-relationship'
const capsules: Capsule[] = []
let nextId = 1
let serverTimeOffsetMs = 0

function getServerNow(): number {
  return Date.now() + serverTimeOffsetMs
}

function makeFixture(id: string, status: Capsule['status'], createdOffset: number, unlockOffset: number, openedOffset?: number, imageId?: string): Capsule {
  const now = getServerNow()
  return {
    id,
    relationshipId: MOCK_RELATIONSHIP_ID,
    senderId: 'mock-user-a',
    receiverId: 'mock-user-b',
    content: id === 'mock-capsule-locked' ? '留给未来的一句话，只在解锁后可见。' : id === 'mock-capsule-unlocked' ? '过去留在这里的信号。' : '很高兴那天留下了这句话。',
    imageId,
    createdAt: now + createdOffset,
    unlockAt: now + unlockOffset,
    openedAt: openedOffset === undefined ? undefined : now + openedOffset,
    status
  }
}

capsules.push(
  makeFixture('mock-capsule-locked', 'locked', -2 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000),
  makeFixture('mock-capsule-unlocked', 'unlocked', -12 * 24 * 60 * 60 * 1000, -60 * 60 * 1000),
  makeFixture('mock-capsule-opened', 'opened', -35 * 24 * 60 * 60 * 1000, -30 * 24 * 60 * 60 * 1000, -25 * 24 * 60 * 60 * 1000, 'mock://capsule/opened-photo')
)

function getStatus(capsule: Capsule, now: number): Capsule['status'] {
  if (capsule.status === 'deleted') return 'deleted'
  if (capsule.openedAt !== undefined) return 'opened'
  return now >= capsule.unlockAt ? 'unlocked' : 'locked'
}

function copyForMember(capsule: Capsule, now: number): Capsule {
  const status = getStatus(capsule, now)
  const copy: Capsule = { ...capsule, status }
  if (status !== 'opened') {
    delete copy.content
    delete copy.imageId
    delete copy.openedAt
  }
  return copy
}

async function assertMember(relationshipId: string, memberId: string): Promise<void> {
  if (relationshipId !== MOCK_RELATIONSHIP_ID || !getMockUser(memberId)) throw new Error('Only relationship members can access capsules')
}

export const mockCapsuleRepository: CapsuleRepository = {
  async getServerTime() {
    return getServerNow()
  },
  async createCapsule(input: CreateCapsuleInput) {
    const serverNow = getServerNow()
    if (input.unlockAt <= serverNow) throw new Error('请选择未来的时间')
    if (!getMockUser(input.senderId) || !getMockUser(input.receiverId) || input.senderId === input.receiverId) throw new Error('Capsule participants are invalid')
    if (input.relationshipId !== MOCK_RELATIONSHIP_ID) throw new Error('Active relationship not found')
    const capsule: Capsule = {
      id: `mock-capsule-${nextId++}`,
      relationshipId: input.relationshipId,
      senderId: input.senderId,
      receiverId: input.receiverId,
      content: input.content,
      imageId: input.imageId,
      createdAt: serverNow,
      unlockAt: input.unlockAt,
      status: 'locked'
    }
    capsules.push(capsule)
    return copyForMember(capsule, serverNow)
  },
  async listCapsules(relationshipId, memberId) {
    await assertMember(relationshipId, memberId)
    const serverNow = getServerNow()
    return capsules.filter((item) => item.relationshipId === relationshipId && item.status !== 'deleted').map((item) => copyForMember(item, serverNow)).sort((first, second) => second.createdAt - first.createdAt)
  },
  async getCapsule(id, relationshipId, memberId) {
    await assertMember(relationshipId, memberId)
    const capsule = capsules.find((item) => item.id === id && item.relationshipId === relationshipId && item.status !== 'deleted')
    return capsule ? copyForMember(capsule, getServerNow()) : null
  },
  async openCapsule(id, relationshipId, memberId) {
    await assertMember(relationshipId, memberId)
    const capsule = capsules.find((item) => item.id === id && item.relationshipId === relationshipId && item.status !== 'deleted')
    if (!capsule) throw new Error('Capsule not found')
    const serverNow = getServerNow()
    if (serverNow < capsule.unlockAt) throw new Error('还不能打开')
    if (capsule.openedAt === undefined) capsule.openedAt = serverNow
    capsule.status = 'opened'
    return { ...capsule, status: 'opened' }
  },
  async deleteRelationshipData(relationshipId): Promise<void> {
    for (let index = capsules.length - 1; index >= 0; index -= 1) {
      if (capsules[index].relationshipId === relationshipId) capsules.splice(index, 1)
    }
  }
}

export function getMockCapsules(): Capsule[] {
  const now = getServerNow()
  return capsules.map((item) => copyForMember(item, now))
}

export function clearMockCapsules(): void {
  capsules.length = 0
  nextId = 1
}

export function setMockServerTimeOffset(offsetMs: number): void {
  serverTimeOffsetMs = offsetMs
}

export function getMockServerTime(): number {
  return getServerNow()
}

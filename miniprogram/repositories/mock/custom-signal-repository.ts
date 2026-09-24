import type { CustomSignal, CreateCustomSignalInput, UpdateCustomSignalInput } from '../../types'
import { mockRelationshipRepository } from './relationship-repository'
import { getMockUser } from './session-repository'
import type { CustomSignalRepository } from '../custom-signal-repository'

export const MAX_ENABLED_CUSTOM_SIGNALS = 10
const signals: CustomSignal[] = []
let nextId = 1

function copy(signal: CustomSignal): CustomSignal {
  return { ...signal }
}

async function assertMember(relationshipId: string, memberId: string): Promise<void> {
  const relationship = await mockRelationshipRepository.getRelationship(relationshipId)
  if (!relationship || relationship.status !== 'active') throw new Error('Active relationship not found')
  if ((relationship.userAId !== memberId && relationship.userBId !== memberId) || !getMockUser(memberId)) {
    throw new Error('Only relationship members can access custom signals')
  }
}

function find(id: string, relationshipId: string): CustomSignal {
  const signal = signals.find((item) => item.id === id && item.relationshipId === relationshipId)
  if (!signal) throw new Error('Custom signal not found')
  return signal
}

function assertMaxOnEnable(relationshipId: string): void {
  const count = signals.filter((item) => item.relationshipId === relationshipId && item.enabled).length
  if (count >= MAX_ENABLED_CUSTOM_SIGNALS) throw new Error('最多保留 10 个暗号')
}

export const mockCustomSignalRepository: CustomSignalRepository = {
  async list(relationshipId, memberId) {
    await assertMember(relationshipId, memberId)
    return signals.filter((item) => item.relationshipId === relationshipId).map(copy)
  },
  async get(id, relationshipId, memberId) {
    await assertMember(relationshipId, memberId)
    const signal = signals.find((item) => item.id === id && item.relationshipId === relationshipId)
    return signal ? copy(signal) : null
  },
  async create(input: CreateCustomSignalInput) {
    await assertMember(input.relationshipId, input.createdBy)
    if (!input.emoji.trim() || !input.name.trim() || !input.meaning.trim()) throw new Error('暗号图标、名称和真正含义均为必填')
    assertMaxOnEnable(input.relationshipId)
    const now = Date.now()
    const signal: CustomSignal = {
      id: `mock-custom-signal-${nextId++}`,
      relationshipId: input.relationshipId,
      emoji: input.emoji,
      name: input.name.trim(),
      meaning: input.meaning.trim(),
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      enabled: true
    }
    signals.push(signal)
    return copy(signal)
  },
  async update(id, relationshipId, memberId, input: UpdateCustomSignalInput) {
    await assertMember(relationshipId, memberId)
    if (!input.emoji.trim() || !input.name.trim() || !input.meaning.trim()) throw new Error('暗号图标、名称和真正含义均为必填')
    const signal = find(id, relationshipId)
    signal.emoji = input.emoji
    signal.name = input.name.trim()
    signal.meaning = input.meaning.trim()
    signal.updatedAt = Date.now()
    return copy(signal)
  },
  async setEnabled(id, relationshipId, memberId, enabled) {
    await assertMember(relationshipId, memberId)
    const signal = find(id, relationshipId)
    if (enabled && !signal.enabled) assertMaxOnEnable(relationshipId)
    signal.enabled = enabled
    signal.updatedAt = Date.now()
    return copy(signal)
  },
  async delete(id, relationshipId, memberId) {
    await assertMember(relationshipId, memberId)
    const index = signals.findIndex((item) => item.id === id && item.relationshipId === relationshipId)
    if (index < 0) throw new Error('Custom signal not found')
    signals.splice(index, 1)
  },
  async deleteRelationshipData(relationshipId): Promise<void> {
    for (let index = signals.length - 1; index >= 0; index -= 1) {
      if (signals[index].relationshipId === relationshipId) signals.splice(index, 1)
    }
  }
}

export function getMockCustomSignals(): CustomSignal[] {
  return signals.map(copy)
}

export function clearMockCustomSignals(): void {
  signals.length = 0
  nextId = 1
}

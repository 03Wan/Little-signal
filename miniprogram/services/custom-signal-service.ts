import { mockCustomSignalRepository } from '../repositories/mock/index'
import type { CustomSignal, CreateCustomSignalInput, UpdateCustomSignalInput } from '../types'
import { getCurrentActiveRelationship } from './relationship-service'
import { getCurrentMockUser } from './signal-service'

export const MAX_ENABLED_CUSTOM_SIGNALS = 10

async function getContext() {
  const user = getCurrentMockUser()
  const relationship = await getCurrentActiveRelationship()
  if (!relationship) throw new Error('请先建立关系连接')
  return { user, relationship }
}

export async function listCustomSignals(): Promise<CustomSignal[]> {
  const { user, relationship } = await getContext()
  return mockCustomSignalRepository.list(relationship.id, user.id)
}

export async function listEnabledCustomSignals(): Promise<CustomSignal[]> {
  return (await listCustomSignals()).filter((item) => item.enabled)
}

export async function getCustomSignal(id: string): Promise<CustomSignal | null> {
  const { user, relationship } = await getContext()
  return mockCustomSignalRepository.get(id, relationship.id, user.id)
}

export async function createCustomSignal(input: Omit<CreateCustomSignalInput, 'relationshipId' | 'createdBy'>): Promise<CustomSignal> {
  const { user, relationship } = await getContext()
  return mockCustomSignalRepository.create({ ...input, relationshipId: relationship.id, createdBy: user.id })
}

export async function updateCustomSignal(id: string, input: UpdateCustomSignalInput): Promise<CustomSignal> {
  const { user, relationship } = await getContext()
  return mockCustomSignalRepository.update(id, relationship.id, user.id, input)
}

export async function setCustomSignalEnabled(id: string, enabled: boolean): Promise<CustomSignal> {
  const { user, relationship } = await getContext()
  return mockCustomSignalRepository.setEnabled(id, relationship.id, user.id, enabled)
}

export async function deleteCustomSignal(id: string): Promise<void> {
  const { user, relationship } = await getContext()
  return mockCustomSignalRepository.delete(id, relationship.id, user.id)
}

import type { CustomSignal, CreateCustomSignalInput, UpdateCustomSignalInput } from '../types'

export interface CustomSignalRepository {
  list(relationshipId: string, memberId: string): Promise<CustomSignal[]>
  get(id: string, relationshipId: string, memberId: string): Promise<CustomSignal | null>
  create(input: CreateCustomSignalInput): Promise<CustomSignal>
  update(id: string, relationshipId: string, memberId: string, input: UpdateCustomSignalInput): Promise<CustomSignal>
  setEnabled(id: string, relationshipId: string, memberId: string, enabled: boolean): Promise<CustomSignal>
  delete(id: string, relationshipId: string, memberId: string): Promise<void>
  deleteRelationshipData(relationshipId: string): Promise<void>
}

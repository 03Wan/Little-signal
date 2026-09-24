import type { Capsule, CreateCapsuleInput } from '../types'

export interface CapsuleRepository {
  getServerTime(): Promise<number>
  createCapsule(input: CreateCapsuleInput): Promise<Capsule>
  listCapsules(relationshipId: string, memberId: string): Promise<Capsule[]>
  getCapsule(id: string, relationshipId: string, memberId: string): Promise<Capsule | null>
  openCapsule(id: string, relationshipId: string, memberId: string): Promise<Capsule>
  deleteRelationshipData(relationshipId: string): Promise<void>
}

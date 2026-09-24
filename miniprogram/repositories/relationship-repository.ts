import type { Relationship, RelationshipInvite, RelationshipInvitePreview } from '../types'

export interface RelationshipRepository {
  createInvite(inviterId: string): Promise<RelationshipInvite>
  getInvite(inviteId: string): Promise<RelationshipInvite | null>
  getInviteByCode(inviteCode: string): Promise<RelationshipInvitePreview | null>
  acceptInvite(inviteCode: string, accepterId: string): Promise<Relationship>
  getActiveRelationship(userId: string): Promise<Relationship | null>
  getRelationship(relationshipId: string): Promise<Relationship | null>
  updateRelationshipName(relationshipId: string, name: string): Promise<Relationship>
  endRelationship(relationshipId: string): Promise<void>
}

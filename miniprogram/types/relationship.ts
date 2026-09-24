export type RelationshipStatus = 'pending' | 'active' | 'ended'
export type RelationshipInviteStatus = 'pending' | 'accepted' | 'expired' | 'cancelled'

export interface Relationship {
  id: string
  userAId: string
  userBId: string
  name?: string
  createdAt: number
  updatedAt: number
  anniversaryDate?: number
  status: RelationshipStatus
}

export interface RelationshipInvite {
  id: string
  inviterId: string
  inviteCode: string
  createdAt: number
  expiresAt: number
  acceptedBy?: string
  acceptedAt?: number
  status: RelationshipInviteStatus
}

export interface RelationshipInvitePreview {
  invite: RelationshipInvite
  inviterName: string
}

export interface InviteSharePayload {
  title: string
  path: string
  inviteCode: string
  expiresAt: number
}

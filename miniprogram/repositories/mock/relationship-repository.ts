import type { Relationship, RelationshipInvite, RelationshipInvitePreview, RelationshipInviteStatus } from '../../types'
import { getMockUser } from './session-repository'
import type { RelationshipRepository } from '../relationship-repository'

export const INVITE_VALIDITY_MS = 24 * 60 * 60 * 1000

const invites: RelationshipInvite[] = []
const relationships: Relationship[] = []
let nextInviteId = 1
let nextRelationshipId = 1

function copyInvite(invite: RelationshipInvite): RelationshipInvite {
  return { ...invite }
}

function getCurrentInviteStatus(invite: RelationshipInvite, now: number): RelationshipInviteStatus {
  if (invite.status === 'pending' && invite.expiresAt <= now) invite.status = 'expired'
  return invite.status
}

function hasActiveRelationship(userId: string): boolean {
  return relationships.some((relationship) => relationship.status === 'active' && (relationship.userAId === userId || relationship.userBId === userId))
}

function generateInviteCode(): string {
  let code = ''
  do {
    code = `${Math.floor(100000 + Math.random() * 900000)}`
  } while (invites.some((invite) => invite.inviteCode === code))
  return code
}

export const mockRelationshipRepository: RelationshipRepository = {
  async createInvite(inviterId): Promise<RelationshipInvite> {
    if (!getMockUser(inviterId)) throw new Error('User not found')
    if (hasActiveRelationship(inviterId)) throw new Error('User already has an active relationship')
    const now = Date.now()
    invites.forEach((invite) => {
      if (invite.inviterId === inviterId && getCurrentInviteStatus(invite, now) === 'pending') invite.status = 'cancelled'
    })
    const invite: RelationshipInvite = {
      id: `mock-invite-${nextInviteId++}`,
      inviterId,
      inviteCode: generateInviteCode(),
      createdAt: now,
      expiresAt: now + INVITE_VALIDITY_MS,
      status: 'pending'
    }
    invites.push(invite)
    return copyInvite(invite)
  },
  async getInvite(inviteId): Promise<RelationshipInvite | null> {
    const invite = invites.find((item) => item.id === inviteId)
    if (!invite) return null
    getCurrentInviteStatus(invite, Date.now())
    return copyInvite(invite)
  },
  async getInviteByCode(inviteCode): Promise<RelationshipInvitePreview | null> {
    const normalizedCode = inviteCode.replace(/\s+/g, '').toUpperCase()
    const invite = invites.find((item) => item.inviteCode.toUpperCase() === normalizedCode)
    if (!invite) return null
    getCurrentInviteStatus(invite, Date.now())
    return { invite: copyInvite(invite), inviterName: getMockUser(invite.inviterId)?.name ?? '小信号用户' }
  },
  async acceptInvite(inviteCode, accepterId): Promise<Relationship> {
    const normalizedCode = inviteCode.replace(/\s+/g, '').toUpperCase()
    const invite = invites.find((item) => item.inviteCode.toUpperCase() === normalizedCode)
    if (!invite) throw new Error('Invite not found')
    if (getCurrentInviteStatus(invite, Date.now()) === 'expired') throw new Error('Invite expired')
    if (invite.status !== 'pending') throw new Error(`Invite is ${invite.status}`)
    if (invite.inviterId === accepterId) throw new Error('Cannot accept your own invite')
    if (!getMockUser(accepterId)) throw new Error('User not found')
    if (hasActiveRelationship(invite.inviterId) || hasActiveRelationship(accepterId)) {
      throw new Error('One of the users already has an active relationship')
    }

    const now = Date.now()
    const relationship: Relationship = {
      id: `mock-relationship-${nextRelationshipId++}`,
      userAId: invite.inviterId,
      userBId: accepterId,
      createdAt: now,
      updatedAt: now,
      status: 'active'
    }
    invite.status = 'accepted'
    invite.acceptedBy = accepterId
    invite.acceptedAt = now
    relationships.push(relationship)
    return { ...relationship }
  },
  async getActiveRelationship(userId): Promise<Relationship | null> {
    const relationship = relationships.find((item) => item.status === 'active' && (item.userAId === userId || item.userBId === userId))
    return relationship ? { ...relationship } : null
  },
  async getRelationship(relationshipId): Promise<Relationship | null> {
    const relationship = relationships.find((item) => item.id === relationshipId)
    return relationship ? { ...relationship } : null
  },
  async updateRelationshipName(relationshipId, name): Promise<Relationship> {
    const relationship = relationships.find((item) => item.id === relationshipId && item.status === 'active')
    if (!relationship) throw new Error('Active relationship not found')
    const normalizedName = name.trim()
    if (!normalizedName || normalizedName.length > 12) throw new Error('Relationship name must be between 1 and 12 characters')
    relationship.name = normalizedName
    relationship.updatedAt = Date.now()
    return { ...relationship }
  },
  async endRelationship(relationshipId): Promise<void> {
    const relationship = relationships.find((item) => item.id === relationshipId)
    if (!relationship || relationship.status !== 'active') throw new Error('Active relationship not found')
    relationship.status = 'ended'
    relationship.updatedAt = Date.now()
  }
}

export function getMockRelationshipInvites(): RelationshipInvite[] {
  const now = Date.now()
  invites.forEach((invite) => getCurrentInviteStatus(invite, now))
  return invites.map(copyInvite)
}

export function getMockRelationships(): Relationship[] {
  return relationships.map((relationship) => ({ ...relationship }))
}

export function clearMockRelationships(): void {
  invites.length = 0
  relationships.length = 0
  nextInviteId = 1
  nextRelationshipId = 1
}

export function expireMockInvite(inviteId: string): void {
  const invite = invites.find((item) => item.id === inviteId)
  if (invite) invite.expiresAt = Date.now() - 1
}

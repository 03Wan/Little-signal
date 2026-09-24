import { getMockCurrentUser, getMockPartner, mockCapsuleRepository, mockCustomSignalRepository, mockMoodRepository, mockPhotoMomentRepository, mockRelationshipRepository, mockSignalRepository } from '../repositories/mock/index'
import type { Relationship, RelationshipInvite, RelationshipInvitePreview } from '../types'

const creatingInviteUsers = new Set<string>()
const acceptingUsers = new Set<string>()

export function getCurrentRelationshipUser() {
  return getMockCurrentUser()
}

export function getRelationshipPartner(userId: string) {
  return getMockPartner(userId)
}

export function createRelationshipInvite(): Promise<RelationshipInvite> {
  const user = getMockCurrentUser()
  if (creatingInviteUsers.has(user.id)) return Promise.reject(new Error('Invite creation is in progress'))
  creatingInviteUsers.add(user.id)
  return mockRelationshipRepository.createInvite(user.id).finally(() => creatingInviteUsers.delete(user.id))
}

export function getRelationshipInvite(inviteId: string): Promise<RelationshipInvite | null> {
  return mockRelationshipRepository.getInvite(inviteId)
}

export function getInvitePreview(inviteCode: string): Promise<RelationshipInvitePreview | null> {
  return mockRelationshipRepository.getInviteByCode(inviteCode)
}

export function acceptRelationshipInvite(inviteCode: string): Promise<Relationship> {
  const user = getMockCurrentUser()
  if (acceptingUsers.has(user.id)) return Promise.reject(new Error('Invite acceptance is in progress'))
  acceptingUsers.add(user.id)
  return mockRelationshipRepository.acceptInvite(inviteCode, user.id).finally(() => acceptingUsers.delete(user.id))
}

export function getCurrentActiveRelationship(): Promise<Relationship | null> {
  return mockRelationshipRepository.getActiveRelationship(getMockCurrentUser().id)
}

export function getActiveRelationship(userId: string): Promise<Relationship | null> {
  return mockRelationshipRepository.getActiveRelationship(userId)
}

export function getRelationship(relationshipId: string): Promise<Relationship | null> {
  return mockRelationshipRepository.getRelationship(relationshipId)
}

export async function updateRelationshipName(relationshipId: string, name: string): Promise<Relationship> {
  const relationship = await mockRelationshipRepository.getRelationship(relationshipId)
  const currentUserId = getMockCurrentUser().id
  if (!relationship || relationship.status !== 'active') throw new Error('Active relationship not found')
  if (relationship.userAId !== currentUserId && relationship.userBId !== currentUserId) throw new Error('Only relationship members can rename this relationship')
  const normalizedName = name.trim()
  if (!normalizedName) throw new Error('关系名称不能为空')
  if (normalizedName.length > 12) throw new Error('关系名称最多 12 个字符')
  return mockRelationshipRepository.updateRelationshipName(relationshipId, normalizedName)
}

export async function endRelationship(relationshipId: string, deleteRelationshipRecords: boolean): Promise<void> {
  const relationship = await mockRelationshipRepository.getRelationship(relationshipId)
  if (!relationship || relationship.status !== 'active') throw new Error('Active relationship not found')
  if (deleteRelationshipRecords) {
    await Promise.all([
      mockSignalRepository.deleteRelationshipData(relationshipId),
      mockCustomSignalRepository.deleteRelationshipData(relationshipId),
      mockCapsuleRepository.deleteRelationshipData(relationshipId),
      mockPhotoMomentRepository.deleteRelationshipData(relationshipId),
      mockMoodRepository.deleteRelationshipData(relationshipId)
    ])
  }
  await mockRelationshipRepository.endRelationship(relationshipId)
}

export function getRelationshipUserNames(relationship: Relationship): { userAName: string; userBName: string } {
  return {
    userAName: getRelationshipPartner(relationship.userBId).name,
    userBName: getRelationshipPartner(relationship.userAId).name
  }
}

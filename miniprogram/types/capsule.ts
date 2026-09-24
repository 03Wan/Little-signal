export type CapsuleStatus = 'locked' | 'unlocked' | 'opened' | 'deleted'

export interface Capsule {
  id: string
  relationshipId: string
  senderId: string
  receiverId: string
  content?: string
  imageId?: string
  createdAt: number
  unlockAt: number
  openedAt?: number
  status: CapsuleStatus
}

export interface CreateCapsuleInput {
  relationshipId: string
  senderId: string
  receiverId: string
  content?: string
  imageId?: string
  unlockAt: number
}
